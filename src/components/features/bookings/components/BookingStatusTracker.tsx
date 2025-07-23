import { useState, useEffect } from 'react';
import { useBookingRealTimeUpdates, useBookingWorkflow } from '@/hooks/useBookings';
import { useGetBookingStatusHistoryQuery } from '@/redux/api/bookingsApi';
import { useGetWorkerByIdQuery } from '@/redux/api/workersApi';
import { useGetServiceByIdQuery } from '@/redux/api/servicesApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Calendar,
    User,
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    ArrowRight,
    AlertTriangle
} from 'lucide-react';
import type { BookingStatus } from '@/types/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BookingStatusTrackerProps {
    bookingId: string;
}

const BookingStatusTracker = ({ bookingId }: BookingStatusTrackerProps) => {
    const [showHistory, setShowHistory] = useState(false);
    const [activeTab, setActiveTab] = useState('timeline');

    const { booking, isPolling, enableRealTimeUpdates, disableRealTimeUpdates } =
        useBookingRealTimeUpdates(bookingId);

    const { data: statusHistory } = useGetBookingStatusHistoryQuery(
        { bookingId },
        { skip: !bookingId || !showHistory }
    );

    const { data: worker } = useGetWorkerByIdQuery(
        { id: booking?.workerId || '' },
        { skip: !booking?.workerId }
    );

    const { data: service } = useGetServiceByIdQuery(
        { id: booking?.serviceId || '' },
        { skip: !booking?.serviceId }
    );

    const { canTransitionTo, getNextStatuses, updateStatus } = useBookingWorkflow();

    // Enable real-time updates when component mounts
    useEffect(() => {
        if (booking && !isPolling) {
            enableRealTimeUpdates(5000); // Poll every 5 seconds
        }

        return () => {
            disableRealTimeUpdates();
        };
    }, [booking, isPolling, enableRealTimeUpdates, disableRealTimeUpdates]);

    if (!booking) {
        return (
            <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    // Get status icon and color
    const getStatusInfo = (status: BookingStatus) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock className="h-5 w-5" />,
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    label: 'Pending',
                    progress: 20
                };
            case 'accepted':
                return {
                    icon: <CheckCircle className="h-5 w-5" />,
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    label: 'Accepted',
                    progress: 40
                };
            case 'in_progress':
                return {
                    icon: <ArrowRight className="h-5 w-5" />,
                    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    label: 'In Progress',
                    progress: 60
                };
            case 'completed':
                return {
                    icon: <CheckCircle className="h-5 w-5" />,
                    color: 'bg-green-100 text-green-800 border-green-200',
                    label: 'Completed',
                    progress: 100
                };
            case 'cancelled':
                return {
                    icon: <XCircle className="h-5 w-5" />,
                    color: 'bg-red-100 text-red-800 border-red-200',
                    label: 'Cancelled',
                    progress: 0
                };
            case 'rejected':
                return {
                    icon: <AlertCircle className="h-5 w-5" />,
                    color: 'bg-red-100 text-red-800 border-red-200',
                    label: 'Rejected',
                    progress: 0
                };
            default:
                return {
                    icon: <Clock className="h-5 w-5" />,
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    label: status,
                    progress: 0
                };
        }
    };

    const statusInfo = getStatusInfo(booking.status);
    const nextStatuses = getNextStatuses(booking.status);

    // Handle status update
    const handleStatusUpdate = async (newStatus: BookingStatus) => {
        if (canTransitionTo(booking.status, newStatus)) {
            await updateStatus(booking.id, booking.status, newStatus);
        }
    };

    // Get status step information
    const getStatusSteps = () => {
        const steps = [
            { status: 'pending', label: 'Pending', icon: <Clock className="h-5 w-5" /> },
            { status: 'accepted', label: 'Accepted', icon: <CheckCircle className="h-5 w-5" /> },
            { status: 'in_progress', label: 'In Progress', icon: <ArrowRight className="h-5 w-5" /> },
            { status: 'completed', label: 'Completed', icon: <CheckCircle className="h-5 w-5" /> }
        ];

        // Find the current step index
        let currentStepIndex = steps.findIndex(step => step.status === booking.status);

        // Handle special cases
        if (booking.status === 'cancelled' || booking.status === 'rejected') {
            currentStepIndex = -1; // No step is active for cancelled/rejected bookings
        }

        return {
            steps,
            currentStepIndex
        };
    };

    const { steps, currentStepIndex } = getStatusSteps();

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="status">Status Tracker</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-6">
                    {/* Status header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className={`p-2 rounded-full mr-3 ${statusInfo.color}`}>
                                {statusInfo.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Booking #{booking.id.slice(-6)}</h3>
                                <p className="text-gray-500">
                                    Created on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>

                        <Badge className={`${statusInfo.color} border px-3 py-1 text-sm`}>
                            {statusInfo.label}
                        </Badge>
                    </div>

                    {/* Status timeline */}
                    <div className="relative">
                        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>

                        <div className="space-y-8 relative">
                            {/* Booking created */}
                            <div className="flex">
                                <div className="flex-shrink-0 w-10">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-medium">Booking Created</h4>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(booking.createdAt), 'MMM d, yyyy - h:mm a')}
                                    </p>
                                    <div className="mt-2 text-sm">
                                        <p>Service: {service?.name || 'Loading...'}</p>
                                        <p>Scheduled for: {format(new Date(booking.scheduledDate), 'EEEE, MMMM d, yyyy - h:mm a')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Worker assigned */}
                            <div className="flex">
                                <div className="flex-shrink-0 w-10">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-medium">Professional Assigned</h4>
                                    <p className="text-sm text-gray-500">
                                        {worker ? worker.displayName : 'Loading...'}
                                    </p>
                                    {worker && (
                                        <div className="mt-2 flex items-center">
                                            <img
                                                src={worker.photoURL || '/placeholder-avatar.jpg'}
                                                alt={worker.displayName}
                                                className="w-8 h-8 rounded-full object-cover mr-2"
                                            />
                                            <div className="text-sm">
                                                <p>Rating: {worker.rating.toFixed(1)}</p>
                                                <p>{worker.completedJobs} jobs completed</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Service location */}
                            <div className="flex">
                                <div className="flex-shrink-0 w-10">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-medium">Service Location</h4>
                                    <p className="text-sm text-gray-500">
                                        {booking.location.street}, {booking.location.city}, {booking.location.state} {booking.location.zipCode}
                                    </p>
                                </div>
                            </div>

                            {/* Contact information */}
                            <div className="flex">
                                <div className="flex-shrink-0 w-10">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                                        {booking.details?.contactPreference === 'phone' ? (
                                            <Phone className="h-5 w-5" />
                                        ) : booking.details?.contactPreference === 'email' ? (
                                            <Mail className="h-5 w-5" />
                                        ) : (
                                            <MessageSquare className="h-5 w-5" />
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-medium">Contact Preference</h4>
                                    <p className="text-sm text-gray-500 capitalize">
                                        {booking.details?.contactPreference || 'App Notifications'}
                                    </p>
                                </div>
                            </div>

                            {/* Current status */}
                            <div className="flex">
                                <div className="flex-shrink-0 w-10">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${statusInfo.color}`}>
                                        {statusInfo.icon}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-medium">Current Status: {statusInfo.label}</h4>
                                    <p className="text-sm text-gray-500">
                                        Last updated: {format(new Date(booking.updatedAt), 'MMM d, yyyy - h:mm a')}
                                    </p>

                                    {booking.notes && (
                                        <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
                                            <p className="font-medium">Notes:</p>
                                            <p>{booking.notes}</p>
                                        </div>
                                    )}

                                    {/* Status actions */}
                                    {nextStatuses.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {nextStatuses.map((status) => (
                                                <Button
                                                    key={status}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(status)}
                                                >
                                                    {status === 'in_progress' ? 'Mark In Progress' :
                                                        status === 'completed' ? 'Mark Complete' :
                                                            status === 'cancelled' ? 'Cancel Booking' :
                                                                status === 'accepted' ? 'Accept' :
                                                                    status === 'rejected' ? 'Reject' :
                                                                        `Mark as ${status}`}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="status">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Booking Status Tracker</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{statusInfo.progress}%</span>
                                </div>
                                <Progress value={statusInfo.progress} className="h-2" />
                            </div>

                            {/* Status steps */}
                            <div className="relative">
                                {/* Horizontal line connecting steps */}
                                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>

                                {/* Steps */}
                                <div className="relative flex justify-between">
                                    {steps.map((step, index) => {
                                        // Determine step status
                                        let stepStatus: 'completed' | 'current' | 'upcoming' = 'upcoming';
                                        if (index < currentStepIndex) {
                                            stepStatus = 'completed';
                                        } else if (index === currentStepIndex) {
                                            stepStatus = 'current';
                                        }

                                        // Determine step styling
                                        const circleClasses = stepStatus === 'completed'
                                            ? 'bg-green-500 text-white border-green-500'
                                            : stepStatus === 'current'
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-white text-gray-400 border-gray-300';

                                        const textClasses = stepStatus === 'completed'
                                            ? 'text-green-500'
                                            : stepStatus === 'current'
                                                ? 'text-blue-500 font-medium'
                                                : 'text-gray-500';

                                        return (
                                            <div key={step.status} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 ${circleClasses}`}>
                                                    {step.icon}
                                                </div>
                                                <span className={`mt-2 text-sm ${textClasses}`}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status details */}
                            <div className="mt-8 space-y-4">
                                {booking.status === 'pending' && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                        <div className="flex items-start">
                                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Pending Confirmation</h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Your booking is waiting for confirmation from the service provider.
                                                    You'll receive a notification once it's confirmed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'accepted' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                        <div className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-800">Booking Confirmed</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Your booking has been confirmed! The service provider will arrive at the scheduled time.
                                                    You can contact them if you need to make any changes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'in_progress' && (
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                                        <div className="flex items-start">
                                            <ArrowRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-indigo-800">Service In Progress</h4>
                                                <p className="text-sm text-indigo-700 mt-1">
                                                    Your service is currently being performed. The service provider has marked the job as in progress.
                                                    You'll be notified when the service is completed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'completed' && (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                        <div className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-green-800">Service Completed</h4>
                                                <p className="text-sm text-green-700 mt-1">
                                                    Your service has been successfully completed! Please leave a review to help others
                                                    find great service providers.
                                                </p>
                                                <Button variant="outline" size="sm" className="mt-2">
                                                    Leave a Review
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'cancelled' && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <div className="flex items-start">
                                            <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-red-800">Booking Cancelled</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    This booking has been cancelled. If you have any questions or would like to book again,
                                                    please contact customer support.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'rejected' && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <div className="flex items-start">
                                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-red-800">Booking Rejected</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    Unfortunately, this booking request has been rejected by the service provider.
                                                    This could be due to scheduling conflicts or unavailability.
                                                </p>
                                                <Button variant="outline" size="sm" className="mt-2">
                                                    Find Another Provider
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Estimated completion time */}
                            {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Estimated Completion</h4>
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                                        <span>
                                            {booking.status === 'in_progress'
                                                ? `Approximately ${booking.estimatedDuration} minutes from start time`
                                                : `Scheduled for ${format(new Date(booking.scheduledDate), 'MMMM d, yyyy - h:mm a')}`}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!statusHistory || statusHistory.length === 0 ? (
                                <div className="flex justify-center items-center py-8">
                                    <Button variant="outline" onClick={() => setShowHistory(true)}>
                                        Load Status History
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {statusHistory.map((update) => (
                                        <div key={update.id} className="py-3">
                                            <div className="flex justify-between">
                                                <div className="flex items-center">
                                                    <Badge className="mr-2">
                                                        {update.previousStatus} → {update.newStatus}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        by {update.updatedByRole}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {format(new Date(update.updatedAt), 'MMM d, yyyy - h:mm a')}
                                                </span>
                                            </div>
                                            {update.notes && (
                                                <p className="text-sm mt-1 text-gray-600">{update.notes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BookingStatusTracker;