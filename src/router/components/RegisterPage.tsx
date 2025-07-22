import { Navigate } from 'react-router';
import { RegisterForm } from '../../components/features/auth/components';
import { useAuth } from '../../hooks/useAuth';

export const RegisterPage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    // Redirect if already authenticated
    if (isAuthenticated && user) {
        const dashboardPath = getDashboardPath(user.role);
        return <Navigate to={dashboardPath} replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join Urban Services and connect with service providers
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <RegisterForm />
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