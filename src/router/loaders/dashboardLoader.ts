import type { LoaderFunction } from 'react-router';
import { store } from '../../redux/store';
import type { DashboardLoaderData } from '../types';

export const dashboardLoader: LoaderFunction = async (): Promise<DashboardLoaderData> => {
    const state = store.getState();
    const { user, isAuthenticated, isLoading } = state.auth;

    // If still loading, wait a bit for auth to resolve
    if (isLoading) {
        // In a real app, you might want to implement a proper auth check here
        // For now, we'll return the current state
        return {
            user,
        };
    }

    // If not authenticated, indicate redirect needed
    if (!isAuthenticated || !user) {
        return {
            user: null,
            redirectPath: '/login',
        };
    }

    // Return user data for authenticated users
    return {
        user,
    };
};