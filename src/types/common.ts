// Common utility types and shared interfaces

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Rating {
    score: number; // 1-5
    comment?: string;
    createdAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Timestamps {
    createdAt: string;
    updatedAt: string;
}

// Utility types for common patterns
export type ID = string;

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export type UserRole = 'customer' | 'worker' | 'admin';

export type WorkingStatus = 'Free' | 'Busy';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type BookingStatus =
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export type ServiceCategoryType = 'electrician' | 'plumber' | 'chef' | 'to_let';

export type PriceType = 'fixed' | 'hourly' | 'custom';

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type WithTimestamps<T = {}> = T & Timestamps;

export type WithId<T> = T & { id: ID };

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;