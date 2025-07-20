import type {
    ApiResponse,
    ListRequest,
    PaginatedResponse,
} from "../../types/api";
import type {
    Booking,
    BookingMessage,
    BookingPayment,
    BookingReschedule,
    BookingSlot,
    BookingStats,
    BookingStatusUpdate,
    CreateBookingInput,
    UpdateBookingInput
} from "../../types/booking";
import type { BookingStatus } from "../../types/common";
import {
    createItemCacheTags,
    createItemInvalidationTags,
    createListCacheTags,
    createListInvalidationTags,
    createQueryString,
} from "./apiUtils";
import { baseApi, transformResponse } from "./baseApi";

// Request/Response types specific to bookings API
export interface GetBookingsRequest extends ListRequest {
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
}

export interface GetBookingByIdRequest {
    id: string;
}

export interface CreateBookingRequest {
    data: CreateBookingInput;
}

export interface UpdateBookingRequest {
    id: string;
    data: UpdateBookingInput;
}

export interface UpdateBookingStatusRequest {
    id: string;
    status: BookingStatus;
    notes?: string;
}

export interface GetBookingsByUserRequest extends Omit<ListRequest, 'filters'> {
    userId: string;
    role: 'customer' | 'worker';
    status?: BookingStatus[];
}

export interface GetBookingsByServiceRequest extends Omit<ListRequest, 'filters'> {
    serviceId: string;
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

export interface RescheduleBookingRequest {
    bookingId: string;
    newDate: string;
    reason: string;
}

export interface AddBookingMessageRequest {
    bookingId: string;
    message: string;
    attachments?: string[];
}

export interface GetBookingStatsRequest {
    userId?: string;
    role?: 'customer' | 'worker';
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

export interface GetAvailableSlotsRequest {
    workerId: string;
    serviceId: string;
    date: string; // ISO date string
}

export interface CancelBookingRequest {
    id: string;
    reason: string;
    refundAmount?: number;
}

// Bookings API slice
export const bookingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all bookings with advanced filtering
        getBookings: builder.query<
            { data: Booking[]; pagination: PaginatedResponse<Booking>['pagination'] },
            GetBookingsRequest
        >({
            query: (params) => {
                const queryString = createQueryString(params);
                return {
                    url: `/bookings${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Booking>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result
                    ? createListCacheTags('Booking', result.data)
                    : [{ type: 'Booking' as any, id: 'LIST' }],
        }),

        // Get booking by ID with full details
        getBookingById: builder.query<Booking, GetBookingByIdRequest>({
            query: ({ id }) => ({
                url: `/bookings/${id}`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<Booking>) => transformResponse(response),
            providesTags: (result, _error, { id }) =>
                result ? createItemCacheTags('Booking', id) : [],
        }),

        // Get bookings for a specific user (customer or worker)
        getBookingsByUser: builder.query<
            { data: Booking[]; pagination: PaginatedResponse<Booking>['pagination'] },
            GetBookingsByUserRequest
        >({
            query: ({ userId, role, ...params }) => {
                const queryString = createQueryString({
                    ...params,
                    [`${role}Id`]: userId,
                });
                return {
                    url: `/bookings/user/${userId}${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Booking>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result, _error, { userId, role }) =>
                result
                    ? [
                        ...createListCacheTags('Booking', result.data),
                        { type: 'BookingHistory' as any, id: `${role}-${userId}` },
                    ]
                    : [{ type: 'BookingHistory' as any, id: `${role}-${userId}` }],
        }),

        // Get customer bookings (legacy compatibility)
        getCustomerBookings: builder.query<
            { data: Booking[]; pagination: PaginatedResponse<Booking>['pagination'] },
            Omit<GetBookingsByUserRequest, 'role'>
        >({
            query: ({ userId, ...params }) => {
                const queryString = createQueryString({
                    ...params,
                    customerId: userId,
                });
                return {
                    url: `/bookings/customer/${userId}${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Booking>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result, _error, { userId }) =>
                result
                    ? [
                        ...createListCacheTags('Booking', result.data),
                        { type: 'BookingHistory' as any, id: `customer-${userId}` },
                    ]
                    : [{ type: 'BookingHistory' as any, id: `customer-${userId}` }],
        }),

        // Get worker bookings (legacy compatibility)
        getWorkerBookings: builder.query<
            { data: Booking[]; pagination: PaginatedResponse<Booking>['pagination'] },
            Omit<GetBookingsByUserRequest, 'role'>
        >({
            query: ({ userId, ...params }) => {
                const queryString = createQueryString({
                    ...params,
                    workerId: userId,
                });
                return {
                    url: `/bookings/worker/${userId}${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Booking>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result, _error, { userId }) =>
                result
                    ? [
                        ...createListCacheTags('Booking', result.data),
                        { type: 'BookingHistory' as any, id: `worker-${userId}` },
                    ]
                    : [{ type: 'BookingHistory' as any, id: `worker-${userId}` }],
        }),

        // Get bookings by service
        getBookingsByService: builder.query<
            { data: Booking[]; pagination: PaginatedResponse<Booking>['pagination'] },
            GetBookingsByServiceRequest
        >({
            query: ({ serviceId, ...params }) => {
                const queryString = createQueryString(params);
                return {
                    url: `/bookings/service/${serviceId}${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Booking>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result, _error, { serviceId }) =>
                result
                    ? [
                        ...createListCacheTags('Booking', result.data),
                        { type: 'ServiceProvider' as any, id: serviceId },
                    ]
                    : [{ type: 'ServiceProvider' as any, id: serviceId }],
        }),

        // Get pending bookings
        getPendingBookings: builder.query<
            { data: Booking[]; pagination: PaginatedResponse<Booking>['pagination'] },
            Omit<GetBookingsRequest, 'status'>
        >({
            query: (params) => {
                const queryString = createQueryString({
                    ...params,
                    status: ['pending'],
                });
                return {
                    url: `/bookings/pending${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Booking>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...createListCacheTags('Booking', result.data),
                        { type: 'BookingStatus' as any, id: 'PENDING' },
                    ]
                    : [{ type: 'BookingStatus' as any, id: 'PENDING' }],
        }),

        // Get active bookings (accepted, in_progress)
        getActiveBookings: builder.query<
            { data: Booking[]; pagination: PaginatedResponse<Booking>['pagination'] },
            Omit<GetBookingsRequest, 'status'>
        >({
            query: (params) => {
                const queryString = createQueryString({
                    ...params,
                    status: ['accepted', 'in_progress'],
                });
                return {
                    url: `/bookings/active${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: PaginatedResponse<Booking>) => ({
                data: transformResponse(response),
                pagination: response.pagination,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...createListCacheTags('Booking', result.data),
                        { type: 'BookingStatus' as any, id: 'ACTIVE' },
                    ]
                    : [{ type: 'BookingStatus' as any, id: 'ACTIVE' }],
        }),

        // Create new booking
        createBooking: builder.mutation<Booking, CreateBookingRequest>({
            query: ({ data }) => ({
                url: '/bookings',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: ApiResponse<Booking>) => transformResponse(response),
            invalidatesTags: (result) =>
                result
                    ? [
                        ...createListInvalidationTags('Booking'),
                        { type: 'BookingHistory' as any, id: `customer-${result.customerId}` },
                        { type: 'BookingHistory' as any, id: `worker-${result.workerId}` },
                        { type: 'ServiceProvider' as any, id: result.serviceId },
                        { type: 'BookingStatus' as any, id: 'PENDING' },
                    ]
                    : [],
        }),

        // Update booking
        updateBooking: builder.mutation<Booking, UpdateBookingRequest>({
            query: ({ id, data }) => ({
                url: `/bookings/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: ApiResponse<Booking>) => transformResponse(response),
            invalidatesTags: (result, _error, { id }) =>
                result
                    ? [
                        ...createItemInvalidationTags('Booking', id),
                        { type: 'BookingHistory' as any, id: `customer-${result.customerId}` },
                        { type: 'BookingHistory' as any, id: `worker-${result.workerId}` },
                    ]
                    : [],
        }),

        // Update booking status with real-time updates
        updateBookingStatus: builder.mutation<Booking, UpdateBookingStatusRequest>({
            query: ({ id, status, notes }) => ({
                url: `/bookings/${id}/status`,
                method: 'PATCH',
                body: { status, notes },
            }),
            transformResponse: (response: ApiResponse<Booking>) => transformResponse(response),
            invalidatesTags: (result, _error, { id, status }) =>
                result
                    ? [
                        ...createItemInvalidationTags('Booking', id),
                        { type: 'BookingHistory' as any, id: `customer-${result.customerId}` },
                        { type: 'BookingHistory' as any, id: `worker-${result.workerId}` },
                        { type: 'BookingStatus' as any, id: 'PENDING' },
                        { type: 'BookingStatus' as any, id: 'ACTIVE' },
                        { type: 'BookingStatus' as any, id: status.toUpperCase() },
                    ]
                    : [],
            // Optimistic update for better UX
            onQueryStarted: async ({ id, status }, { dispatch, queryFulfilled }) => {
                const patchResult = dispatch(
                    bookingsApi.util.updateQueryData('getBookingById', { id }, (draft) => {
                        if (draft) {
                            draft.status = status;
                            draft.updatedAt = new Date().toISOString();
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),

        // Cancel booking
        cancelBooking: builder.mutation<Booking, CancelBookingRequest>({
            query: ({ id, reason, refundAmount }) => ({
                url: `/bookings/${id}/cancel`,
                method: 'PATCH',
                body: { reason, refundAmount },
            }),
            transformResponse: (response: ApiResponse<Booking>) => transformResponse(response),
            invalidatesTags: (result, _error, { id }) =>
                result
                    ? [
                        ...createItemInvalidationTags('Booking', id),
                        { type: 'BookingHistory' as any, id: `customer-${result.customerId}` },
                        { type: 'BookingHistory' as any, id: `worker-${result.workerId}` },
                        { type: 'BookingStatus' as any, id: 'ACTIVE' },
                    ]
                    : [],
        }),

        // Reschedule booking
        rescheduleBooking: builder.mutation<BookingReschedule, RescheduleBookingRequest>({
            query: ({ bookingId, newDate, reason }) => ({
                url: `/bookings/${bookingId}/reschedule`,
                method: 'POST',
                body: { newDate, reason },
            }),
            transformResponse: (response: ApiResponse<BookingReschedule>) => transformResponse(response),
            invalidatesTags: (result, _error, { bookingId }) =>
                result
                    ? [
                        ...createItemInvalidationTags('Booking', bookingId),
                    ]
                    : [],
        }),

        // Get available time slots for booking
        getAvailableSlots: builder.query<BookingSlot[], GetAvailableSlotsRequest>({
            query: ({ workerId, serviceId, date }) => {
                const queryString = createQueryString({ serviceId, date });
                return {
                    url: `/bookings/slots/${workerId}${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: ApiResponse<BookingSlot[]>) => transformResponse(response),
            providesTags: (_result, _error, { workerId, date }) => [
                { type: 'ServiceAvailability' as any, id: `${workerId}-${date}` },
            ],
        }),

        // Add message to booking
        addBookingMessage: builder.mutation<BookingMessage, AddBookingMessageRequest>({
            query: ({ bookingId, message, attachments }) => ({
                url: `/bookings/${bookingId}/messages`,
                method: 'POST',
                body: { message, attachments },
            }),
            transformResponse: (response: ApiResponse<BookingMessage>) => transformResponse(response),
            invalidatesTags: (result, _error, { bookingId }) =>
                result
                    ? [
                        { type: 'Message' as any, id: `booking-${bookingId}` },
                    ]
                    : [],
        }),

        // Get booking messages
        getBookingMessages: builder.query<BookingMessage[], { bookingId: string }>({
            query: ({ bookingId }) => ({
                url: `/bookings/${bookingId}/messages`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<BookingMessage[]>) => transformResponse(response),
            providesTags: (_result, _error, { bookingId }) => [
                { type: 'Message' as any, id: `booking-${bookingId}` },
            ],
        }),

        // Get booking status history
        getBookingStatusHistory: builder.query<BookingStatusUpdate[], { bookingId: string }>({
            query: ({ bookingId }) => ({
                url: `/bookings/${bookingId}/status-history`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<BookingStatusUpdate[]>) => transformResponse(response),
            providesTags: (_result, _error, { bookingId }) => [
                { type: 'BookingStatus' as any, id: `history-${bookingId}` },
            ],
        }),

        // Get booking statistics
        getBookingStats: builder.query<BookingStats, GetBookingStatsRequest>({
            query: (params) => {
                const queryString = createQueryString(params);
                return {
                    url: `/bookings/stats${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: ApiResponse<BookingStats>) => transformResponse(response),
            providesTags: (_result, _error, params) => [
                { type: 'Analytics' as any, id: `booking-stats-${params.userId || 'global'}` },
            ],
        }),

        // Get booking payment details
        getBookingPayment: builder.query<BookingPayment, { bookingId: string }>({
            query: ({ bookingId }) => ({
                url: `/bookings/${bookingId}/payment`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<BookingPayment>) => transformResponse(response),
            providesTags: (_result, _error, { bookingId }) => [
                { type: 'BookingPayment' as any, id: bookingId },
            ],
        }),

        // Process booking payment
        processBookingPayment: builder.mutation<
            BookingPayment,
            {
                bookingId: string;
                paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'digital_wallet';
                amount: number;
            }
        >({
            query: ({ bookingId, paymentMethod, amount }) => ({
                url: `/bookings/${bookingId}/payment`,
                method: 'POST',
                body: { paymentMethod, amount },
            }),
            transformResponse: (response: ApiResponse<BookingPayment>) => transformResponse(response),
            invalidatesTags: (result, _error, { bookingId }) =>
                result
                    ? [
                        { type: 'BookingPayment' as any, id: bookingId },
                        ...createItemInvalidationTags('Booking', bookingId),
                    ]
                    : [],
        }),
    }),
});

export const {
    useGetBookingsQuery,
    useGetBookingByIdQuery,
    useGetBookingsByUserQuery,
    useGetCustomerBookingsQuery,
    useGetWorkerBookingsQuery,
    useGetBookingsByServiceQuery,
    useGetPendingBookingsQuery,
    useGetActiveBookingsQuery,
    useCreateBookingMutation,
    useUpdateBookingMutation,
    useUpdateBookingStatusMutation,
    useCancelBookingMutation,
    useRescheduleBookingMutation,
    useGetAvailableSlotsQuery,
    useAddBookingMessageMutation,
    useGetBookingMessagesQuery,
    useGetBookingStatusHistoryQuery,
    useGetBookingStatsQuery,
    useGetBookingPaymentQuery,
    useProcessBookingPaymentMutation,
} = bookingsApi;

export const {
    getBookings,
    getBookingById,
    getBookingsByUser,
    getCustomerBookings,
    getWorkerBookings,
    getBookingsByService,
    getPendingBookings,
    getActiveBookings,
    createBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    rescheduleBooking,
    getAvailableSlots,
    addBookingMessage,
    getBookingMessages,
    getBookingStatusHistory,
    getBookingStats,
    getBookingPayment,
    processBookingPayment,
} = bookingsApi.endpoints;