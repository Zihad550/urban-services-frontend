import { useAuth } from "@/hooks/useAuth";
import { useGetWorkerDashboardStatsQuery } from "@/redux/api/dashboardApi";
import { useGetWorkerBookingsQuery } from "@/redux/api/bookingsApi";
import { useGetWorkerStatsQuery } from "@/redux/api/workersApi";
import { Loader2, AlertCircle } from "lucide-react";
import { BookingStatus } from "@/types/common";

export const WorkerDashboardHome = () => {
    const { user } = useAuth();
    const workerId = user?.id || "";

    const {
        data: dashboardStats,
        isLoading: isLoadingDashboard,
        error: dashboardError
    } = useGetWorkerDashboardStatsQuery({ workerId });

    const {
        data: workerStats,
        isLoading: isLoadingWorkerStats,
        error: workerStatsError
    } = useGetWorkerStatsQuery({ id: workerId });

    const {
        data: bookings,
        isLoading: isLoadingBookings,
        error: bookingsError
    } = useGetWorkerBookingsQuery({
        userId: workerId,
        limit: 5,
        page: 1
    });

    const isLoading = isLoadingDashboard || isLoadingWorkerStats || isLoadingBookings;
    const hasError = dashboardError || workerStatsError || bookingsError;

    // Count bookings by status
    const pendingBookings = bookings?.data.filter(booking => booking.status === "pending").length || 0;
    const activeBookings = bookings?.data.filter(booking => ["accepted", "in_progress"].includes(booking.status)).length || 0;
    const completedBookings = bookings?.data.filter(booking => booking.status === "completed").length || 0;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error loading dashboard data
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>Please try refreshing the page.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            name: "Pending Requests",
            value: pendingBookings,
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-800"
        },
        {
            name: "Active Jobs",
            value: activeBookings,
            bgColor: "bg-blue-100",
            textColor: "text-blue-800"
        },
        {
            name: "Completed Jobs",
            value: completedBookings || workerStats?.completedJobs || 0,
            bgColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            name: "Average Rating",
            value: workerStats?.averageRating?.toFixed(1) || "N/A",
            bgColor: "bg-purple-100",
            textColor: "text-purple-800"
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Welcome back, {user?.displayName}! Here's your work summary.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className={`${stat.bgColor} overflow-hidden rounded-lg shadow`}
                    >
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">
                                {stat.name}
                            </dt>
                            <dd className={`mt-1 text-3xl font-semibold ${stat.textColor}`}>
                                {stat.value}
                            </dd>
                        </div>
                    </div>
                ))}
            </div>

            {/* Earnings Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Earnings Overview
                    </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <dt className="text-sm font-medium text-gray-500">
                                Total Earnings
                            </dt>
                            <dd className="mt-1 text-2xl font-semibold text-green-700">
                                ${workerStats?.totalEarnings?.toFixed(2) || "0.00"}
                            </dd>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <dt className="text-sm font-medium text-gray-500">
                                Monthly Earnings
                            </dt>
                            <dd className="mt-1 text-2xl font-semibold text-blue-700">
                                ${workerStats?.monthlyEarnings?.toFixed(2) || "0.00"}
                            </dd>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <dt className="text-sm font-medium text-gray-500">
                                Completion Rate
                            </dt>
                            <dd className="mt-1 text-2xl font-semibold text-purple-700">
                                {workerStats?.completionRate?.toFixed(0) || 0}%
                            </dd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Recent Bookings
                    </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    {bookings && bookings.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.data.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {booking.customerId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.serviceId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.scheduledDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${booking.totalAmount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent bookings found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper function to get status color
function getStatusColor(status: BookingStatus): string {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800";
        case "accepted":
            return "bg-blue-100 text-blue-800";
        case "in_progress":
            return "bg-indigo-100 text-indigo-800";
        case "completed":
            return "bg-green-100 text-green-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        case "rejected":
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export default WorkerDashboardHome;