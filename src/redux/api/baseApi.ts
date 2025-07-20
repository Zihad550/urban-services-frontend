import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getIdToken } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "../../services/firebase";
import type { ApiError, ApiResponse } from "../../types/api";
import { logoutUser } from "../features/auth/authSlice";
import type { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8000/api/v1",
  prepareHeaders: async (headers, { getState }) => {
    const state = getState() as RootState;

    // Set default headers
    headers.set("content-type", "application/json");
    headers.set("accept", "application/json");

    // Add request ID for tracking
    headers.set("x-request-id", crypto.randomUUID());

    // Add user agent info
    headers.set("x-client-version", "1.0.0");
    headers.set("x-client-platform", "web");

    try {
      // Get fresh Firebase ID token if user is authenticated
      if (auth.currentUser && state.auth.isAuthenticated) {
        const token = await getIdToken(auth.currentUser, true); // Force refresh
        headers.set("authorization", token);

        // Update localStorage with fresh token
        localStorage.setItem("idToken", token);
      } else {
        // Fallback to stored token
        const storedToken = localStorage.getItem("idToken");
        if (storedToken) {
          headers.set("authorization", storedToken);
        }
      }
    } catch (error) {
      console.warn("Failed to get Firebase token:", error);
      // Remove invalid token from localStorage
      localStorage.removeItem("idToken");
    }

    return headers;
  },
  timeout: 30000, // 30 second timeout
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // First attempt
  let result = await baseQuery(args, api, extraOptions);

  // Handle different error scenarios
  if (result.error) {
    const error = result.error;
    const errorData = error.data as ApiError;

    switch (error.status) {
      case 401: {
        // Unauthorized - attempt token refresh
        console.log("Token expired, attempting refresh...");

        try {
          if (auth.currentUser) {
            // Get fresh token from Firebase
            const newToken = await getIdToken(auth.currentUser, true);
            localStorage.setItem("idToken", newToken);

            // Retry the original request with new token
            result = await baseQuery(args, api, extraOptions);

            if (!result.error) {
              console.log("Request succeeded after token refresh");
              return result;
            }
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }

        // If refresh failed or still unauthorized, logout user
        api.dispatch(logoutUser());
        toast.error("Session expired. Please login again.");
        break;
      }

      case 403: {
        // Forbidden - insufficient permissions
        const message =
          errorData?.message ||
          "Access forbidden. You don't have permission to perform this action.";
        toast.error(message);
        break;
      }

      case 404: {
        // Not found - resource doesn't exist
        const message = errorData?.message || "Resource not found.";
        toast.error(message);
        break;
      }

      case 409: {
        // Conflict - resource already exists or version conflict
        const message =
          errorData?.message ||
          "Conflict occurred. Please refresh and try again.";
        toast.error(message);
        break;
      }

      case 422: {
        // Validation error - don't show toast, let component handle
        console.warn("Validation error:", errorData);
        break;
      }

      case 429: {
        // Rate limited
        const message =
          errorData?.message ||
          "Too many requests. Please wait a moment and try again.";
        toast.error(message);
        break;
      }

      case 500:
      case 502:
      case 503:
      case 504: {
        // Server errors
        const message =
          errorData?.message ||
          "Server error occurred. Please try again later.";
        toast.error(message);
        break;
      }

      default: {
        // Network or other errors
        if (error.status === "FETCH_ERROR") {
          toast.error(
            "Network error. Please check your connection and try again.",
          );
        } else if (error.status === "TIMEOUT_ERROR") {
          toast.error("Request timed out. Please try again.");
        } else if (error.status === "PARSING_ERROR") {
          toast.error("Invalid response from server. Please try again.");
        } else {
          // Generic error
          const message = errorData?.message || "An unexpected error occurred.";
          toast.error(message);
        }
        break;
      }
    }
  }

  return result;
};

// Transform response helper to extract data from API wrapper
const transformResponse = <T>(response: ApiResponse<T>): T => {
  return response.data;
};

// Transform error response helper
const transformErrorResponse = (response: FetchBaseQueryError) => {
  const errorData = response.data as ApiError;
  return {
    status: response.status,
    message: errorData?.message || "An error occurred",
    code: errorData?.code,
    details: errorData?.details,
    timestamp: errorData?.timestamp,
    requestId: errorData?.requestId,
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,

  tagTypes: [
    // User management
    "User",
    "Customer",
    "Worker",
    "Admin",
    "UserProfile",
    "UserPreferences",

    // Service management
    "Service",
    "ServiceCategory",
    "ServiceProvider",
    "ServiceReview",
    "ServiceAvailability",

    // Booking system
    "Booking",
    "BookingHistory",
    "BookingStatus",
    "BookingPayment",

    // Property rentals
    "ToLet",
    "Property",
    "PropertyImages",
    "PropertyReview",
    "RentalApplication",

    // Reviews and ratings
    "Review",
    "Rating",
    "Feedback",

    // Notifications
    "Notification",
    "Alert",
    "Message",

    // Analytics and reporting
    "Analytics",
    "Report",
    "Dashboard",

    // System management
    "Application",
    "Configuration",
    "Audit",
  ],

  // Global cache configuration
  keepUnusedDataFor: 60, // Keep unused data for 60 seconds
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  refetchOnFocus: true, // Refetch when window regains focus
  refetchOnReconnect: true, // Refetch when network reconnects

  // Empty endpoints object - will be injected by feature slices
  endpoints: () => ({}),
});

// Export useful utilities for other API slices
export { transformErrorResponse, transformResponse };

// Export hooks for manual cache management
export const {
  util: {
    getRunningQueriesThunk,
    resetApiState,
    invalidateTags,
    selectInvalidatedBy,
    selectCachedArgsForQuery,
  },
} = baseApi;
