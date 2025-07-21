import type { LoaderFunction } from 'react-router';
import { canAccessCustomerRoutes } from '../../lib/auth';
import { store } from '../../redux/store';
import type { UserDashboardLoaderData } from '../types';

export const userDashboardLoader: LoaderFunction = async (): Promise<UserDashboardLoaderData> => {
    const state = store.getState();
    const { user, isAuthenticated, isLoading } = state.auth;

    // If still loading, wait for auth to resolve
    if (isLoading) {
        return {
            user,
        };
    }

    // Check authentication and customer access
    if (!isAuthenticated || !user || !canAccessCustomerRoutes(user)) {
        return {
            user: null,
            redirectPath: '/dashboard/worker',
        };
    }

    // In a real app, you would fetch user-specific data here
    // For now, we'll return mock data structure
    const userBookings: any[] = []; // Would be fetched from API
    const recentActivity: any[] = []; // Would be fetched from API

    return {
        user,
        userBookings,
        recentActivity,
    };
};