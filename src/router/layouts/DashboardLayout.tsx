import { Navigate, Outlet, useLoaderData } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import type { DashboardLoaderData } from '../types';

export const DashboardLayout: React.FC = () => {
    const loaderData = useLoaderData() as DashboardLoaderData;
    const { user } = useAuth();

    // Handle redirect if needed
    if (loaderData.redirectPath) {
        return <Navigate to={loaderData.redirectPath} replace />;
    }

    // Auto-redirect to appropriate dashboard based on user role
    if (user && window.location.pathname === '/dashboard') {
        const dashboardPath = getDashboardPath(user.role);
        return <Navigate to={dashboardPath} replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <Outlet />
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