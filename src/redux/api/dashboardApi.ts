import type { ApiResponse } from "@/types/api";
import { baseApi, transformResponse } from "./baseApi";

// Dashboard statistics types
export interface DashboardStats {
    totalCustomers: number;
    totalWorkers: number;
    totalServices: number;
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    recentBookings: any[]; // This would be typed properly in a real implementation
    topServices: {
        id: string;
        name: string;
        bookings: number;
        revenue: number;
    }[];
    topWorkers: {
        id: string;
        name: string;
        bookings: number;
        rating: number;
    }[];
}

export interface AdminDashboardRequest {
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

// Dashboard API slice
export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get admin dashboard statistics
        getAdminDashboardStats: builder.query<DashboardStats, AdminDashboardRequest>({
            query: (params) => {
                const queryString = params.dateRange
                    ? `?startDate=${params.dateRange.startDate}&endDate=${params.dateRange.endDate}`
                    : '';
                return {
                    url: `/dashboard/admin${queryString}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: ApiResponse<DashboardStats>) => transformResponse(response),
            providesTags: ['Dashboard', 'Analytics'],
        }),

        // Get worker dashboard statistics
        getWorkerDashboardStats: builder.query<any, { workerId: string }>({
            query: ({ workerId }) => ({
                url: `/dashboard/worker/${workerId}`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<any>) => transformResponse(response),
            providesTags: (result, _error, { workerId }) => [
                { type: 'Dashboard' as any, id: `worker-${workerId}` },
                { type: 'Analytics' as any, id: `worker-${workerId}` },
            ],
        }),

        // Get customer dashboard statistics
        getCustomerDashboardStats: builder.query<any, { customerId: string }>({
            query: ({ customerId }) => ({
                url: `/dashboard/customer/${customerId}`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<any>) => transformResponse(response),
            providesTags: (result, _error, { customerId }) => [
                { type: 'Dashboard' as any, id: `customer-${customerId}` },
                { type: 'Analytics' as any, id: `customer-${customerId}` },
            ],
        }),
    }),
});

export const {
    useGetAdminDashboardStatsQuery,
    useGetWorkerDashboardStatsQuery,
    useGetCustomerDashboardStatsQuery,
} = dashboardApi;

export const {
    getAdminDashboardStats,
    getWorkerDashboardStats,
    getCustomerDashboardStats,
} = dashboardApi.endpoints;