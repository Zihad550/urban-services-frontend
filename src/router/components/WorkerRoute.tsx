import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { canAccessWorkerRoutes } from '../../lib/auth';
import type { RouteProtectionProps } from '../types';

export const WorkerRoute: React.FC<RouteProtectionProps> = ({
    children,
    fallback,
    redirectTo = '/dashboard/user'
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

    // Redirect if not authenticated or not worker
    if (!isAuthenticated || !canAccessWorkerRoutes(user)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};