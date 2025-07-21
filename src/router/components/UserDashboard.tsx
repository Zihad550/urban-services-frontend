import { useLoaderData } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import type { UserDashboardLoaderData } from '../types';

export const UserDashboard: React.FC = () => {
    const loaderData = useLoaderData() as UserDashboardLoaderData;
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Customer Dashboard
                </h1>

                <div className="text-gray-600 mb-4">
                    Welcome, {user?.displayName || user?.email}!
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Recent Bookings
                        </h3>
                        {loaderData.userBookings && loaderData.userBookings.length > 0 ? (
                            <div className="space-y-2">
                                {loaderData.userBookings.map((_, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                        Booking #{index + 1}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                No recent bookings found.
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Recent Activity
                        </h3>
                        {loaderData.recentActivity && loaderData.recentActivity.length > 0 ? (
                            <div className="space-y-2">
                                {loaderData.recentActivity.map((_, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                        Activity #{index + 1}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    Customer dashboard components will be implemented in future tasks.
                </div>
            </div>
        </div>
    );
};