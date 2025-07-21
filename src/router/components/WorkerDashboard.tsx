import { useLoaderData } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import type { WorkerDashboardLoaderData } from '../types';

export const WorkerDashboard: React.FC = () => {
    const loaderData = useLoaderData() as WorkerDashboardLoaderData;
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Worker Dashboard
                </h1>

                <div className="text-gray-600 mb-4">
                    Welcome, {user?.displayName || user?.email}!
                </div>

                {loaderData.workerStats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800">Completed Jobs</h3>
                            <p className="text-2xl font-bold text-blue-900">
                                {loaderData.workerStats.completedJobs}
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-green-800">Rating</h3>
                            <p className="text-2xl font-bold text-green-900">
                                {loaderData.workerStats.rating.toFixed(1)}
                            </p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-yellow-800">Earnings</h3>
                            <p className="text-2xl font-bold text-yellow-900">
                                ${loaderData.workerStats.earnings}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Current Jobs
                    </h3>
                    {loaderData.workerJobs && loaderData.workerJobs.length > 0 ? (
                        <div className="space-y-2">
                            {loaderData.workerJobs.map((_, index) => (
                                <div key={index} className="text-sm text-gray-600">
                                    Job #{index + 1}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            No current jobs found.
                        </div>
                    )}
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    Worker dashboard components will be implemented in future tasks.
                </div>
            </div>
        </div>
    );
};