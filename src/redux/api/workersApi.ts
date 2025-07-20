import type {
    ApiResponse,
    ListRequest,
    PaginatedResponse,
} from "../../types/api";
import type {
    Availability,
    PortfolioItem,
    Worker,
    WorkingStatus
} from "../../types/user";
import {
    createItemCacheTags,
    createItemInvalidationTags,
    createListCacheTags,
    createQueryString
} from "./apiUtils";
import { baseApi, transformResponse } from "./baseApi";

// Request/Response types specific to workers API
export interface GetWorkersRequest extends ListRequest {
    serviceCategory?: string;
    location?: string;
    minRating?: number;
    maxHourlyRate?: number;
    experienceYears?: number;
    availability?: 'available' | 'busy' | 'all';
    serviceAreas?: string[];
}

export interface GetWorkerByIdRequest {
    id: string;
}

export interface UpdateWorkerStatusRequest {
    id: string;
    workingStatus: WorkingStatus;
}

export interface UpdateWorkerProfileRequest {
    id: string;
    data: Partial<Pick<Worker,
        | 'services'
        | 'availability'
        | 'hourlyRate'
        | 'experienceYears'
        | 'certifications'
        | 'serviceAreas'
        | 'portfolio'
        | 'displayName'
        | 'phoneNumber'
        | 'address'
        | 'photoURL'
    >>;
}

export interface AddPortfolioItemRequest {
    workerId: string;
    portfolioItem: Omit<PortfolioItem, 'id'>;
}

export interface UpdatePortfolioItemRequest {
    workerId: string;
    portfolioItemId: string;
    data: Partial<Omit<PortfolioItem, 'id'>>;
}

export interface DeletePortfolioItemRequest {
    workerId: string;
    portfolioItemId: string;
}

export interface UpdateWorkerAvailabilityRequest {
    id: string;
    availability: Availability;
}

export interface GetWorkersByServiceRequest extends Omit<ListRequest, 'filters'> {
    serviceId: string;
    location?: string;
    radius?: number; // in kilometers
}

