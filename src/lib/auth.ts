import type { User, UserRole } from '../types/user';

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
    return user?.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
    return hasRole(user, 'admin');
};

/**
 * Check if user is worker
 */
export const isWorker = (user: User | null): boolean => {
    return hasRole(user, 'worker');
};

/**
 * Check if user is customer
 */
export const isCustomer = (user: User | null): boolean => {
    return hasRole(user, 'customer');
};

/**
 * Get user display name with fallback
 */
export const getUserDisplayName = (user: User | null): string => {
    if (!user) return 'Guest';
    return user.displayName || user.email || 'User';
};

/**
 * Check if user has permission to access admin routes
 */
export const canAccessAdminRoutes = (user: User | null): boolean => {
    return isAdmin(user);
};

/**
 * Check if user has permission to access worker routes
 */
export const canAccessWorkerRoutes = (user: User | null): boolean => {
    return isWorker(user);
};

/**
 * Check if user has permission to access customer routes
 */
export const canAccessCustomerRoutes = (user: User | null): boolean => {
    return isCustomer(user);
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('idToken');
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
    localStorage.removeItem('idToken');
};

/**
 * Check if auth token exists
 */
export const hasAuthToken = (): boolean => {
    return !!getAuthToken();
};