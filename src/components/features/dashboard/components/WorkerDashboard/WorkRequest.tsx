import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetWorkerBookingsQuery, useUpdateBookingStatusMutation } from "@/redux/api/bookingsApi";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStatus } from "@/types/common";
import { Booking } from "@/types/booking";
import { toast } from "sonner";

export const WorkRequest = () => {
    const { user } = useAuth();
    const workerId = user?.id || "";
    const [page, setPage] = useState(1);
    const limit = 10;

    const {
        data: bookingsData,
        isLoading,
        error,
        refetch
    } = useGetWorkerBookingsQuery({
        userId: workerId,
        status: ["pending"],
        page,
        limit
    });

    const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();

    const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
        try {
            await updateBookingStatus({
                id: bookingId,
                status,
                notes: `Request ${status} by worker`
            }).unwrap();

            toast.success(`Booking ${status} successfully`);
        } catch (error) {
            console.error("Failed to update booking status:", error);
            toast.error("Failed to update booking status");
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error loading work requests
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>Please try refreshing the page.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const bookings = bookingsData?.data || [];
    const totalPages = bookingsData?.pagination?.totalPages || 1;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Work Requests</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Review and respond to new job requests from customers.
                </p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        You don't have any pending work requests at the moment.
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <RequestItem
                                key={booking.id}
                                booking={booking}
                                onStatusUpdate={handleStatusUpdate}
                                isUpdating={isUpdating}
                            />
                        ))}
                    </ul>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{page}</span> of{" "}
                                <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <Button
                                    variant="outline"
                                    className="rounded-l-md"
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === page ? "default" : "outline"}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    className="rounded-r-md"
                                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface RequestItemProps {
    booking: Booking;
    onStatusUpdate: (bookingId: string, status: BookingStatus) => void;
    isUpdating: boolean;
}

const RequestItem = ({ booking, onStatusUpdate, isUpdating }: RequestItemProps) => {
    return (
        <li>
            <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <p className="truncate text-sm font-medium text-indigo-600">
                            Request #{booking.id.substring(0, 8)}
                        </p>
                        <div className="ml-2 flex-shrink-0">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                            </span>
                        </div>
                    </div>
                    <div className="ml-2 flex flex-shrink-0">
                        <p className="text-sm text-gray-500">
                            ${booking.totalAmount.toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                            Service: {booking.serviceId}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Customer: {booking.customerId}
                        </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                            Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        {booking.notes || "No additional notes provided."}
                    </p>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => onStatusUpdate(booking.id, "accepted")}
                        disabled={isUpdating}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusUpdate(booking.id, "rejected")}
                        disabled={isUpdating}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                </div>
            </div>
        </li>
    );
};

export default WorkRequest;