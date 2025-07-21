import { Button } from '@/components/ui/button';
import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: React.ComponentType<{ error: Error | null; resetError?: () => void }>;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error, errorInfo: null };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }

        // Log to error reporting service in production
        if (import.meta.env.PROD) {
            this.logErrorToService(error, errorInfo);
        }
    }

    private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
        // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
        console.error('Production error:', {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        });
    };

    private resetError = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    override render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return (
                <FallbackComponent
                    error={this.state.error}
                    resetError={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}

interface ErrorFallbackProps {
    error: Error | null;
    resetError?: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-lg font-semibold text-gray-900 mb-2">
                    Something went wrong
                </h1>

                <p className="text-sm text-gray-600 mb-4">
                    We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                </p>

                {import.meta.env.DEV && error && (
                    <details className="mb-4 text-left">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                            Error Details (Development)
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {error.message}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                    </details>
                )}

                <div className="flex gap-2 justify-center">
                    <Button onClick={resetError} variant="outline">
                        Try Again
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ErrorBoundary;