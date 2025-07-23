import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetServiceByIdQuery } from '@/redux/api/servicesApi';
import BookingWizard from './BookingWizard/BookingWizard';
import type { Service } from '@/types/service';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';

interface BookingFormProps {
    serviceId: string;
    isOpen: boolean;
    onClose: () => void;
}

const BookingForm = ({ serviceId, isOpen, onClose }: BookingFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        data: service,
        isLoading,
        error
    } = useGetServiceByIdQuery({ id: serviceId }, { skip: !serviceId });

    // Check if user is authenticated when dialog opens
    useEffect(() => {
        if (isOpen && !isAuthenticated) {
            toast({
                title: 'Authentication required',
                description: 'Please sign in to book a service.',
                variant: 'destructive',
            });
            onClose();
            navigate('/auth/login', { state: { redirectTo: `/services/${serviceId}` } });
        }
    }, [isOpen, isAuthenticated, navigate, serviceId, toast, onClose]);

    const handleClose = () => {
        if (isSubmitting) {
            toast({
                title: 'Booking in progress',
                description: 'Please wait until the booking is completed or cancel the process.',
                variant: 'destructive',
            });
            return;
        }
        onClose();
    };

    const handleBookingComplete = (bookingId: string) => {
        setIsSubmitting(false);
        toast({
            title: 'Booking successful!',
            description: 'Your booking has been created successfully.',
        });
        onClose();
        navigate(`/dashboard/bookings/${bookingId}`);
    };

    const handleBookingStart = () => {
        setIsSubmitting(true);
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error || !service) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                        <DialogDescription>
                            There was an error loading the service details. Please try again later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Check if service is available for booking
    if (!service.isActive) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                            Service Unavailable
                        </DialogTitle>
                        <DialogDescription>
                            This service is currently unavailable for booking. Please check back later or browse other available services.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => {
                            onClose();
                            navigate('/services');
                        }}>Browse Services</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 m-2 sm:m-4"
                aria-labelledby="booking-dialog-title"
                aria-describedby="booking-dialog-description"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
                    <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-b border-border">
                        <DialogHeader className="space-y-2 sm:space-y-3">
                            <DialogTitle
                                id="booking-dialog-title"
                                className="text-lg sm:text-xl lg:text-2xl font-semibold"
                            >
                                Book {service.name}
                            </DialogTitle>
                            <DialogDescription
                                id="booking-dialog-description"
                                className="text-sm sm:text-base text-muted-foreground"
                            >
                                Complete the booking process to schedule this service. All fields marked with * are required.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <BookingWizard
                            service={service}
                            onClose={onClose}
                            onBookingComplete={handleBookingComplete}
                            onBookingStart={handleBookingStart}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingForm;