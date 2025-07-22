import { Navigate, useLocation } from 'react-router';
import { LoginForm } from '../../components/features/auth/components';
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
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Welcome back to Urban Services
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <LoginForm />
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