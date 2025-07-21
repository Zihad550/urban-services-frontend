import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import type { RouteProtectionProps } from '../types';

export const ProtectedRoute: React.FC<RouteProtectionProps> = ({
    children,
    fallback,
    redirectTo = '/login'
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

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

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    return <>{children}</>;
};