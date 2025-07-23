import type {
    ApiResponse,
    ListRequest,
    PaginatedResponse,
} from "../../types/api";
import type {
    Service,
    ServiceCategory,
    ServiceFilters,
    ServicePackage,
    ServiceReview,
    ServiceSearchResult,
    ServiceStats,
} from "../../types/service";
import {
    createItemCacheTags,
    createItemInvalidationTags,
    createListCacheTags,
    createQueryString
} from "./apiUtils";
import { baseApi, transformResponse } from "./baseApi";

// Request/Response types specific to services API
export interface GetServicesRequest extends ListRequest {
    category?: string;
    isActive?: boolean;
    priceRange?: {
        min: number;
        max: number;
    };
    tags?: string[];
}

export interface GetServiceByIdRequest {
    id: string;
}

export interface GetServicesByCategoryRequest extends Omit<ListRequest, 'filters'> {
    categoryId: string;
}

export interface GetServiceReviewsRequest {
    serviceId: string;
    page?: number;
    limit?: number;
}

export interface SearchServicesRequest extends ListRequest {
    query?: string;
    filters?: ServiceFilters;
}

export interface GetServicePackagesRequest {
    serviceId: string;
}

export interface GetServiceStatsRequest {
    serviceId: string;
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

// Services API slice
export const servicesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all services with filtering
        getServices: builder.query<
            { data: Service[]; pagination: PaginatedResponse<Service>['pagination'] },
            GetServicesRequest
        >({
            query: (params) => {
                const queryString = createQueryString(params);
                return {
                    url: `/services${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Service>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result ? createListCacheTags('Service', result.data) : [{ type: 'Service' as any, id: 'LIST' }],
        }),

        // Get service by ID
        getServiceById: builder.query<Service, GetServiceByIdRequest>({
            query: ({ id }) => ({
                url: `/services/${id}`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<Service>) => transformResponse(response),
            providesTags: (result, _error, { id }) =>
                result ? createItemCacheTags('Service', id) : [],
        }),

        // Get service categories
        getServiceCategories: builder.query<ServiceCategory[], void>({
            query: () => ({
                url: '/services/categories',
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<ServiceCategory[]>) => transformResponse(response),
            providesTags: (result) =>
                result ? [
                    ...result.map(({ id }) => ({ type: 'ServiceCategory' as any, id })),
                    { type: 'ServiceCategory' as any, id: 'LIST' },
                ] : [{ type: 'ServiceCategory' as any, id: 'LIST' }],
        }),

        // Get services by category
        getServicesByCategory: builder.query<
            { data: Service[]; pagination: PaginatedResponse<Service>['pagination'] },
            GetServicesByCategoryRequest
        >({
            query: ({ categoryId, ...params }) => {
                const queryString = createQueryString(params);
                return {
                    url: `/services/by-category/${categoryId}${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Service>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result, _error, { categoryId }) =>
                result ? [
                    ...createListCacheTags('Service', result.data),
                    { type: 'ServiceCategory' as any, id: categoryId },
                ] : [{ type: 'ServiceCategory' as any, id: categoryId }],
        }),

        // Get service reviews
        getServiceReviews: builder.query<
            { data: ServiceReview[]; pagination: PaginatedResponse<ServiceReview>['pagination'] },
            GetServiceReviewsRequest
        >({
            query: ({ serviceId, page = 1, limit = 10 }) => ({
                url: `/services/${serviceId}/reviews`,
                method: 'GET',
                params: { page, limit },
            }),
            transformResponse: (response: PaginatedResponse<ServiceReview>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result, _error, { serviceId }) =>
                result ? [
                    ...result.data.map(({ id }) => ({ type: 'ServiceReview' as any, id })),
                    { type: 'ServiceReview' as any, id: serviceId },
                ] : [{ type: 'ServiceReview' as any, id: serviceId }],
        }),

        // Search services with advanced filters
        searchServices: builder.query<
            ServiceSearchResult,
            SearchServicesRequest
        >({
            query: (params) => {
                const queryString = createQueryString(params);
                return {
                    url: `/services/search${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: ApiResponse<ServiceSearchResult>) => transformResponse(response),
            providesTags: (result) =>
                result ? [
                    ...createListCacheTags('Service', result.services),
                    { type: 'Service' as any, id: 'SEARCH' },
                ] : [{ type: 'Service' as any, id: 'SEARCH' }],
        }),

        // Get service packages
        getServicePackages: builder.query<ServicePackage[], GetServicePackagesRequest>({
            query: ({ serviceId }) => ({
                url: `/services/${serviceId}/packages`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<ServicePackage[]>) => transformResponse(response),
            providesTags: (result, _error, { serviceId }) =>
                result ? [
                    ...result.map(({ id }) => ({ type: 'ServicePackage' as any, id })),
                    { type: 'ServicePackage' as any, id: serviceId },
                ] : [{ type: 'ServicePackage' as any, id: serviceId }],
        }),

        // Get service statistics
        getServiceStats: builder.query<ServiceStats, GetServiceStatsRequest>({
            query: ({ serviceId, dateRange }) => {
                const queryString = dateRange ? createQueryString(dateRange) : '';
                return {
                    url: `/services/${serviceId}/stats${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: ApiResponse<ServiceStats>) => transformResponse(response),
            providesTags: (_result, _error, { serviceId }) => [
                { type: 'Analytics' as any, id: `service-${serviceId}` },
            ],
        }),
    }),
});

export const {
    useGetServicesQuery,
    useGetServiceByIdQuery,
    useGetServiceCategoriesQuery,
    useGetServicesByCategoryQuery,
    useGetServiceReviewsQuery,
    useSearchServicesQuery,
    useGetServicePackagesQuery,
    useGetServiceStatsQuery,
} = servicesApi;

export const {
    getServices,
    getServiceById,
    getServiceCategories,
    getServicesByCategory,
    getServiceReviews,
    searchServices,
    getServicePackages,
    getServiceStats,
} = servicesApi.endpoints;