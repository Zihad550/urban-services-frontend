import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '../BookingWizard';
import { Service } from '@/types/service';
import { useGetAvailableSlotsQuery } from '@/redux/api/bookingsApi';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { format, addDays, isSameDay, parseISO, setHours, setMinutes } from 'date-fns';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, MapPin, Phone, Mail, MessageSquare } from 'lucide-react';

interface ScheduleStepProps {
    form: UseFormReturn<BookingFormData>;
    service: Service;
}

const ScheduleStep = ({ form, service }: ScheduleStepProps) => {
    const [selectedDate, setSelectedDate] = useState<Date>(form.getValues('scheduledDate') || new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const workerId = form.getValues('workerId');

    const { data: availableSlots, isLoading } = useGetAvailableSlotsQuery(
        {
            workerId,
            serviceId: service.id,
            date: format(selectedDate, 'yyyy-MM-dd'),
        },
        { skip: !workerId || !service.id }
    );

    // Group time slots by hour for better UI organization
    const timeSlots = availableSlots ? groupTimeSlotsByHour(availableSlots) : {};

    // Update the form value when date or time changes
    useEffect(() => {
        if (selectedDate && selectedTime) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const dateTime = setMinutes(setHours(selectedDate, hours), minutes);
            form.setValue('scheduledDate', dateTime);
        }
    }, [selectedDate, selectedTime, form]);

    // Set initial time if available
    useEffect(() => {
        if (availableSlots?.length && !selectedTime) {
            const firstSlot = availableSlots[0];
            const time = format(parseISO(firstSlot.startTime), 'HH:mm');
            setSelectedTime(time);
        }
    }, [availableSlots, selectedTime]);

    // Group time slots by hour for better UI
    function groupTimeSlotsByHour(slots: any[]) {
        return slots.reduce((acc: Record<string, any[]>, slot) => {
            const startTime = parseISO(slot.startTime);
            const hour = format(startTime, 'HH');
            const timeStr = format(startTime, 'HH:mm');

            if (!acc[hour]) {
                acc[hour] = [];
            }

            acc[hour].push({
                ...slot,
                timeStr,
            });

            return acc;
        }, {});
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CalendarIcon className="h-5 w-5 mr-2" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                            className="border rounded-md p-3"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Select Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[240px]">
                                <LoadingSpinner />
                            </div>
                        ) : !availableSlots || availableSlots.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-[240px] border rounded-md p-4 text-center">
                                <p className="text-gray-500 mb-2">No available slots for this date</p>
                                <p className="text-sm text-gray-400">Please select another date or worker</p>
                            </div>
                        ) : (
                            <div className="border rounded-md p-4 h-[240px] overflow-y-auto">
                                {Object.entries(timeSlots).map(([hour, slots]) => (
                                    <div key={hour} className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">{hour}:00</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    onClick={() => setSelectedTime(slot.timeStr)}
                                                    className={cn(
                                                        "py-1 px-2 text-sm rounded-md border",
                                                        selectedTime === slot.timeStr
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-white hover:bg-gray-50 border-gray-200"
                                                    )}
                                                >
                                                    {slot.timeStr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Selected Date & Time:</p>
                <p className="text-gray-700">
                    {selectedDate && selectedTime
                        ? format(
                            setMinutes(
                                setHours(selectedDate, parseInt(selectedTime.split(':')[0])),
                                parseInt(selectedTime.split(':')[1])
                            ),
                            'EEEE, MMMM d, yyyy - h:mm a'
                        )
                        : 'Please select a date and time'}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Service Location
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="location.street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location.city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="City" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location.state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                        <Input placeholder="State" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location.zipCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zip Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Zip Code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location.country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="saveAddress"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <Label htmlFor="saveAddress">
                                        Save this address for future bookings
                                    </Label>
                                    <FormDescription>
                                        Your address will be saved to your profile for convenience.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Add any specific instructions or details about the service request..."
                                className="resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Preferred Contact Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="contactPreference"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                            <RadioGroupItem value="phone" id="contact-phone" />
                                            <Label htmlFor="contact-phone" className="flex items-center cursor-pointer">
                                                <Phone className="mr-2 h-4 w-4" />
                                                Phone
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                            <RadioGroupItem value="email" id="contact-email" />
                                            <Label htmlFor="contact-email" className="flex items-center cursor-pointer">
                                                <Mail className="mr-2 h-4 w-4" />
                                                Email
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                            <RadioGroupItem value="app" id="contact-app" />
                                            <Label htmlFor="contact-app" className="flex items-center cursor-pointer">
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                App Notifications
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default ScheduleStep;