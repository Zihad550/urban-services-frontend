import type { Pagination } from './common';

// Generic API response wrapper
export interface ApiResponse<T = any> {
    data: T;
    message: string;
    success: boolean;
    timestamp: string;
    requestId?: string;
}

// Paginated API response
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: Pagination;
}

// API error response
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
    path?: string;
}

// RTK Query base query types
export interface BaseQueryError {
    status: number;
    data: ApiError;
}

export interface BaseQueryMeta {
    request: Request;
    response: Response;
}

// API endpoint configuration
export interface ApiEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    requiresAuth: boolean;
    rateLimit?: {
        requests: number;
        windowMs: number;
    };
}

// Request/Response types for common operations
export interface ListRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
    search?: string;
}

export interface ListResponse<T> extends PaginatedResponse<T> {
    filters: Record<string, any>;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface CreateRequest<T> {
    data: T;
}

export interface CreateResponse<T> extends ApiResponse<T> {
    created: true;
}

export interface UpdateRequest<T> {
    id: string;
    data: Partial<T>;
}

export interface UpdateResponse<T> extends ApiResponse<T> {
    updated: true;
}

export interface DeleteRequest {
    id: string;
}

export interface DeleteResponse extends ApiResponse<null> {
    deleted: true;
}

// Authentication API types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse extends ApiResponse {
    data: {
        user: any; // Will be typed with User type
        token: string;
        refreshToken: string;
        expiresIn: number;
    };
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse extends ApiResponse {
    data: {
        token: string;
        refreshToken: string;
        expiresIn: number;
    };
}

// File upload types
export interface FileUploadRequest {
    file: File;
    category: 'profile' | 'portfolio' | 'service' | 'document';
    metadata?: Record<string, any>;
}

export interface FileUploadResponse extends ApiResponse {
    data: {
        url: string;
        filename: string;
        size: number;
        mimeType: string;
        uploadedAt: string;
    };
}

// Search API types
export interface SearchRequest {
    query: string;
    type?: 'services' | 'workers' | 'all';
    filters?: Record<string, any>;
    location?: {
        latitude: number;
        longitude: number;
        radius?: number;
    };
    page?: number;
    limit?: number;
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
    query: string;
    suggestions: string[];
    facets: Record<string, Array<{ value: string; count: number }>>;
}

// Notification API types
export interface NotificationRequest {
    userId: string;
    type: 'booking' | 'payment' | 'system' | 'marketing';
    title: string;
    message: string;
    data?: Record<string, any>;
    channels: ('push' | 'email' | 'sms')[];
}

export interface NotificationResponse extends ApiResponse {
    data: {
        notificationId: string;
        sentAt: string;
        channels: {
            push?: { status: 'sent' | 'failed'; messageId?: string };
            email?: { status: 'sent' | 'failed'; messageId?: string };
            sms?: { status: 'sent' | 'failed'; messageId?: string };
        };
    };
}

// Analytics API types
export interface AnalyticsRequest {
    metric: string;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    granularity: 'hour' | 'day' | 'week' | 'month';
    filters?: Record<string, any>;
}

export interface AnalyticsResponse extends ApiResponse {
    data: {
        metric: string;
        dataPoints: Array<{
            timestamp: string;
            value: number;
            metadata?: Record<string, any>;
        }>;
        summary: {
            total: number;
            average: number;
            min: number;
            max: number;
            trend: 'up' | 'down' | 'stable';
        };
    };
}

// Webhook types
export interface WebhookPayload<T = any> {
    event: string;
    data: T;
    timestamp: string;
    signature: string;
    version: string;
}

export interface WebhookResponse {
    received: boolean;
    processedAt: string;
}

// Rate limiting types
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

// API configuration types
export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    headers: Record<string, string>;
    interceptors: {
        request: Array<(config: any) => any>;
        response: Array<(response: any) => any>;
    };
}

// Cache configuration for RTK Query
export interface CacheConfig {
    keepUnusedDataFor: number; // seconds
    refetchOnMountOrArgChange: boolean | number;
    refetchOnFocus: boolean;
    refetchOnReconnect: boolean;
    pollingInterval?: number;
}

// Tag types for RTK Query cache invalidation
export type ApiTags =
    | 'User'
    | 'Worker'
    | 'Service'
    | 'Booking'
    | 'Payment'
    | 'Review'
    | 'Notification'
    | 'Analytics'
    | 'ToLet';

// RTK Query endpoint definition helper
export interface EndpointDefinition<QueryArg, ResultType> {
    query: (arg: QueryArg) => {
        url: string;
        method?: string;
        body?: any;
        params?: Record<string, any>;
    };
    transformResponse?: (response: ApiResponse<ResultType>) => ResultType;
    transformErrorResponse?: (response: BaseQueryError) => any;
    providesTags?: ApiTags[] | ((result: ResultType, error: any, arg: QueryArg) => ApiTags[]);
    invalidatesTags?: ApiTags[] | ((result: ResultType, error: any, arg: QueryArg) => ApiTags[]);
}