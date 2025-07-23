import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '../BookingWizard';
import { Service } from '@/types/service';
import { useGetWorkerByIdQuery } from '@/redux/api/workersApi';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FormField, FormItem, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfirmationStepProps {
    form: UseFormReturn<BookingFormData>;
    service: Service;
}

const ConfirmationStep = ({ form, service }: ConfirmationStepProps) => {
    const [bookingSummary, setBookingSummary] = useState<BookingFormData | null>(null);

    const formValues = form.getValues();
    const workerId = formValues.workerId;

    const { data: worker, isLoading } = useGetWorkerByIdQuery(
        { id: workerId },
        { skip: !workerId }
    );

    // Calculate total based on service price and any additional fees
    const basePrice = service.basePrice;
    const serviceFee = basePrice * 0.05; // 5% service fee
    const taxRate = 0.08; // 8% tax
    const taxes = basePrice * taxRate;
    const total = basePrice + serviceFee + taxes;

    // Get form values for summary
    useEffect(() => {
        setBookingSummary(form.getValues());
    }, [form]);

    if (isLoading || !bookingSummary) {
        return (
            <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="text-xl font-medium mt-2">Booking Summary</h3>
                <p className="text-gray-500">Please review your booking details before confirming</p>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                    <h4 className="font-medium">Service Details</h4>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span>{service.category}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span>{service.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Urgency:</span>
                        <span className="capitalize">{bookingSummary.urgencyLevel}</span>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                    <h4 className="font-medium">Professional</h4>
                </div>
                <div className="p-4">
                    {worker && (
                        <div className="flex items-center">
                            <img
                                src={worker.photoURL || '/placeholder-avatar.jpg'}
                                alt={worker.displayName}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                            <div>
                                <p className="font-medium">{worker.displayName}</p>
                                <p className="text-sm text-gray-500">
                                    Rating: {worker.rating.toFixed(1)} • {worker.completedJobs} jobs completed
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                    <h4 className="font-medium">Schedule & Location</h4>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span>{format(bookingSummary.scheduledDate, 'EEEE, MMMM d, yyyy - h:mm a')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="text-right">
                            {bookingSummary.location.street}, {bookingSummary.location.city}, {bookingSummary.location.state} {bookingSummary.location.zipCode}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Contact Preference:</span>
                        <span className="capitalize">{bookingSummary.contactPreference}</span>
                    </div>
                    {bookingSummary.notes && (
                        <div>
                            <span className="text-gray-600 block mb-1">Additional Notes:</span>
                            <p className="text-sm bg-gray-50 p-2 rounded">{bookingSummary.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                    <h4 className="font-medium">Payment Details</h4>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="capitalize">
                            {bookingSummary.paymentMethod.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Service Price:</span>
                        <span>${basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee:</span>
                        <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Taxes:</span>
                        <span>${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <Alert className="bg-amber-50 border-amber-100">
                <AlertDescription className="text-amber-800">
                    <p className="mb-2">By confirming this booking, you agree to our terms of service and cancellation policy.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Your payment method will be authorized but not charged until the service is completed.</li>
                        <li>Cancellations within 24 hours of the scheduled service may incur a fee.</li>
                        <li>The professional may contact you via your preferred contact method to confirm details.</li>
                    </ul>
                </AlertDescription>
            </Alert>

            <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <Label htmlFor="termsAccepted" className="font-medium">
                                Accept Terms and Conditions
                            </Label>
                            <FormDescription>
                                I have read and agree to the <a href="/terms" target="_blank" className="text-primary underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</a>.
                            </FormDescription>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
};

export default ConfirmationStep;