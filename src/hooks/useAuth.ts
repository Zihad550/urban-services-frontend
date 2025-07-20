import { useCallback } from 'react';
import {
    clearError,
    loginWithEmail,
    loginWithGoogle,
    logoutUser,
    registerWithEmail,
    selectAuth,
    selectAuthError,
    selectIsAdmin,
    selectIsAuthenticated,
    selectIsCustomer,
    selectIsLoading,
    selectIsWorker,
    selectUser,
    selectUserRole,
} from '../redux/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import type { LoginCredentials, RegisterData, UserRole } from '../types/user';

export const useAuth = () => {
    const dispatch = useAppDispatch();

    // Selectors
    const auth = useAppSelector(selectAuth);
    const user = useAppSelector(selectUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectAuthError);
    const userRole = useAppSelector(selectUserRole);
    const isAdmin = useAppSelector(selectIsAdmin);
    const isWorker = useAppSelector(selectIsWorker);
    const isCustomer = useAppSelector(selectIsCustomer);

    // Login with email and password
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const result = await dispatch(loginWithEmail(credentials));
            if (loginWithEmail.fulfilled.match(result)) {
                return { success: true };
            } else {
                return { success: false, error: result.payload as string };
            }
        } catch {
            return { success: false, error: 'Login failed' };
        }
    }, [dispatch]);

    // Register new user
    const register = useCallback(async (registerData: RegisterData) => {
        try {
            const result = await dispatch(registerWithEmail(registerData));
            if (registerWithEmail.fulfilled.match(result)) {
                return { success: true };
            } else {
                return { success: false, error: result.payload as string };
            }
        } catch {
            return { success: false, error: 'Registration failed' };
        }
    }, [dispatch]);

    // Login with Google
    const googleLogin = useCallback(async () => {
        try {
            const result = await dispatch(loginWithGoogle());
            if (loginWithGoogle.fulfilled.match(result)) {
                return { success: true };
            } else {
                return { success: false, error: result.payload as string };
            }
        } catch {
            return { success: false, error: 'Google login failed' };
        }
    }, [dispatch]);

    // Logout user
    const logout = useCallback(async () => {
        try {
            const result = await dispatch(logoutUser());
            if (logoutUser.fulfilled.match(result)) {
                return { success: true };
            } else {
                return { success: false, error: result.payload as string };
            }
        } catch {
            return { success: false, error: 'Logout failed' };
        }
    }, [dispatch]);

    // Clear authentication error
    const clearAuthError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Check if user has specific role
    const hasRole = useCallback((role: UserRole) => {
        return user?.role === role;
    }, [user]);

    // Get user display name
    const getDisplayName = useCallback(() => {
        if (!user) return 'Guest';
        return user.displayName || user.email || 'User';
    }, [user]);

    return {
        // State
        auth,
        user,
        isAuthenticated,
        isLoading,
        error,
        userRole,
        isAdmin,
        isWorker,
        isCustomer,

        // Actions
        login,
        register,
        googleLogin,
        logout,
        clearAuthError,

        // Utilities
        hasRole,
        getDisplayName,
    };
};