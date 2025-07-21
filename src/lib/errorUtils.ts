import { toast } from 'sonner';

export interface ApiError {
    status?: number | string;
    data?: {
        message?: string;
        errors?: Record<string, string[]>;
    };
    error?: string;
}

export interface ErrorDetails {
    message: string;
    code?: string;
    status?: number;
    timestamp: string;
    url: string;
    userAgent: string;
    userId?: string;
}

export const handleApiError = (error: unknown): string => {
    if (isApiError(error)) {
        // Handle RTK Query API errors
        if (error.status === 'FETCH_ERROR') {
            return 'Network error. Please check your connection and try again.';
        }

        if (error.status === 'PARSING_ERROR') {
            return 'Server response error. Please try again later.';
        }

        if (error.status === 'TIMEOUT_ERROR') {
            return 'Request timeout. Please try again.';
        }

        if (typeof error.status === 'number') {
            switch (error.status) {
                case 400:
                    return error.data?.message || 'Invalid request. Please check your input.';
                case 401:
                    return 'Authentication required. Please log in again.';
                case 403:
                    return 'Access denied. You don\'t have permission to perform this action.';
                case 404:
                    return 'Resource not found.';
                case 409:
                    return error.data?.message || 'Conflict. The resource already exists or has been modified.';
                case 422:
                    return error.data?.message || 'Validation error. Please check your input.';
                case 429:
                    return 'Too many requests. Please wait a moment and try again.';
                case 500:
                    return 'Server error. Please try again later.';
                case 502:
                    return 'Service temporarily unavailable. Please try again later.';
                case 503:
                    return 'Service unavailable. Please try again later.';
                default:
                    return error.data?.message || `Server error (${error.status}). Please try again later.`;
            }
        }

        return error.data?.message || error.error || 'An unexpected error occurred.';
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred.';
};

export const isApiError = (error: unknown): error is ApiError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        ('status' in error || 'data' in error || 'error' in error)
    );
};

export const showErrorToast = (error: unknown, title?: string) => {
    const message = handleApiError(error);
    toast.error(title || 'Error', {
        description: message,
        duration: 5000,
    });
};

export const showSuccessToast = (message: string, title?: string) => {
    toast.success(title || 'Success', {
        description: message,
        duration: 3000,
    });
};

export const showInfoToast = (message: string, title?: string) => {
    toast.info(title || 'Info', {
        description: message,
        duration: 4000,
    });
};

export const showWarningToast = (message: string, title?: string) => {
    toast.warning(title || 'Warning', {
        description: message,
        duration: 4000,
    });
};

export const logError = (error: Error, context?: Record<string, any>) => {
    const errorDetails: ErrorDetails = {
        message: error.message,
        code: error.name,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
    };

    if (import.meta.env.DEV) {
        console.error('Error logged:', errorDetails, error.stack);
    }

    if (import.meta.env.PROD) {
        // TODO: Send to error reporting service
        console.error('Production error:', errorDetails);
    }
};

export const createErrorHandler = (context: string) => {
    return (error: unknown, additionalContext?: Record<string, any>) => {
        const errorMessage = handleApiError(error);

        logError(
            error instanceof Error ? error : new Error(errorMessage),
            {
                context,
                ...additionalContext,
            }
        );

        showErrorToast(error, `Error in ${context}`);
    };
};

export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: string
): T => {
    const handleError = createErrorHandler(context);

    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            handleError(error);
            throw error;
        }
    }) as T;
};

export const getValidationErrors = (error: unknown): Record<string, string[]> | null => {
    if (isApiError(error) && error.data?.errors) {
        return error.data.errors;
    }
    return null;
};

export const formatValidationErrors = (errors: Record<string, string[]>): string => {
    return Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
};