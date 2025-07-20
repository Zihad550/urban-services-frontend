import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { ApiError, ApiResponse, PaginatedResponse } from "../../types/api";

/**
 * Type guard to check if an error is a FetchBaseQueryError
 */
export const isFetchBaseQueryError = (
    error: unknown
): error is FetchBaseQueryError => {
    return typeof error === "object" && error != null && "status" in error;
};

/**
 * Type guard to check if an error has error data
 */
export const isErrorWithMessage = (
    error: unknown
): error is { message: string } => {
    return (
        typeof error === "object" &&
        error != null &&
        "message" in error &&
        typeof (error as any).message === "string"
    );
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
    if (isFetchBaseQueryError(error)) {
        const errorData = error.data as ApiError;
        return errorData?.message || "An error occurred";
    }

    if (isErrorWithMessage(error)) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    return "An unexpected error occurred";
};

/**
 * Extract error code from API error
 */
export const getErrorCode = (error: unknown): string | undefined => {
    if (isFetchBaseQueryError(error)) {
        const errorData = error.data as ApiError;
        return errorData?.code;
    }
    return undefined;
};

/**
 * Check if error is a validation error (422)
 */
export const isValidationError = (error: unknown): boolean => {
    return isFetchBaseQueryError(error) && error.status === 422;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
    return isFetchBaseQueryError(error) && error.status === 401;
};

/**
 * Check if error is a permission error (403)
 */
export const isPermissionError = (error: unknown): boolean => {
    return isFetchBaseQueryError(error) && error.status === 403;
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
    return isFetchBaseQueryError(error) && error.status === 404;
};

/**
 * Check if error is a server error (5xx)
 */
export const isServerError = (error: unknown): boolean => {
    if (!isFetchBaseQueryError(error)) return false;
    const status = typeof error.status === "number" ? error.status : 0;
    return status >= 500 && status < 600;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
    return isFetchBaseQueryError(error) && error.status === "FETCH_ERROR";
};

/**
 * Transform paginated response to extract data and pagination info
 */
export const transformPaginatedResponse = <T>(
    response: PaginatedResponse<T>
): { data: T[]; pagination: PaginatedResponse<T>["pagination"] } => {
    return {
        data: response.data,
        pagination: response.pagination,
    };
};

/**
 * Create a standardized query string from parameters
 */
export const createQueryString = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
                value.forEach((item) => searchParams.append(key, String(item)));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    return searchParams.toString();
};

/**
 * Create cache tags for a list of items
 */
export const createListCacheTags = <T extends { id: string }>(
    tagType: string,
    items?: T[]
) => {
    const tags: any[] = [
        { type: tagType, id: "LIST" },
    ];

    if (items) {
        items.forEach((item) => {
            tags.push({ type: tagType, id: item.id });
        });
    }

    return tags;
};

/**
 * Create cache tags for a single item
 */
export const createItemCacheTags = (
    tagType: string,
    id: string
) => {
    return [{ type: tagType as any, id }];
};

/**
 * Create invalidation tags for list operations
 */
export const createListInvalidationTags = (
    tagType: string
) => {
    return [{ type: tagType as any, id: "LIST" as const }];
};

/**
 * Create invalidation tags for item operations
 */
export const createItemInvalidationTags = (
    tagType: string,
    id: string
) => {
    return [
        { type: tagType as any, id },
        { type: tagType as any, id: "LIST" as const },
    ];
};

/**
 * Retry configuration for failed requests
 */
export const retryCondition = (
    error: FetchBaseQueryError,
    attempt: number,
    maxRetries: number = 3
): boolean => {
    // Don't retry client errors (4xx) except for 408 (timeout) and 429 (rate limit)
    if (typeof error.status === "number") {
        if (error.status >= 400 && error.status < 500) {
            return error.status === 408 || error.status === 429;
        }
        // Retry server errors (5xx)
        if (error.status >= 500) {
            return attempt < maxRetries;
        }
    }

    // Retry network errors
    if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
        return attempt < maxRetries;
    }

    return false;
};

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
    return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
};

/**
 * Debounce function for search queries
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Validate file type and size
 */
export const validateFile = (
    file: File,
    allowedTypes: string[],
    maxSize: number
): { isValid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        };
    }

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`,
        };
    }

    return { isValid: true };
};

/**
 * Generate optimistic update ID
 */
export const generateOptimisticId = (): string => {
    return `optimistic_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Check if ID is optimistic
 */
export const isOptimisticId = (id: string): boolean => {
    return id.startsWith("optimistic_");
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (
    message: string,
    code?: string,
    details?: Record<string, any>
): ApiError => {
    return {
        code: code || "UNKNOWN_ERROR",
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
    };
};

/**
 * Create a standardized success response
 */
export const createSuccessResponse = <T>(
    data: T,
    message: string = "Success"
): ApiResponse<T> => {
    return {
        data,
        message,
        success: true,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
    };
};

/**
 * Merge query parameters with defaults
 */
export const mergeQueryParams = <T extends Record<string, any>>(
    params: Partial<T>,
    defaults: T
): T => {
    return { ...defaults, ...params };
};

/**
 * Convert camelCase to snake_case for API compatibility
 */
export const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case to camelCase
 */
export const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Transform object keys from camelCase to snake_case
 */
export const transformKeysToSnakeCase = (obj: Record<string, any>): Record<string, any> => {
    const transformed: Record<string, any> = {};

    Object.entries(obj).forEach(([key, value]) => {
        const snakeKey = toSnakeCase(key);
        transformed[snakeKey] = value;
    });

    return transformed;
};

/**
 * Transform object keys from snake_case to camelCase
 */
export const transformKeysToCamelCase = (obj: Record<string, any>): Record<string, any> => {
    const transformed: Record<string, unknown> = {};

    Object.entries(obj).forEach(([key, value]) => {
        const camelKey = toCamelCase(key);
        transformed[camelKey] = value;
    });

    return transformed;
};