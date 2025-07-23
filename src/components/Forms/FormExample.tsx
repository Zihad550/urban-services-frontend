import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PHForm } from './PHForm';
import { PHInput } from './PHInput';
import { PHSelectField } from './PHSelectField';
import { PHDatePicker } from './PHDatePicker';
import { PHTimePicker } from './PHTimePicker';
import { PHFileUploader } from './PHFileUploader';
import { createConfirmationSchema, emailSchema, nameSchema, passwordSchema, phoneSchema } from '@/lib/validations/forms';

// Define the form schema
const formSchema = createConfirmationSchema(
    z.object({
        fullName: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        role: z.enum(['customer', 'worker', 'admin'], {
            required_error: 'Please select a role',
        }),
        phone: phoneSchema,
        birthDate: z.date().optional(),
        appointmentTime: z.string().optional(),
        profilePicture: z.instanceof(File).optional(),
        agreeToTerms: z.boolean().refine(val => val === true, {
            message: 'You must agree to the terms and conditions',
        }),
    }),
    'password',
    'confirmPassword',
    "Passwords don't match"
);

// Infer the form data type from the schema
type FormData = z.infer<typeof formSchema>;

export const FormExample = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: FormData) => {
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Form submitted:', data);
            toast.success('Form submitted successfully!');
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleOptions = [
        { value: 'customer', label: 'Customer' },
        { value: 'worker', label: 'Service Provider' },
        { value: 'admin', label: 'Administrator' },
    ];

    return (
        <div className="max-w-md w-full mx-auto p-4 sm:p-6 bg-card dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Registration Form</h2>

            <PHForm
                schema={formSchema}
                onSubmit={handleSubmit}
                defaultValues={{
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'customer',
                    phone: '',
                    agreeToTerms: false,
                }}
                className="space-y-6"
                ariaLabel="Registration form"
            >
                <div className="grid grid-cols-1 gap-6">
                    <PHInput
                        name="fullName"
                        label="Full Name"
                        placeholder="Enter your full name"
                        required
                        autoComplete="name"
                    />

                    <PHInput
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                    />

                    <PHInput
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Create a password"
                        required
                        showPasswordToggle
                        description="Password must contain at least one uppercase letter, one lowercase letter, and one number"
                    />

                    <PHInput
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        showPasswordToggle
                    />

                    <PHSelectField
                        name="role"
                        label="Role"
                        options={roleOptions}
                        required
                    />

                    <PHInput
                        name="phone"
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PHDatePicker
                            name="birthDate"
                            label="Date of Birth"
                            placeholder="Select your date of birth"
                            maxDate={new Date()}
                        />

                        <PHTimePicker
                            name="appointmentTime"
                            label="Preferred Time"
                            placeholder="Select a time"
                            interval={15}
                        />
                    </div>

                    <PHFileUploader
                        name="profilePicture"
                        label="Profile Picture"
                        accept=".jpg,.jpeg,.png"
                        description="Upload a profile picture (max 2MB)"
                        maxSize={2}
                    />

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            name="agreeToTerms"
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            aria-required="true"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-foreground">
                            I agree to the <a href="#" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">Terms and Conditions</a>
                        </label>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-6 min-h-[44px]"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Register'}
                </Button>
            </PHForm>
        </div>
    );
};