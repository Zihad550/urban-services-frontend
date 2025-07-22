import { useAuth } from '@/hooks/useAuth';
import { useGetCustomerDashboardStatsQuery } from '@/redux/api/dashboardApi';
import { useGetCustomerBookingsQuery } from '@/redux/api/bookingsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Home, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const UserDashboardHome = () => {
    const { user } = useAuth();
    const userId = user?.uid || '';

    const {
        data: dashboardStats,
        isLoading: isStatsLoading,
        error: statsError
    } = useGetCustomerDashboardStatsQuery({ customerId: userId }, { skip: !userId });

    const {
        data: bookingsData,
        isLoading: isBookingsLoading,
        error: bookingsError
    } = useGetCustomerBookingsQuery({ userId, limit: 5 }, { skip: !userId });

    const isLoading = isStatsLoading || isBookingsLoading;
    const error = statsError || bookingsError;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-500 rounded-md">
                Error loading dashboard data. Please try again later.
            </div>
        );
    }

    const stats = [
        {
            id: 1,
            title: 'Hired Workers',
            value: dashboardStats?.totalBookings || 0,
            icon: <Calendar className="h-8 w-8 text-blue-500" />,
            bgColor: 'bg-blue-50'
        },
        {
            id: 2,
            title: 'Pending Requests',
            value: dashboardStats?.pendingRequests || 0,
            icon: <Clock className="h-8 w-8 text-amber-500" />,
            bgColor: 'bg-amber-50'
        },
        {
            id: 3,
            title: 'To-Lets Posted',
            value: dashboardStats?.toLetsPosts || 0,
            icon: <Home className="h-8 w-8 text-emerald-500" />,
            bgColor: 'bg-emerald-50'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.id}>
                        <CardContent className={cn("flex items-center justify-between p-6", stat.bgColor)}>
                            <div>
                                <p className="text-3xl font-bold">{stat.value}</p>
                                <h3 className="text-sm font-medium text-muted-foreground mt-1">{stat.title}</h3>
                            </div>
                            <div className="rounded-full p-2 bg-white/80">
                                {stat.icon}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookingsData?.data && bookingsData.data.length > 0 ? (
                            <div className="space-y-4">
                                {bookingsData.data.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <p className="font-medium">{booking.serviceName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Worker: {booking.workerName}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {new Date(booking.scheduledDate).toLocaleDateString()}
                                            </p>
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-full",
                                                booking.status === 'completed' ? "bg-green-100 text-green-800" :
                                                    booking.status === 'pending' ? "bg-amber-100 text-amber-800" :
                                                        booking.status === 'in_progress' ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                            )}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">
                                No bookings found. Book a service to get started!
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardStats.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <p className="font-medium">{activity.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.details}
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(activity.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">
                                No recent activity found.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Import cn utility
import { cn } from '@/lib/utils';