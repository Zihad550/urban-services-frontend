import { z } from 'zod';

// Common validation patterns
export const phoneRegex = /^\+?[\d\s-()]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
export const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Common validation schemas
export const nameSchema = z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters');

export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email({ message: 'Please enter a valid email address' });

export const passwordSchema = z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    );

export const phoneSchema = z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
        message: 'Please enter a valid phone number',
    });

export const dateSchema = z
    .date({
        required_error: 'Date is required',
        invalid_type_error: 'Please enter a valid date',
    });

export const timeSchema = z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in 24-hour format (HH:MM)');

export const urlSchema = z
    .string()
    .regex(urlRegex, 'Please enter a valid URL');

// Address schema
export const addressSchema = z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
});

// Contact information schema
export const contactInfoSchema = z.object({
    email: emailSchema,
    phone: phoneSchema,
    alternatePhone: phoneSchema,
});

// Create a function to generate a confirmation schema
export const createConfirmationSchema = <T extends z.ZodType>(
    schema: T,
    field: string,
    confirmField: string,
    message: string = "Fields don't match"
) => {
    return schema.refine((data) => data[field] === data[confirmField], {
        message,
        path: [confirmField],
    });
};

// Example usage:
// const registerSchema = createConfirmationSchema(
//   z.object({
//     password: passwordSchema,
//     confirmPassword: z.string().min(1, 'Please confirm your password'),
//   }),
//   'password',
//   'confirmPassword',
//   "Passwords don't match"
// );

// File validation helpers
export const createFileValidationSchema = ({
    maxSize = 5, // in MB
    allowedTypes = [],
    required = false,
}) => {
    let schema = z.instanceof(File)
        .refine(file => file.size <= maxSize * 1024 * 1024, {
            message: `File size must be less than ${maxSize}MB`,
        });

    if (allowedTypes.length > 0) {
        schema = schema.refine(file => allowedTypes.includes(file.type), {
            message: `File type must be one of: ${allowedTypes.join(', ')}`,
        });
    }

    if (!required) {
        schema = schema.optional();
    }

    return schema;
};

// Multiple files validation
export const createMultipleFilesValidationSchema = ({
    maxSize = 5, // in MB
    allowedTypes = [],
    maxFiles = 5,
    required = false,
}) => {
    let schema = z.array(z.instanceof(File)
        .refine(file => file.size <= maxSize * 1024 * 1024, {
            message: `File size must be less than ${maxSize}MB`,
        }))
        .refine(files => files.length <= maxFiles, {
            message: `You can upload a maximum of ${maxFiles} files`,
        });

    if (allowedTypes.length > 0) {
        schema = schema.refine(files => files.every(file => allowedTypes.includes(file.type)), {
            message: `All files must be one of these types: ${allowedTypes.join(', ')}`,
        });
    }

    if (required) {
        schema = schema.refine(files => files.length > 0, {
            message: 'At least one file is required',
        });
    } else {
        schema = schema.optional();
    }

    return schema;
};