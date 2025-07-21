import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { canAccessCustomerRoutes } from '../../lib/auth';
import type { RouteProtectionProps } from '../types';

export const UserRoute: React.FC<RouteProtectionProps> = ({
    children,
    fallback,
    redirectTo = '/dashboard/worker'
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            )
        );
    }

    // Redirect if not authenticated or not customer
    if (!isAuthenticated || !canAccessCustomerRoutes(user)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};