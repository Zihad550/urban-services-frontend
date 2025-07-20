import { useCallback, useEffect, useMemo, useState } from "react";
import {
    useAddBookingMessageMutation,
    useCancelBookingMutation,
    useCreateBookingMutation,
    useGetActiveBookingsQuery,
    useGetAvailableSlotsQuery,
    useGetBookingByIdQuery,
    useGetBookingMessagesQuery,
    useGetBookingsQuery,
    useGetBookingStatsQuery,
    useGetCustomerBookingsQuery,
    useGetPendingBookingsQuery,
    useGetWorkerBookingsQuery,
    useProcessBookingPaymentMutation,
    useRescheduleBookingMutation,
    useUpdateBookingMutation,
    useUpdateBookingStatusMutation,
} from "../redux/api/bookingsApi";
import type { ListRequest } from "../types/api";
import type {
    CreateBookingInput,
    UpdateBookingInput
} from "../types/booking";
import type { BookingStatus } from "../types/common";

// Hook options interfaces
export interface UseBookingsOptions extends ListRequest {
    customerId?: string;
    workerId?: string;
    serviceId?: string;
    status?: BookingStatus[];
    dateRange?: {
        startDate: string;
        endDate: string;
    };
    location?: string;
    priceRange?: {
        min: number;
        max: number;
    };
    enabled?: boolean;
}

export interface UseBookingOptions {
    id: string;
    enabled?: boolean;
}

export interface UseUserBookingsOptions extends Omit<ListRequest, 'filters'> {
    userId: string;
    role: 'customer' | 'worker';
    status?: BookingStatus[];
    enabled?: boolean;
}

export interface UseAvailableSlotsOptions {
    workerId: string;
    serviceId: string;
    date: string;
    enabled?: boolean;
}

export interface UseBookingStatsOptions {
    userId?: string;
    role?: 'customer' | 'worker';
    dateRange?: {
        startDate: string;
        endDate: string;
    };
    enabled?: boolean;
}

/**
 * Hook for managing all bookings with advanced filtering
 */
