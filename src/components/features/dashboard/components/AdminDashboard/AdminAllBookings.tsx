import { useGetBookingsQuery } from "@/redux/api/bookingsApi";
import type { Booking } from "@/types/booking";
import { Badge } from "@/components/ui";
import { Loader2 } from "lucide-react";

// Extended booking type with customer and worker names/emails
interface BookingWithNames extends Booking {
    customerName?: string;
    customerEmail?: string;
    workerName?: string;
    workerEmail?: string;
    serviceName?: string;
}

export const AdminAllBookings = () => {
    // Fetch bookings data using RTK Query
    const { data: bookingsResponse, isLoading, error } = useGetBookingsQuery({
        limit: 10, // Limit to 10 recent bookings
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const bookings = bookingsResponse?.data || [];

    // Define table headers
    const headers = [
        "Customer Name",
        "Customer Email",
        "Worker Name",
        "Worker Email",
        "Service",
        "Status"
    ];

    // Helper function to get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 'accepted':
                return "bg-blue-100 text-blue-800 border-blue-200";
            case 'in_progress':
                return "bg-purple-100 text-purple-800 border-purple-200";
            case 'completed':
                return "bg-green-100 text-green-800 border-green-200";
            case 'cancelled':
                return "bg-red-100 text-red-800 border-red-200";
            case 'rejected':
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                <p>Error loading bookings. Please try again later.</p>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
                <p>No bookings found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking: BookingWithNames) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {booking.customerName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.customerEmail || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.workerName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.workerEmail || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.serviceName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className={getStatusColor(booking.status)}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};