export interface GetWorkerStatsRequest {
    id: string;
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

export interface WorkerStats {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    averageRating: number;
    totalRatings: number;
    totalEarnings: number;
    monthlyEarnings: number;
    responseTime: number; // average response time in minutes
    completionRate: number; // percentage
}

// Workers API slice
export const workersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all workers with advanced filtering
        getWorkers: builder.query<
            { data: Worker[]; pagination: PaginatedResponse<Worker>['pagination'] },
            GetWorkersRequest
        >({
            query: (params) => {
                const queryString = createQueryString({
                    ...params,
                    role: 'worker', // Ensure we only get workers
                });
                return {
                    url: `/workers${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Worker>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result ? createListCacheTags('Worker', result.data) : [{ type: 'Worker' as any, id: 'LIST' }],
        }),

        // Get available workers (Free status)
        getAvailableWorkers: builder.query<
            { data: Worker[]; pagination: PaginatedResponse<Worker>['pagination'] },
            Omit<GetWorkersRequest, 'availability'>
        >({
            query: (params) => {
                const queryString = createQueryString({
                    ...params,
                    workingStatus: 'Free',
                });
                return {
                    url: `/workers/available${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Worker>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result ? [
                    ...createListCacheTags('Worker', result.data),
                    { type: 'Worker' as any, id: 'AVAILABLE' },
                ] : [{ type: 'Worker' as any, id: 'AVAILABLE' }],
        }),

        // Get busy workers (Busy status)
        getBusyWorkers: builder.query<
            { data: Worker[]; pagination: PaginatedResponse<Worker>['pagination'] },
            Omit<GetWorkersRequest, 'availability'>
        >({
            query: (params) => {
                const queryString = createQueryString({
                    ...params,
                    workingStatus: 'Busy',
                });
                return {
                    url: `/workers/busy${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Worker>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result ? [
                    ...createListCacheTags('Worker', result.data),
                    { type: 'Worker' as any, id: 'BUSY' },
                ] : [{ type: 'Worker' as any, id: 'BUSY' }],
        }),

        // Get worker by ID with detailed information
        getWorkerById: builder.query<Worker, GetWorkerByIdRequest>({
            query: ({ id }) => ({
                url: `/workers/${id}`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<Worker>) => transformResponse(response),
            providesTags: (result, _error, { id }) =>
                result ? createItemCacheTags('Worker', id) : [],
        }),

        // Get workers by service category
        getWorkersByService: builder.query<
            { data: Worker[]; pagination: PaginatedResponse<Worker>['pagination'] },
            GetWorkersByServiceRequest
        >({
            query: ({ serviceId, ...params }) => {
                const queryString = createQueryString(params);
                return {
                    url: `/workers/by-service/${serviceId}${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Worker>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result, _error, { serviceId }) =>
                result ? [
                    ...createListCacheTags('Worker', result.data),
                    { type: 'ServiceProvider' as any, id: serviceId },
                ] : [{ type: 'ServiceProvider' as any, id: serviceId }],
        }),

        // Update worker status (Free/Busy)
        updateWorkerStatus: builder.mutation<Worker, UpdateWorkerStatusRequest>({
            query: ({ id, workingStatus }) => ({
                url: `/workers/${id}/status`,
                method: 'PATCH',
                body: { workingStatus },
            }),
            transformResponse: (response: ApiResponse<Worker>) => transformResponse(response),
            invalidatesTags: (result, _error, { id }) =>
                result ? [
                    ...createItemInvalidationTags('Worker', id),
                    { type: 'Worker' as any, id: 'AVAILABLE' },
                    { type: 'Worker' as any, id: 'BUSY' },
                    { type: 'Worker' as any, id: 'LIST' },
                ] : [],
            // Optimistic update for better UX
            onQueryStarted: async ({ id, workingStatus }, { dispatch, queryFulfilled }) => {
                // Update the individual worker cache
                const patchResult = dispatch(
                    workersApi.util.updateQueryData('getWorkerById', { id }, (draft) => {
                        if (draft) {
                            draft.workingStatus = workingStatus;
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    // Revert optimistic update on error
                    patchResult.undo();
                }
            },
        }),

        // Update worker profile information
        updateWorkerProfile: builder.mutation<Worker, UpdateWorkerProfileRequest>({
            query: ({ id, data }) => ({
                url: `/workers/${id}/profile`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: ApiResponse<Worker>) => transformResponse(response),
            invalidatesTags: (result, _error, { id }) =>
                result ? [
                    ...createItemInvalidationTags('Worker', id),
                    { type: 'Worker' as any, id: 'LIST' },
                ] : [],
        }),

        // Update worker availability schedule
        updateWorkerAvailability: builder.mutation<Worker, UpdateWorkerAvailabilityRequest>({
            query: ({ id, availability }) => ({
                url: `/workers/${id}/availability`,
                method: 'PUT',
                body: { availability },
            }),
            transformResponse: (response: ApiResponse<Worker>) => transformResponse(response),
            invalidatesTags: (result, _error, { id }) =>
                result ? [
                    ...createItemInvalidationTags('Worker', id),
                    { type: 'ServiceAvailability' as any, id },
                ] : [],
        }),

        // Add portfolio item
        addPortfolioItem: builder.mutation<Worker, AddPortfolioItemRequest>({
            query: ({ workerId, portfolioItem }) => ({
                url: `/workers/${workerId}/portfolio`,
                method: 'POST',
                body: portfolioItem,
            }),
            transformResponse: (response: ApiResponse<Worker>) => transformResponse(response),
            invalidatesTags: (result, _error, { workerId }) =>
                result ? [
                    ...createItemInvalidationTags('Worker', workerId),
                ] : [],
        }),

        // Update portfolio item
        updatePortfolioItem: builder.mutation<Worker, UpdatePortfolioItemRequest>({
            query: ({ workerId, portfolioItemId, data }) => ({
                url: `/workers/${workerId}/portfolio/${portfolioItemId}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: ApiResponse<Worker>) => transformResponse(response),
            invalidatesTags: (result, _error, { workerId }) =>
                result ? [
                    ...createItemInvalidationTags('Worker', workerId),
                ] : [],
        }),

        // Delete portfolio item
        deletePortfolioItem: builder.mutation<Worker, DeletePortfolioItemRequest>({
            query: ({ workerId, portfolioItemId }) => ({
                url: `/workers/${workerId}/portfolio/${portfolioItemId}`,
                method: 'DELETE',
            }),
            transformResponse: (response: ApiResponse<Worker>) => transformResponse(response),
            invalidatesTags: (result, _error, { workerId }) =>
                result ? [
                    ...createItemInvalidationTags('Worker', workerId),
                ] : [],
        }),

        // Get worker statistics and performance metrics
        getWorkerStats: builder.query<WorkerStats, GetWorkerStatsRequest>({
            query: ({ id, dateRange }) => {
                const queryString = dateRange ? createQueryString(dateRange) : '';
                return {
                    url: `/workers/${id}/stats${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: ApiResponse<WorkerStats>) => transformResponse(response),
            providesTags: (_result, _error, { id }) => [
                { type: 'Analytics' as any, id: `worker-${id}` },
            ],
        }),

        // Search workers with advanced filters and location-based search
        searchWorkers: builder.query<
            { data: Worker[]; pagination: PaginatedResponse<Worker>['pagination'] },
            GetWorkersRequest & { query?: string }
        >({
            query: (params) => {
                const queryString = createQueryString(params);
                return {
                    url: `/workers/search${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Worker>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result ? createListCacheTags('Worker', result.data) : [{ type: 'Worker' as any, id: 'SEARCH' }],
        }),

        // Get top-rated workers
        getTopRatedWorkers: builder.query<
            { data: Worker[]; pagination: PaginatedResponse<Worker>['pagination'] },
            Omit<GetWorkersRequest, 'minRating'> & { limit?: number }
        >({
            query: (params) => {
                const queryString = createQueryString({
                    ...params,
                    sortBy: 'rating',
                    sortOrder: 'desc',
                    limit: params.limit || 10,
                });
                return {
                    url: `/workers/top-rated${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Worker>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result ? [
                    ...createListCacheTags('Worker', result.data),
                    { type: 'Worker' as any, id: 'TOP_RATED' },
                ] : [{ type: 'Worker' as any, id: 'TOP_RATED' }],
        }),
    }),
});

export const {
    useGetWorkersQuery,
    useGetAvailableWorkersQuery,
    useGetBusyWorkersQuery,
    useGetWorkerByIdQuery,
    useGetWorkersByServiceQuery,
    useUpdateWorkerStatusMutation,
    useUpdateWorkerProfileMutation,
    useUpdateWorkerAvailabilityMutation,
    useAddPortfolioItemMutation,
    useUpdatePortfolioItemMutation,
    useDeletePortfolioItemMutation,
    useGetWorkerStatsQuery,
    useSearchWorkersQuery,
    useGetTopRatedWorkersQuery,
} = workersApi;

export const {
    getWorkers,
    getAvailableWorkers,
    getBusyWorkers,
    getWorkerById,
    getWorkersByService,
    updateWorkerStatus,
    updateWorkerProfile,
    updateWorkerAvailability,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    getWorkerStats,
    searchWorkers,
    getTopRatedWorkers,
} = workersApi.endpoints;