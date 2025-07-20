import type {
    CreateInput,
    ID,
    PriceType,
    ServiceCategoryType,
    UpdateInput,
    WithTimestamps
} from './common';

// Service interfaces
export interface Service extends WithTimestamps {
    id: ID;
    name: string;
    category: ServiceCategoryType;
    description: string;
    basePrice: number;
    priceType: PriceType;
    duration: number; // in minutes
    isActive: boolean;
    requirements: string[];
    tags: string[];
    imageUrl?: string;
    popularity: number; // for sorting/recommendations
}

export interface ServiceCategory {
    id: ID;
    name: string;
    icon: string;
    description: string;
    services: ID[];
    isActive: boolean;
    displayOrder: number;
}

// Service pricing and packages
export interface ServicePackage {
    id: ID;
    serviceId: ID;
    name: string;
    description: string;
    price: number;
    duration: number; // in minutes
    features: string[];
    isPopular: boolean;
}

export interface ServicePricing {
    basePrice: number;
    priceType: PriceType;
    packages?: ServicePackage[];
    additionalCharges?: {
        name: string;
        price: number;
        isOptional: boolean;
    }[];
}

// Service availability and scheduling
export interface ServiceAvailability {
    serviceId: ID;
    workerId: ID;
    availableSlots: TimeSlot[];
    blackoutDates: string[]; // ISO date strings
    advanceBookingDays: number;
}

export interface TimeSlot {
    startTime: string; // ISO datetime string
    endTime: string;   // ISO datetime string
    isBooked: boolean;
    bookingId?: ID;
}

// Service reviews and ratings
export interface ServiceReview {
    id: ID;
    serviceId: ID;
    customerId: ID;
    workerId: ID;
    bookingId: ID;
    rating: number; // 1-5
    comment: string;
    images?: string[];
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceStats {
    serviceId: ID;
    totalBookings: number;
    completedBookings: number;
    averageRating: number;
    totalReviews: number;
    popularityScore: number;
    lastBookedAt?: string;
}

// Service search and filtering
export interface ServiceFilters {
    category?: ServiceCategoryType;
    priceRange?: {
        min: number;
        max: number;
    };
    rating?: number;
    availability?: {
        date: string;
        timeSlot?: string;
    };
    location?: {
        city: string;
        radius?: number; // in km
    };
    tags?: string[];
}

export interface ServiceSearchResult {
    services: Service[];
    totalCount: number;
    filters: ServiceFilters;
    sortBy: 'popularity' | 'price' | 'rating' | 'newest';
    sortOrder: 'asc' | 'desc';
}

// Service creation and update types
export type CreateServiceInput = CreateInput<Service>;
export type UpdateServiceInput = UpdateInput<Service>;

export type CreateServiceCategoryInput = CreateInput<ServiceCategory>;
export type UpdateServiceCategoryInput = UpdateInput<ServiceCategory>;

// Service worker assignment
export interface ServiceWorkerAssignment {
    serviceId: ID;
    workerId: ID;
    isActive: boolean;
    assignedAt: string;
    specializations?: string[];
    customPricing?: {
        basePrice: number;
        priceType: PriceType;
    };
}