import { Link } from 'react-router';
import { useAuth } from '../../../../hooks/useAuth';

export const HomePage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        Urban Services Platform
                    </h1>

                    <p className="text-xl text-gray-600 mb-12">
                        Connect with trusted service providers in your area
                    </p>

                    <div className="space-y-4">
                        {isAuthenticated && user ? (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Welcome back, {user.displayName || user.email}!
                                </h2>

                                <Link
                                    to={getDashboardPath(user.role)}
                                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to="/login"
                                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-sm text-gray-500">
                        Home page components will be implemented in future tasks.
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