export const useBookings = (options: UseBookingsOptions = {}) => {
    const { enabled = true, ...queryParams } = options;

    const {
        data,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetBookingsQuery(queryParams, {
        skip: !enabled,
        refetchOnMountOrArgChange: 30,
    });

    return {
        bookings: data?.data || [],
        pagination: data?.pagination,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
        totalCount: data?.pagination?.total || 0,
    };
};

/**
 * Hook for getting a single booking by ID
 */
export const useBooking = (options: UseBookingOptions) => {
    const { id, enabled = true } = options;

    const {
        data: booking,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetBookingByIdQuery({ id }, {
        skip: !enabled || !id,
    });

    return {
        booking,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    };
};

/**
 * Hook for getting customer bookings (legacy compatibility)
 */
export const useCustomerBookings = (options: Omit<UseUserBookingsOptions, 'role'>) => {
    const { enabled = true, ...queryParams } = options;

    const {
        data,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetCustomerBookingsQuery(queryParams, {
        skip: !enabled,
        refetchOnMountOrArgChange: 30,
    });

    return {
        bookings: data?.data || [],
        pagination: data?.pagination,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
        totalCount: data?.pagination?.total || 0,
    };
};

/**
 * Hook for getting worker bookings (legacy compatibility)
 */
export const useWorkerBookings = (options: Omit<UseUserBookingsOptions, 'role'>) => {
    const { enabled = true, ...queryParams } = options;

    const {
        data,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetWorkerBookingsQuery(queryParams, {
        skip: !enabled,
        refetchOnMountOrArgChange: 30,
    });

    return {
        bookings: data?.data || [],
        pagination: data?.pagination,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
        totalCount: data?.pagination?.total || 0,
    };
};

/**
 * Hook for getting pending bookings
 */
export const usePendingBookings = (options: Omit<UseBookingsOptions, 'status'> = {}) => {
    const { enabled = true, ...queryParams } = options;

    const {
        data,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetPendingBookingsQuery(queryParams, {
        skip: !enabled,
        refetchOnMountOrArgChange: 30,
    });

    return {
        bookings: data?.data || [],
        pagination: data?.pagination,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
        totalCount: data?.pagination?.total || 0,
    };
};

/**
 * Hook for getting active bookings
 */
export const useActiveBookings = (options: Omit<UseBookingsOptions, 'status'> = {}) => {
    const { enabled = true, ...queryParams } = options;

    const {
        data,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetActiveBookingsQuery(queryParams, {
        skip: !enabled,
        refetchOnMountOrArgChange: 30,
    });

    return {
        bookings: data?.data || [],
        pagination: data?.pagination,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
        totalCount: data?.pagination?.total || 0,
    };
};

/**
 * Hook for getting available time slots
 */
export const useAvailableSlots = (options: UseAvailableSlotsOptions) => {
    const { enabled = true, ...queryParams } = options;

    const {
        data: slots,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetAvailableSlotsQuery(queryParams, {
        skip: !enabled || !queryParams.workerId || !queryParams.serviceId || !queryParams.date,
    });

    return {
        slots: slots || [],
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    };
};

/**
 * Hook for getting booking statistics
 */
export const useBookingStats = (options: UseBookingStatsOptions = {}) => {
    const { enabled = true, ...queryParams } = options;

    const {
        data: stats,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetBookingStatsQuery(queryParams, {
        skip: !enabled,
    });

    return {
        stats,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    };
};

/**
 * Hook for booking mutations (create, update, cancel, etc.)
 */
export const useBookingMutations = () => {
    const [createBooking, createBookingResult] = useCreateBookingMutation();
    const [updateBooking, updateBookingResult] = useUpdateBookingMutation();
    const [updateBookingStatus, updateBookingStatusResult] = useUpdateBookingStatusMutation();
    const [cancelBooking, cancelBookingResult] = useCancelBookingMutation();
    const [rescheduleBooking, rescheduleBookingResult] = useRescheduleBookingMutation();
    const [addMessage, addMessageResult] = useAddBookingMessageMutation();
    const [processPayment, processPaymentResult] = useProcessBookingPaymentMutation();

    // Create booking with error handling
    const handleCreateBooking = async (data: CreateBookingInput) => {
        try {
            const result = await createBooking({ data }).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error };
        }
    };

    // Update booking with error handling
    const handleUpdateBooking = async (id: string, data: UpdateBookingInput) => {
        try {
            const result = await updateBooking({ id, data }).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error };
        }
    };

    // Update booking status with error handling
    const handleUpdateBookingStatus = async (id: string, status: BookingStatus, notes?: string) => {
        try {
            const payload: { id: string; status: BookingStatus; notes?: string } = { id, status };
            if (notes !== undefined) {
                payload.notes = notes;
            }
            const result = await updateBookingStatus(payload).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error };
        }
    };

    // Cancel booking with error handling
    const handleCancelBooking = async (id: string, reason: string, refundAmount?: number) => {
        try {
            const payload: { id: string; reason: string; refundAmount?: number } = { id, reason };
            if (refundAmount !== undefined) {
                payload.refundAmount = refundAmount;
            }
            const result = await cancelBooking(payload).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error };
        }
    };

    // Reschedule booking with error handling
    const handleRescheduleBooking = async (bookingId: string, newDate: string, reason: string) => {
        try {
            const result = await rescheduleBooking({ bookingId, newDate, reason }).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error };
        }
    };

    // Add message to booking with error handling
    const handleAddMessage = async (bookingId: string, message: string, attachments?: string[]) => {
        try {
            const payload: { bookingId: string; message: string; attachments?: string[] } = { bookingId, message };
            if (attachments !== undefined) {
                payload.attachments = attachments;
            }
            const result = await addMessage(payload).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error };
        }
    };

    // Process payment with error handling
    const handleProcessPayment = async (
        bookingId: string,
        paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'digital_wallet',
        amount: number
    ) => {
        try {
            const result = await processPayment({ bookingId, paymentMethod, amount }).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error };
        }
    };

    return {
        // Mutation functions
        createBooking: handleCreateBooking,
        updateBooking: handleUpdateBooking,
        updateBookingStatus: handleUpdateBookingStatus,
        cancelBooking: handleCancelBooking,
        rescheduleBooking: handleRescheduleBooking,
        addMessage: handleAddMessage,
        processPayment: handleProcessPayment,

        // Mutation states
        isCreating: createBookingResult.isLoading,
        isUpdating: updateBookingResult.isLoading,
        isUpdatingStatus: updateBookingStatusResult.isLoading,
        isCancelling: cancelBookingResult.isLoading,
        isRescheduling: rescheduleBookingResult.isLoading,
        isAddingMessage: addMessageResult.isLoading,
        isProcessingPayment: processPaymentResult.isLoading,

        // Mutation errors
        createError: createBookingResult.error,
        updateError: updateBookingResult.error,
        statusUpdateError: updateBookingStatusResult.error,
        cancelError: cancelBookingResult.error,
        rescheduleError: rescheduleBookingResult.error,
        messageError: addMessageResult.error,
        paymentError: processPaymentResult.error,
    };
};

/**
 * Hook for booking messages
 */
export const useBookingMessages = (bookingId: string, enabled = true) => {
    const {
        data: messages,
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetBookingMessagesQuery({ bookingId }, {
        skip: !enabled || !bookingId,
        refetchOnMountOrArgChange: 30,
    });

    return {
        messages: messages || [],
        error,
        isLoading,
        isFetching,
        isError,
        refetch,
    };
};

/**
 * Legacy compatibility hook that mimics the useFirebase booking functionality
 * This provides a smooth migration path from the legacy implementation
 */
export const useBookingsData = (userEmail?: string) => {
    // Get user bookings (assuming we have user context)
    const { bookings: allBookings, isLoading } = useBookings({
        enabled: !!userEmail,
    });

    // Filter bookings based on legacy logic
    const bookings = useMemo(() => {
        return allBookings.filter(
            (booking) =>
                booking.status === 'completed' ||
                booking.status === 'in_progress'
        );
    }, [allBookings]);

    const requestPending = useMemo(() => {
        return allBookings.filter(
            (booking) =>
                booking.status === 'pending' ||
                booking.status === 'rejected'
        );
    }, [allBookings]);

    return {
        bookings,
        requestPending,
        isLoading,
        // Legacy compatibility - refresh function
        refreshClientRequest: () => {
            // This would trigger a refetch in the new implementation
            // The actual refetch is handled by RTK Query automatically
        },
    };
};

/**
 * Hook for real-time booking updates
 * Implements polling-based real-time updates with automatic cleanup
 */
export const useBookingRealTimeUpdates = (bookingId: string, enabled = true) => {
    const { booking, refetch } = useBooking({ id: bookingId, enabled });
    const [isPolling, setIsPolling] = useState(false);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Enable real-time updates with polling
    const enableRealTimeUpdates = useCallback((intervalMs = 5000) => {
        if (isPolling || !bookingId) return;

        setIsPolling(true);
        const interval = setInterval(() => {
            refetch();
        }, intervalMs);

        setPollingInterval(interval);
        console.log(`Enabled real-time updates for booking ${bookingId} (polling every ${intervalMs}ms)`);
    }, [bookingId, isPolling, refetch]);

    // Disable real-time updates
    const disableRealTimeUpdates = useCallback(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
        setIsPolling(false);
        console.log(`Disabled real-time updates for booking ${bookingId}`);
    }, [bookingId, pollingInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    // Auto-enable polling for active bookings
    useEffect(() => {
        if (booking && enabled) {
            const activeStatuses: BookingStatus[] = ['pending', 'accepted', 'in_progress'];
            if (activeStatuses.includes(booking.status)) {
                enableRealTimeUpdates();
            }
        }

        return () => {
            disableRealTimeUpdates();
        };
    }, [booking?.status, enabled, enableRealTimeUpdates, disableRealTimeUpdates]);

    return {
        booking,
        isPolling,
        enableRealTimeUpdates,
        disableRealTimeUpdates,
        refetch,
    };
};

/**
 * Hook for booking workflow management
 * Provides utilities for managing booking status transitions and validation
 */
export const useBookingWorkflow = () => {
    const { updateBookingStatus } = useBookingMutations();

    // Define valid status transitions
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
        pending: ['accepted', 'rejected', 'cancelled'],
        accepted: ['in_progress', 'cancelled'],
        rejected: ['pending'], // Allow re-submission
        in_progress: ['completed', 'cancelled'],
        completed: [], // Final state
        cancelled: [], // Final state
    };

    // Check if status transition is valid
    const canTransitionTo = useCallback((currentStatus: BookingStatus, newStatus: BookingStatus): boolean => {
        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }, []);

    // Get next possible statuses
    const getNextStatuses = useCallback((currentStatus: BookingStatus): BookingStatus[] => {
        return validTransitions[currentStatus] || [];
    }, [validTransitions]);

    // Update booking status with validation
    const updateStatus = useCallback(async (
        bookingId: string,
        currentStatus: BookingStatus,
        newStatus: BookingStatus,
        notes?: string
    ) => {
        if (!canTransitionTo(currentStatus, newStatus)) {
            return {
                success: false,
                error: `Invalid status transition from ${currentStatus} to ${newStatus}`
            };
        }

        return await updateBookingStatus(bookingId, newStatus, notes);
    }, [canTransitionTo, updateBookingStatus]);

    // Check if booking is in final state
    const isFinalStatus = useCallback((status: BookingStatus): boolean => {
        return ['completed', 'cancelled'].includes(status);
    }, []);

    // Check if booking is active (can be worked on)
    const isActiveStatus = useCallback((status: BookingStatus): boolean => {
        return ['accepted', 'in_progress'].includes(status);
    }, []);

    return {
        canTransitionTo,
        getNextStatuses,
        updateStatus,
        isFinalStatus,
        isActiveStatus,
        validTransitions,
    };
};