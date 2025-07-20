import type {
    Address,
    BookingStatus,
    CreateInput,
    ID,
    PaymentStatus,
    Rating,
    UpdateInput,
    WithTimestamps
} from './common';

// Core booking interface
export interface Booking extends WithTimestamps {
    id: ID;
    customerId: ID;
    workerId: ID;
    serviceId: ID;
    status: BookingStatus;
    scheduledDate: string; // ISO datetime string
    completedDate?: string;
    location: Address;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    notes?: string;
    customerRating?: Rating;
    workerRating?: Rating;
    estimatedDuration: number; // in minutes
    actualDuration?: number; // in minutes
}

// Booking details and metadata
export interface BookingDetails {
    bookingId: ID;
    servicePackage?: ID;
    additionalServices: ID[];
    specialRequests: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    preferredTimeSlot?: {
        startTime: string;
        endTime: string;
    };
    contactPreference: 'phone' | 'email' | 'app';
}

// Payment and billing
export interface BookingPayment {
    id: ID;
    bookingId: ID;
    amount: number;
    paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'digital_wallet';
    transactionId?: string;
    status: PaymentStatus;
    paidAt?: string;
    refundedAt?: string;
    refundAmount?: number;
    fees: {
        serviceFee: number;
        platformFee: number;
        taxes: number;
    };
}

export interface BookingInvoice {
    id: ID;
    bookingId: ID;
    invoiceNumber: string;
    issuedAt: string;
    dueAt: string;
    items: InvoiceItem[];
    subtotal: number;
    taxes: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// Booking communication and updates
export interface BookingMessage {
    id: ID;
    bookingId: ID;
    senderId: ID;
    senderRole: 'customer' | 'worker' | 'admin';
    message: string;
    attachments?: string[];
    isSystemMessage: boolean;
    createdAt: string;
}

export interface BookingStatusUpdate {
    id: ID;
    bookingId: ID;
    previousStatus: BookingStatus;
    newStatus: BookingStatus;
    updatedBy: ID;
    updatedByRole: 'customer' | 'worker' | 'admin';
    reason?: string;
    notes?: string;
    updatedAt: string;
}

// Booking scheduling and availability
export interface BookingSlot {
    id: ID;
    workerId: ID;
    serviceId: ID;
    startTime: string; // ISO datetime string
    endTime: string;
    isAvailable: boolean;
    bookingId?: ID;
    blockedReason?: string;
}

export interface BookingReschedule {
    id: ID;
    bookingId: ID;
    originalDate: string;
    newDate: string;
    requestedBy: ID;
    requestedByRole: 'customer' | 'worker';
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    respondedBy?: ID;
    respondedAt?: string;
    createdAt: string;
}

// Booking analytics and reporting
export interface BookingStats {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating: number;
    totalRevenue: number;
    averageBookingValue: number;
    repeatCustomerRate: number;
    onTimeCompletionRate: number;
}

export interface BookingFilters {
    status?: BookingStatus[];
    dateRange?: {
        startDate: string;
        endDate: string;
    };
    serviceCategory?: string[];
    customerId?: ID;
    workerId?: ID;
    priceRange?: {
        min: number;
        max: number;
    };
    location?: {
        city: string;
        state: string;
    };
}

// Booking creation and update types
export type CreateBookingInput = CreateInput<Booking> & {
    details?: Partial<BookingDetails>;
};

export type UpdateBookingInput = UpdateInput<Booking>;

// Booking workflow types
export interface BookingWorkflow {
    bookingId: ID;
    currentStep: BookingWorkflowStep;
    completedSteps: BookingWorkflowStep[];
    nextSteps: BookingWorkflowStep[];
}

export type BookingWorkflowStep =
    | 'created'
    | 'payment_pending'
    | 'payment_completed'
    | 'worker_assigned'
    | 'worker_confirmed'
    | 'in_progress'
    | 'work_completed'
    | 'customer_review'
    | 'closed';

// Emergency and urgent bookings
export interface EmergencyBooking extends Booking {
    urgencyLevel: 'emergency';
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    emergencyDetails: string;
    responseTimeRequired: number; // in minutes
    additionalCharges: number;
}

// Recurring bookings
export interface RecurringBooking {
    id: ID;
    customerId: ID;
    serviceId: ID;
    workerId?: ID;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
    startDate: string;
    endDate?: string;
    isActive: boolean;
    nextBookingDate: string;
    generatedBookings: ID[];
    preferences: {
        sameWorker: boolean;
        flexibleTiming: boolean;
        autoConfirm: boolean;
    };
    createdAt: string;
    updatedAt: string;
}