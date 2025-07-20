import {
  type BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { logoutUser } from "../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8000/api/v1",
  prepareHeaders: (headers) => {
    // Get Firebase ID token from localStorage
    const token = localStorage.getItem("idToken");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("content-type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 404) {
    toast.error(
      (result?.error?.data as { message?: string })?.message ||
        "Resource not found",
    );
  }

  if (result?.error?.status === 403) {
    toast.error(
      (result?.error?.data as { message?: string })?.message ||
        "Access forbidden",
    );
  }

  if (result?.error?.status === 401) {
    api.dispatch(logoutUser());
    toast.error("Session expired. Please login again.");
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Worker",
    "Service",
    "Booking",
    "ToLet",
    "Admin",
    "Customer",
    "ServiceCategory",
    "Application",
  ],
  endpoints: () => ({}),
});
