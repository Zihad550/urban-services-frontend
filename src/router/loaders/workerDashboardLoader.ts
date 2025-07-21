import type { LoaderFunction } from 'react-router';
import { canAccessWorkerRoutes } from '../../lib/auth';
import { store } from '../../redux/store';
import type { WorkerDashboardLoaderData } from '../types';

export const workerDashboardLoader: LoaderFunction = async (): Promise<WorkerDashboardLoaderData> => {
    const state = store.getState();
    const { user, isAuthenticated, isLoading } = state.auth;

    // If still loading, wait for auth to resolve
    if (isLoading) {
        return {
            user,
        };
    }

    // Check authentication and worker access
    if (!isAuthenticated || !user || !canAccessWorkerRoutes(user)) {
        return {
            user: null,
            redirectPath: '/dashboard/user',
        };
    }

    // In a real app, you would fetch worker-specific data here
    // For now, we'll return mock data structure
    const workerJobs: any[] = []; // Would be fetched from API
    const workerStats = {
        completedJobs: 0, // Would be fetched from API
        rating: 0,
        earnings: 0,
    };

    return {
        user,
        workerJobs,
        workerStats,
    };
};