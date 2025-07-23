import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking, useBookingMutations, useBookingWorkflow } from '@/hooks/useBookings';
import { useGetWorkerByIdQuery } from '@/redux/api/workersApi';
import { useGetServiceByIdQuery } from '@/redux/api/servicesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, FileText, AlertCircle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import BookingStatusTracker from './BookingStatusTracker';
import BookingPaymentDetails from './BookingPaymentDetails';
import BookingMessages from './BookingMessages';

interface BookingDetailsProps {
    bookingId: string;
}

const BookingDetails = ({ bookingId }: BookingDetailsProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const { booking, isLoading, refetch } = useBooking({ id: bookingId });
    const { cancelBooking, isCancelling } = useBookingMutations();
    const { canTransitionTo } = useBookingWorkflow();

    const { data: worker } = useGetWorkerByIdQuery(
        { id: booking?.workerId || '' },
        { skip: !booking?.workerId }
    );

    const { data: service } = useGetServiceByIdQuery(
        { id: booking?.serviceId || '' },
        { skip: !booking?.serviceId }
    );

    const handleCancelBooking = async () => {
        if (!booking) return;

        const result = await cancelBooking(booking.id, cancelReason);

        if (result.success) {
            toast({
                title: 'Booking cancelled',
                description: 'Your booking has been cancelled successfully.',
            });
            setIsCancelDialogOpen(false);
            refetch();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to cancel booking. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const getStatusBadge = () => {
        if (!booking) return null;

        switch (booking.status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case 'accepted':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Accepted</Badge>;
            case 'in_progress':
                return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">In Progress</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{booking.status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    if (!booking) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Booking Not Found</CardTitle>
                    <CardDescription>The booking you're looking for doesn't exist or has been removed.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => navigate('/dashboard/bookings')}>Back to Bookings</Button>
                </CardFooter>
            </Card>
        );
    }

    const canCancel = canTransitionTo(booking.status, 'cancelled');
    const isActive = ['pending', 'accepted', 'in_progress'].includes(booking.status);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                        Booking #{booking.id.slice(-6)}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Created on {format(new Date(booking.createdAt), 'MMMM d, yyyy')}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
                    {getStatusBadge()}

                    {canCancel && (
                        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive border-destructive/20 hover:bg-destructive/10 w-full sm:w-auto"
                                    aria-label="Cancel this booking"
                                >
                                    <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Cancel Booking
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cancel Booking</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to cancel this booking? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <label htmlFor="reason" className="block text-sm font-medium mb-2">
                                        Reason for cancellation
                                    </label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Please provide a reason for cancellation..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="resize-none"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                                        Keep Booking
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelBooking}
                                        disabled={isCancelling || !cancelReason.trim()}
                                    >
                                        {isCancelling ? (
                                            <>
                                                <LoadingSpinner className="mr-2 h-4 w-4" />
                                                Cancelling...
                                            </>
                                        ) : (
                                            'Cancel Booking'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="status">Status Tracker</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-lg">{service?.name || 'Loading...'}</h3>
                                    <p className="text-gray-500 capitalize">{service?.category || ''}</p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                            <span className="text-sm">{booking.estimatedDuration} minutes</span>
                                        </div>
                                        <div className="flex items-center">
                                            <AlertCircle className="h-4 w-4 text-gray-500 mr-1" />
                                            <span className="text-sm capitalize">
                                                {booking.details?.urgencyLevel || 'medium'} urgency
                                            </span>
                                        </div>
                                    </div>
                                    {service?.description && (
                                        <p className="mt-2 text-sm">{service.description}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Professional</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {worker ? (
                                    <div className="flex items-center">
                                        <div className="mr-4">
                                            <div className="w-16 h-16 rounded-full overflow-hidden">
                                                <img
                                                    src={worker.photoURL || '/placeholder-avatar.jpg'}
                                                    alt={worker.displayName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{worker.displayName}</h3>
                                            <div className="flex items-center mt-1">
                                                <User className="h-4 w-4 text-gray-500 mr-1" />
                                                <span className="text-sm text-gray-500">
                                                    {worker.completedJobs} jobs completed
                                                </span>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <CheckCircle className="h-4 w-4 text-gray-500 mr-1" />
                                                <span className="text-sm text-gray-500">
                                                    Rating: {worker.rating.toFixed(1)}/5
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-20">
                                        <LoadingSpinner />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule & Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                                    <div>
                                        <p className="font-medium">
                                            {format(new Date(booking.scheduledDate), 'EEEE, MMMM d, yyyy')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(booking.scheduledDate), 'h:mm a')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                                    <div>
                                        <p className="font-medium">Service Location</p>
                                        <p className="text-sm text-gray-500">
                                            {booking.location.street}, {booking.location.city}, {booking.location.state} {booking.location.zipCode}
                                        </p>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p className="text-sm font-medium mb-1">Additional Notes:</p>
                                        <p className="text-sm">{booking.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {isActive && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-3">
                                <Button variant="outline" onClick={() => setActiveTab('messages')}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>

                                <Button variant="outline" onClick={() => setActiveTab('status')}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Track Status
                                </Button>

                                {booking.status === 'completed' && booking.paymentStatus !== 'completed' && (
                                    <Button variant="outline" onClick={() => setActiveTab('payment')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Complete Payment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="status">
                    <Card>
                        <CardContent className="pt-6">
                            <BookingStatusTracker bookingId={booking.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment">
                    <Card>
                        <CardContent className="pt-6">
                            <BookingPaymentDetails bookingId={booking.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="messages">
                    <Card>
                        <CardContent className="pt-6">
                            <BookingMessages bookingId={booking.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
};

export default BookingDetails;