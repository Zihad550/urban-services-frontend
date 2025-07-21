import type { User, UserRole } from '../types/user';

export interface RouteProtectionProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export interface RoleBasedRouteProps extends RouteProtectionProps {
    allowedRoles: UserRole[];
    user: User | null;
}

export interface LoaderContext {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface DashboardLoaderData {
    user: User | null;
    redirectPath?: string | undefined;
}

export interface AdminDashboardLoaderData extends DashboardLoaderData {
    adminStats?: {
        totalUsers: number;
        totalWorkers: number;
        totalBookings: number;
        pendingRequests: number;
    };
}

export interface UserDashboardLoaderData extends DashboardLoaderData {
    userBookings?: any[];
    recentActivity?: any[];
}

export interface WorkerDashboardLoaderData extends DashboardLoaderData {
    workerJobs?: any[];
    workerStats?: {
        completedJobs: number;
        rating: number;
        earnings: number;
    };
}

export type LoaderData =
    | DashboardLoaderData
    | AdminDashboardLoaderData
    | UserDashboardLoaderData
    | WorkerDashboardLoaderData;