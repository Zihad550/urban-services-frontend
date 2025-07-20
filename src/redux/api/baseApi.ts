import {
    type BaseQueryApi,
    type BaseQueryFn,
    type DefinitionType,
    type FetchArgs,
    createApi,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { logout, setUser } from "../features/auth/authSlice";
import type { RootState } from "../store";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;

        if (token) {
            headers.set("authorization", token);
        }

        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    FetchArgs,
    BaseQueryApi,
    DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 404) {
        toast.error((result?.error?.data as any)?.message || "Resource not found");
    }

    if (result?.error?.status === 403) {
        toast.error((result?.error?.data as any)?.message || "Access forbidden");
    }

    if (result?.error?.status === 401) {
        // Try to refresh token
        const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);

        if (refreshResult.data) {
            const user = (api.getState() as RootState).auth.user;

            if (user) {
                api.dispatch(
                    setUser({
                        user,
                        token: (refreshResult.data as unknown).accessToken,
                    }),
                );

                // Retry original query
                result = await baseQuery(args, api, extraOptions);
            } else {
                api.dispatch(logout());
                toast.error("Session expired. Please login again.");
            }
        } else {
            // Refresh failed, logout user
            api.dispatch(logout());
            toast.error("Session expired. Please login again.");
        }
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
    ],
    endpoints: () => ({}),
});
