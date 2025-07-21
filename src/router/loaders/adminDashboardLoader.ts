import type { LoaderFunction } from 'react-router';
import { canAccessAdminRoutes } from '../../lib/auth';
import { store } from '../../redux/store';
import type { AdminDashboardLoaderData } from '../types';

export const adminDashboardLoader: LoaderFunction = async (): Promise<AdminDashboardLoaderData> => {
    const state = store.getState();
    const { user, isAuthenticated, isLoading } = state.auth;

    // If still loading, wait for auth to resolve
    if (isLoading) {
        return {
            user,
        };
    }

    // Check authentication and admin access
    if (!isAuthenticated || !user || !canAccessAdminRoutes(user)) {
        return {
            user: null,
            redirectPath: '/dashboard/user',
        };
    }

    // In a real app, you would fetch admin-specific data here
    // For now, we'll return mock data structure
    const adminStats = {
        totalUsers: 0, // Would be fetched from API
        totalWorkers: 0,
        totalBookings: 0,
        pendingRequests: 0,
    };

    return {
        user,
        adminStats,
    };
};