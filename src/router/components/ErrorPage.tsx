import { Link, useRouteError } from 'react-router';

export const ErrorPage: React.FC = () => {
    const error = useRouteError() as Error;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Oops! Something went wrong
                    </h1>

                    <div className="text-gray-600 mb-6">
                        {error?.message || 'An unexpected error occurred'}
                    </div>

                    <div className="space-y-3">
                        <Link
                            to="/"
                            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Go Home
                        </Link>

                        <button
                            onClick={() => window.location.reload()}
                            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};