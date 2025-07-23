import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useBookingMutations } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import type { Service } from '@/types/service';
import type { CreateBookingInput } from '@/types/booking';
import ServiceDetailsStep from './steps/ServiceDetailsStep';
import ScheduleStep from './steps/ScheduleStep';
import WorkerSelectionStep from './steps/WorkerSelectionStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';
import { Loader2 } from 'lucide-react';

export type BookingFormData = {
    serviceId: string;
    workerId: string;
    scheduledDate: Date;
    location: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    notes?: string;
    paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'digital_wallet';
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    contactPreference: 'phone' | 'email' | 'app';
    specialRequests?: string[];
};

const bookingFormSchema = z.object({
    serviceId: z.string().min(1, 'Service is required'),
    workerId: z.string().min(1, 'Worker is required'),
    scheduledDate: z.date({
        required_error: 'Please select a date and time',
    }),
    location: z.object({
        street: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zipCode: z.string().min(1, 'Zip code is required'),
        country: z.string().min(1, 'Country is required'),
    }),
    notes: z.string().optional(),
    paymentMethod: z.enum(['card', 'cash', 'bank_transfer', 'digital_wallet']),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']),
    contactPreference: z.enum(['phone', 'email', 'app']),
    specialRequests: z.array(z.string()).optional(),
});

interface BookingWizardProps {
    service: Service;
    onClose?: () => void;
    onBookingComplete?: (bookingId: string) => void;
    onBookingStart?: () => void;
}

const BookingWizard = ({ service, onClose, onBookingComplete, onBookingStart }: BookingWizardProps) => {
    const [step, setStep] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { createBooking, isCreating } = useBookingMutations();

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            serviceId: service.id,
            workerId: '',
            scheduledDate: new Date(),
            location: {
                street: user?.address?.street || '',
                city: user?.address?.city || '',
                state: user?.address?.state || '',
                zipCode: user?.address?.zipCode || '',
                country: user?.address?.country || 'USA',
            },
            paymentMethod: 'card',
            urgencyLevel: 'medium',
            contactPreference: 'app',
            specialRequests: [],
        },
    });

    const steps = [
        { title: 'Service Details', component: ServiceDetailsStep },
        { title: 'Select Worker', component: WorkerSelectionStep },
        { title: 'Schedule', component: ScheduleStep },
        { title: 'Payment', component: PaymentStep },
        { title: 'Confirm', component: ConfirmationStep },
    ];

    const nextStep = async () => {
        const fields = getFieldsForStep(step);
        const result = await form.trigger(fields as any);

        if (result) {
            if (step < steps.length - 1) {
                setStep(step + 1);
            } else {
                await handleSubmit();
            }
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const getFieldsForStep = (stepIndex: number): (keyof BookingFormData)[] => {
        switch (stepIndex) {
            case 0:
                return ['serviceId', 'urgencyLevel', 'specialRequests'];
            case 1:
                return ['workerId'];
            case 2:
                return ['scheduledDate', 'location', 'notes', 'contactPreference'];
            case 3:
                return ['paymentMethod'];
            default:
                return [];
        }
    };

    const handleSubmit = async () => {
        try {
            // Notify that booking process has started
            if (onBookingStart) {
                onBookingStart();
            }

            const formData = form.getValues();

            const bookingData: CreateBookingInput = {
                customerId: user?.id || '',
                workerId: formData.workerId,
                serviceId: formData.serviceId,
                scheduledDate: formData.scheduledDate.toISOString(),
                location: formData.location,
                totalAmount: service.basePrice,
                paymentStatus: 'pending',
                notes: formData.notes,
                estimatedDuration: service.duration,
                details: {
                    urgencyLevel: formData.urgencyLevel,
                    specialRequests: formData.specialRequests || [],
                    contactPreference: formData.contactPreference,
                }
            };

            const result = await createBooking(bookingData);

            if (result.success) {
                toast({
                    title: 'Booking created successfully!',
                    description: 'You can track your booking status in your dashboard.',
                });

                // Call the onBookingComplete callback with the booking ID
                if (onBookingComplete) {
                    onBookingComplete(result.data.id);
                } else if (onClose) {
                    onClose();
                    navigate(`/dashboard/bookings/${result.data.id}`);
                } else {
                    navigate(`/dashboard/bookings/${result.data.id}`);
                }
            } else {
                toast({
                    title: 'Failed to create booking',
                    description: 'Please try again later.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const CurrentStepComponent = steps[step].component;

    return (
        <div className="py-4">
            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {i + 1}
                            </div>
                            <span className="text-xs mt-1">{s.title}</span>
                        </div>
                    ))}
                </div>
                <div className="relative mt-2">
                    <div className="absolute top-0 h-1 bg-gray-200 w-full"></div>
                    <div
                        className="absolute top-0 h-1 bg-primary transition-all"
                        style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Step content */}
            <div className="mb-8">
                <CurrentStepComponent
                    form={form}
                    service={service}
                />
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={step === 0 ? onClose : prevStep}
                    disabled={isCreating}
                >
                    {step === 0 ? 'Cancel' : 'Back'}
                </Button>

                <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : step === steps.length - 1 ? (
                        'Complete Booking'
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default BookingWizard;