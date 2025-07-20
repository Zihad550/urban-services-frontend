import { useMemo } from 'react';
import {
    useGetAvailableWorkersQuery,
    useGetBusyWorkersQuery,
    useGetTopRatedWorkersQuery,
    useGetWorkerByIdQuery,
    useGetWorkersQuery,
    useSearchWorkersQuery,
    useUpdateWorkerProfileMutation,
    useUpdateWorkerStatusMutation,
    type GetWorkersRequest,
} from '../redux/api/workersApi';
import type { WorkingStatus } from '../types/user';

// Hook for managing all workers data
export const useWorkers = (params?: GetWorkersRequest) => {
    const {
        data: workersData,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useGetWorkersQuery(params || {});

    const workers = useMemo(() => workersData?.data || [], [workersData?.data]);
    const pagination = useMemo(() => workersData?.pagination, [workersData?.pagination]);

    return {
        workers,
        pagination,
        error,
        isLoading,
        isFetching,
        refetch,
    };
};

// Hook for managing available workers (Free status)
export const useAvailableWorkers = (params?: Omit<GetWorkersRequest, 'availability'>) => {
    const {
        data: availableWorkersData,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useGetAvailableWorkersQuery(params || {});

    const availableWorkers = useMemo(() => availableWorkersData?.data || [], [availableWorkersData?.data]);
    const pagination = useMemo(() => availableWorkersData?.pagination, [availableWorkersData?.pagination]);

    return {
        availableWorkers,
        pagination,
        error,
        isLoading,
        isFetching,
        refetch,
    };
};

// Hook for managing busy workers (Busy status)
export const useBusyWorkers = (params?: Omit<GetWorkersRequest, 'availability'>) => {
    const {
        data: busyWorkersData,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useGetBusyWorkersQuery(params || {});

    const busyWorkers = useMemo(() => busyWorkersData?.data || [], [busyWorkersData?.data]);
    const pagination = useMemo(() => busyWorkersData?.pagination, [busyWorkersData?.pagination]);

    return {
        busyWorkers,
        pagination,
        error,
        isLoading,
        isFetching,
        refetch,
    };
};

// Hook for managing a single worker
export const useWorker = (workerId: string) => {
    const {
        data: worker,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useGetWorkerByIdQuery(
        { id: workerId },
        { skip: !workerId }
    );

    return {
        worker,
        error,
        isLoading,
        isFetching,
        refetch,
    };
};

// Hook for updating worker status with optimistic updates
export const useWorkerStatusUpdate = () => {
    const [updateWorkerStatus, { isLoading, error }] = useUpdateWorkerStatusMutation();

    const updateStatus = async (workerId: string, workingStatus: WorkingStatus) => {
        try {
            const result = await updateWorkerStatus({ id: workerId, workingStatus }).unwrap();
            return result;
        } catch (error) {
            console.error('Failed to update worker status:', error);
            throw error;
        }
    };

    return {
        updateStatus,
        isLoading,
        error,
    };
};

// Hook for updating worker profile
export const useWorkerProfileUpdate = () => {
    const [updateWorkerProfile, { isLoading, error }] = useUpdateWorkerProfileMutation();

    const updateProfile = async (workerId: string, profileData: Parameters<typeof updateWorkerProfile>[0]['data']) => {
        try {
            const result = await updateWorkerProfile({ id: workerId, data: profileData }).unwrap();
            return result;
        } catch (error) {
            console.error('Failed to update worker profile:', error);
            throw error;
        }
    };

    return {
        updateProfile,
        isLoading,
        error,
    };
};

// Hook for searching workers
export const useWorkerSearch = (searchParams: GetWorkersRequest & { query?: string }) => {
    const {
        data: searchResults,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useSearchWorkersQuery(searchParams, {
        skip: !searchParams.query && !Object.keys(searchParams).some(key => key !== 'query' && searchParams[key as keyof typeof searchParams]),
    });

    const workers = useMemo(() => searchResults?.data || [], [searchResults?.data]);
    const pagination = useMemo(() => searchResults?.pagination, [searchResults?.pagination]);

    return {
        workers,
        pagination,
        error,
        isLoading,
        isFetching,
        refetch,
    };
};

// Hook for getting top-rated workers
export const useTopRatedWorkers = (params?: { limit?: number; serviceCategory?: string }) => {
    const {
        data: topRatedData,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useGetTopRatedWorkersQuery(params || {});

    const topRatedWorkers = useMemo(() => topRatedData?.data || [], [topRatedData?.data]);
    const pagination = useMemo(() => topRatedData?.pagination, [topRatedData?.pagination]);

    return {
        topRatedWorkers,
        pagination,
        error,
        isLoading,
        isFetching,
        refetch,
    };
};

// Combined hook that provides all worker-related functionality (legacy compatibility)
export const useWorkersData = () => {
    const { workers, isLoading: workersLoading, error: workersError } = useWorkers();
    const { availableWorkers, isLoading: availableLoading, error: availableError } = useAvailableWorkers();
    const { busyWorkers, isLoading: busyLoading, error: busyError } = useBusyWorkers();
    const { updateStatus, isLoading: statusUpdateLoading } = useWorkerStatusUpdate();

    // Combine loading states
    const isLoading = workersLoading || availableLoading || busyLoading;

    // Combine errors (prioritize the first error found)
    const error = workersError || availableError || busyError;

    // Legacy-compatible interface
    return {
        // Data
        workers,
        availableWorkers,
        busyWorkers,

        // Loading states
        isLoading,
        workersLoading,
        availableLoading,
        busyLoading,
        statusUpdateLoading,

        // Errors
        error,
        workersError,
        availableError,
        busyError,

        // Actions
        updateWorkerStatus: updateStatus,

        // Utility functions
        getWorkerById: (id: string) => workers.find(worker => worker.id === id),
        getAvailableWorkersByService: (serviceId: string) =>
            availableWorkers.filter(worker => worker.services.includes(serviceId)),
        getWorkersByLocation: (location: string) =>
            workers.filter(worker => worker.serviceAreas.includes(location)),
    };
};

// Hook for worker statistics and analytics
export const useWorkerAnalytics = (workerId: string, dateRange?: { startDate: string; endDate: string }) => {
    const {
        data: stats,
        error,
        isLoading,
        refetch,
    } = useGetWorkersQuery({ id: workerId, dateRange } as any, {
        skip: !workerId,
    });

    return {
        stats,
        error,
        isLoading,
        refetch,
    };
};

// Export all hooks for convenience
export {
    useGetAvailableWorkersQuery,
    useGetBusyWorkersQuery, useGetTopRatedWorkersQuery, useGetWorkerByIdQuery, useGetWorkersQuery, useSearchWorkersQuery, useUpdateWorkerProfileMutation, useUpdateWorkerStatusMutation
} from '../redux/api/workersApi';
