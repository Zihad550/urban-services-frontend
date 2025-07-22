import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetWorkersByServiceQuery, useUpdateWorkerStatusMutation, useDeletePortfolioItemMutation } from "@/redux/api/workersApi";
import { Loader2, Trash2, CheckCircle, XCircle, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { Worker } from "@/types/user";

export const AdminWorkers = () => {
    const { role } = useParams<{ role: string }>();
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

    // RTK Query hooks
    const { data: workersResponse, isLoading, refetch } = useGetWorkersByServiceQuery({
        serviceId: role || "",
        limit: 100
    });

    const [updateWorkerStatus, { isLoading: isUpdating }] = useUpdateWorkerStatusMutation();
    const [deleteWorker, { isLoading: isDeleting }] = useDeletePortfolioItemMutation();

    const workers = workersResponse?.data || [];

    // Handle worker status update
    const handleStatusUpdate = async (workerId: string, newStatus: "Free" | "Busy") => {
        try {
            await updateWorkerStatus({ id: workerId, workingStatus: newStatus }).unwrap();
            toast.success(`Worker status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update worker status");
            console.error("Error updating worker status:", error);
        }
    };

    // Handle worker deletion
    const handleDeleteWorker = async (workerId: string) => {
        if (!window.confirm("Are you sure you want to delete this worker?")) {
            return;
        }

        try {
            // Note: In a real implementation, you would use a dedicated deleteWorker mutation
            // For now, we're using deletePortfolioItem as a placeholder
            await deleteWorker({ workerId, portfolioItemId: "placeholder" }).unwrap();
            toast.success("Worker deleted successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to delete worker");
            console.error("Error deleting worker:", error);
        }
    };

    // Handle view worker details
    const handleViewWorker = (worker: Worker) => {
        setSelectedWorker(worker);
        // In a real implementation, you might navigate to a worker details page
        // or open a modal with worker details
        toast.info(`Viewing details for ${worker.displayName}`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!workers.length) {
        return (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
                <p>No workers found for this category.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold capitalize">{role} Workers</h2>

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Experience
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {workers.map((worker: Worker) => (
                            <tr key={worker.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {worker.displayName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {worker.phoneNumber || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {worker.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {worker.experienceYears} years
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {worker.rating.toFixed(1)} ({worker.totalRatings} reviews)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${worker.workingStatus === "Free"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}>
                                        {worker.workingStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewWorker(worker)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusUpdate(
                                            worker.id,
                                            worker.workingStatus === "Free" ? "Busy" : "Free"
                                        )}
                                        disabled={isUpdating}
                                    >
                                        {worker.workingStatus === "Free" ? (
                                            <XCircle className="h-4 w-4 mr-1" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                        )}
                                        {worker.workingStatus === "Free" ? "Set Busy" : "Set Free"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteWorker(worker.id)}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};