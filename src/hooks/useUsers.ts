import { useCallback } from 'react';
import type { GetAllUsersRequest } from '../redux/api/usersApi';
import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useGetAllCustomersQuery,
    useGetAllUsersQuery,
    useGetAllWorkersQuery,
    useGetAvailableWorkersQuery,
    useGetBusyWorkersQuery,
    useGetUserByEmailQuery,
    useGetUserByIdQuery,
    useGetUserProfileQuery,
    useMakeAdminMutation,
    useUpdateUserMutation,
    useUpdateUserProfileMutation,
    useUpdateWorkerStatusMutation,
} from '../redux/api/usersApi';
import type {
    CreateUserInput,
    UpdateUserInput,
    User,
    UserRole,
} from '../types/user';

export const useUsers = () => {
    // Mutations
    const [updateUserProfile, updateUserProfileResult] = useUpdateUserProfileMutation();
    const [updateWorkerStatus, updateWorkerStatusResult] = useUpdateWorkerStatusMutation();
    const [makeAdmin, makeAdminResult] = useMakeAdminMutation();
    const [updateUser, updateUserResult] = useUpdateUserMutation();
    const [createUser, createUserResult] = useCreateUserMutation();
    const [deleteUser, deleteUserResult] = useDeleteUserMutation();

    // Get user by email (legacy compatibility)
    const getUserByEmail = useCallback((email: string, options?: { skip?: boolean }) => {
        return useGetUserByEmailQuery({ email }, { skip: options?.skip || !email });
    }, []);

    // Get user by ID
    const getUserById = useCallback((id: string, options?: { skip?: boolean }) => {
        return useGetUserByIdQuery({ id }, { skip: options?.skip || !id });
    }, []);

    // Get current user profile
    const getUserProfile = useCallback((options?: { skip?: boolean }) => {
        return useGetUserProfileQuery(undefined, { skip: options?.skip || false });
    }, []);

    // Get all users with filtering
    const getAllUsers = useCallback((params?: GetAllUsersRequest) => {
        return useGetAllUsersQuery(params || {});
    }, []);

    // Get all customers
    const getAllCustomers = useCallback((params?: Omit<GetAllUsersRequest, 'role'>) => {
        return useGetAllCustomersQuery(params || {});
    }, []);

    // Get all workers
    const getAllWorkers = useCallback((params?: Omit<GetAllUsersRequest, 'role'>) => {
        return useGetAllWorkersQuery(params || {});
    }, []);

    // Get available workers (Free status)
    const getAvailableWorkers = useCallback((params?: Omit<GetAllUsersRequest, 'role' | 'workingStatus'>) => {
        return useGetAvailableWorkersQuery(params || {});
    }, []);

    // Get busy workers (Busy status)
    const getBusyWorkers = useCallback((params?: Omit<GetAllUsersRequest, 'role' | 'workingStatus'>) => {
        return useGetBusyWorkersQuery(params || {});
    }, []);

    // Update user profile
    const updateProfile = useCallback(async (data: UpdateUserInput) => {
        try {
            const result = await updateUserProfile({ data });
            if ('data' in result) {
                return { success: true, data: result.data };
            } else {
                return { success: false, error: 'Failed to update profile' };
            }
        } catch (error) {
            return { success: false, error: 'Failed to update profile' };
        }
    }, [updateUserProfile]);

    // Update worker status
    const updateWorkerWorkingStatus = useCallback(async (id: string, workingStatus: 'Free' | 'Busy') => {
        try {
            const result = await updateWorkerStatus({ id, workingStatus });
            if ('data' in result) {
                return { success: true, data: result.data };
            } else {
                return { success: false, error: 'Failed to update worker status' };
            }
        } catch (error) {
            return { success: false, error: 'Failed to update worker status' };
        }
    }, [updateWorkerStatus]);

    // Make user admin
    const makeUserAdmin = useCallback(async (id: string) => {
        try {
            const result = await makeAdmin({ id });
            if ('data' in result) {
                return { success: true, data: result.data };
            } else {
                return { success: false, error: 'Failed to make user admin' };
            }
        } catch (error) {
            return { success: false, error: 'Failed to make user admin' };
        }
    }, [makeAdmin]);

    // Update any user (admin function)
    const updateAnyUser = useCallback(async (id: string, data: UpdateUserInput) => {
        try {
            const result = await updateUser({ id, data });
            if ('data' in result) {
                return { success: true, data: result.data };
            } else {
                return { success: false, error: 'Failed to update user' };
            }
        } catch (error) {
            return { success: false, error: 'Failed to update user' };
        }
    }, [updateUser]);

    // Create new user (admin function)
    const createNewUser = useCallback(async (data: CreateUserInput) => {
        try {
            const result = await createUser({ data });
            if ('data' in result) {
                return { success: true, data: result.data };
            } else {
                return { success: false, error: 'Failed to create user' };
            }
        } catch (error) {
            return { success: false, error: 'Failed to create user' };
        }
    }, [createUser]);

    // Delete user (admin function)
    const deleteAnyUser = useCallback(async (id: string) => {
        try {
            const result = await deleteUser({ id });
            if ('data' in result) {
                return { success: true };
            } else {
                return { success: false, error: 'Failed to delete user' };
            }
        } catch (error) {
            return { success: false, error: 'Failed to delete user' };
        }
    }, [deleteUser]);

    // Check if user is admin based on role
    const isUserAdmin = useCallback((user: User | null): boolean => {
        return user?.role === 'admin';
    }, []);

    // Check if user is worker based on role
    const isUserWorker = useCallback((user: User | null): boolean => {
        return user?.role === 'worker';
    }, []);

    // Check if user is customer based on role
    const isUserCustomer = useCallback((user: User | null): boolean => {
        return user?.role === 'customer';
    }, []);

    // Get user display name
    const getUserDisplayName = useCallback((user: User | null): string => {
        if (!user) return 'Guest';
        return user.displayName || user.email || 'User';
    }, []);

    // Filter users by role
    const filterUsersByRole = useCallback((users: User[], role: UserRole): User[] => {
        return users.filter(user => user.role === role);
    }, []);

    // Filter workers by status
    const filterWorkersByStatus = useCallback((workers: User[], status: 'Free' | 'Busy'): User[] => {
        return workers.filter(worker =>
            worker.role === 'worker' &&
            'workingStatus' in worker &&
            worker.workingStatus === status
        );
    }, []);

    return {
        // Query hooks (these return the hook directly for use in components)
        getUserByEmail,
        getUserById,
        getUserProfile,
        getAllUsers,
        getAllCustomers,
        getAllWorkers,
        getAvailableWorkers,
        getBusyWorkers,

        // Mutation functions (these are wrapped for easier use)
        updateProfile,
        updateWorkerWorkingStatus,
        makeUserAdmin,
        updateAnyUser,
        createNewUser,
        deleteAnyUser,

        // Mutation states
        updateUserProfileResult,
        updateWorkerStatusResult,
        makeAdminResult,
        updateUserResult,
        createUserResult,
        deleteUserResult,

        // Utility functions
        isUserAdmin,
        isUserWorker,
        isUserCustomer,
        getUserDisplayName,
        filterUsersByRole,
        filterWorkersByStatus,
    };
};