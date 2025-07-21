import { useLoaderData } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import type { AdminDashboardLoaderData } from '../types';

export const AdminDashboard: React.FC = () => {
    const loaderData = useLoaderData() as AdminDashboardLoaderData;
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Admin Dashboard
                </h1>

                <div className="text-gray-600 mb-4">
                    Welcome, {user?.displayName || user?.email}!
                </div>

                {loaderData.adminStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800">Total Users</h3>
                            <p className="text-2xl font-bold text-blue-900">
                                {loaderData.adminStats.totalUsers}
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-green-800">Total Workers</h3>
                            <p className="text-2xl font-bold text-green-900">
                                {loaderData.adminStats.totalWorkers}
                            </p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-yellow-800">Total Bookings</h3>
                            <p className="text-2xl font-bold text-yellow-900">
                                {loaderData.adminStats.totalBookings}
                            </p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-red-800">Pending Requests</h3>
                            <p className="text-2xl font-bold text-red-900">
                                {loaderData.adminStats.pendingRequests}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-sm text-gray-500">
                    Admin dashboard components will be implemented in future tasks.
                </div>
            </div>
        </div>
    );
};