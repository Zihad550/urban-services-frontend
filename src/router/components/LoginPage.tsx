import { Link, Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Redirect if already authenticated
    if (isAuthenticated && user) {
        const from = (location.state as any)?.from || getDashboardPath(user.role);
        return <Navigate to={from} replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center text-gray-600">
                        Login component will be implemented in a future task.
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/register"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getDashboardPath = (role: string): string => {
    switch (role) {
        case 'admin':
            return '/dashboard/admin';
        case 'worker':
            return '/dashboard/worker';
        case 'customer':
        default:
            return '/dashboard/user';
    }
};