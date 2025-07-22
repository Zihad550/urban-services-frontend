import { z } from 'zod';
import type { UserRole } from '../../types/user';

// Login form validation schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email({ message: 'Please enter a valid email address' }),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

// Register form validation schema
export const registerSchema = z.object({
    displayName: z
        .string()
        .min(1, 'Display name is required')
        .min(2, 'Display name must be at least 2 characters')
        .max(50, 'Display name must be less than 50 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email({ message: 'Please enter a valid email address' }),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
    role: z.enum(['customer', 'worker'], {
        message: 'Please select a role',
    }),
    phoneNumber: z
        .string()
        .optional()
        .refine((val) => !val || /^\+?[\d\s-()]+$/.test(val), {
            message: 'Please enter a valid phone number',
        }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Transform register form data to RegisterData type for the auth slice
export const transformRegisterData = (formData: RegisterFormData): {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    phoneNumber?: string;
} => ({
    email: formData.email,
    password: formData.password,
    displayName: formData.displayName,
    role: formData.role as UserRole,
    ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
});