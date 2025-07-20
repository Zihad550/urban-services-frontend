import type {
    Address,
    ID,
    UserRole,
    WithTimestamps,
    WorkingStatus
} from './common';

// Re-export common types for convenience
export type { UserRole } from './common';

// Base user interface
export interface BaseUser extends WithTimestamps {
    id: ID;
    email: string;
    displayName: string;
    photoURL?: string;
    phoneNumber?: string;
    address?: Address;
    isActive: boolean;
}

// Customer-specific interfaces
export interface CustomerPreferences {
    preferredServiceCategories: string[];
    notificationSettings: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
    id: ID;
    type: 'card' | 'bank' | 'digital_wallet';
    last4?: string;
    isDefault: boolean;
}

export interface Customer extends BaseUser {
    role: 'customer';
    bookingHistory: ID[];
    preferences: CustomerPreferences;
    totalBookings: number;
    averageRating?: number;
}

// Worker-specific interfaces
export interface Availability {
    monday: AvailabilityTimeSlot[];
    tuesday: AvailabilityTimeSlot[];
    wednesday: AvailabilityTimeSlot[];
    thursday: AvailabilityTimeSlot[];
    friday: AvailabilityTimeSlot[];
    saturday: AvailabilityTimeSlot[];
    sunday: AvailabilityTimeSlot[];
}

export interface AvailabilityTimeSlot {
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
}

export interface PortfolioItem {
    id: ID;
    title: string;
    description: string;
    imageUrl: string;
    serviceCategory: string;
    completedDate: string;
}

export interface Worker extends BaseUser {
    role: 'worker';
    services: ID[];
    workingStatus: WorkingStatus;
    availability: Availability;
    rating: number;
    totalRatings: number;
    completedJobs: number;
    portfolio: PortfolioItem[];
    hourlyRate?: number;
    experienceYears: number;
    certifications: string[];
    serviceAreas: string[]; // Array of city/area names
}

// Admin-specific interfaces
export interface AdminPermission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface Admin extends BaseUser {
    role: 'admin';
    permissions: AdminPermission[];
    lastLoginAt?: string;
    isSuperAdmin: boolean;
}

// Union type for all user types
export type User = Customer | Worker | Admin;

// User creation and update types
export type CreateCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'bookingHistory' | 'totalBookings'>;
export type CreateWorkerInput = Omit<Worker, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalRatings' | 'completedJobs'>;
export type CreateAdminInput = Omit<Admin, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>;

export type UpdateUserInput = Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>>;

// Authentication related types
export interface AuthUser {
    uid: string;
    email: string;
    displayName?: string | undefined;
    photoURL?: string | undefined;
    emailVerified: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    displayName: string;
    role: UserRole;
    phoneNumber?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}