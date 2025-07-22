import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Trash2, Edit, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";

// This is a placeholder since we don't have a services API yet
// In a real implementation, you would use RTK Query hooks for services
interface Service {
    id: string;
    name: string;
    category: string;
    description: string;
    basePrice: number;
    isActive: boolean;
}

export const AdminServices = () => {
    const { type } = useParams<{ type: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [services, setServices] = useState<Service[]>([]);

    // Simulate loading services
    useState(() => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Mock data
            const mockServices: Service[] = [
                {
                    id: "1",
                    name: "Basic Electrical Repair",
                    category: "electrician",
                    description: "Basic electrical repair services",
                    basePrice: 50,
                    isActive: true
                },
                {
                    id: "2",
                    name: "Advanced Electrical Installation",
                    category: "electrician",
                    description: "Advanced electrical installation services",
                    basePrice: 120,
                    isActive: true
                },
                {
                    id: "3",
                    name: "Emergency Electrical Service",
                    category: "electrician",
                    description: "Emergency electrical services",
                    basePrice: 150,
                    isActive: true
                }
            ];

            // Filter by category if type is provided
            const filteredServices = type
                ? mockServices.filter(service => service.category === type)
                : mockServices;

            setServices(filteredServices);
            setIsLoading(false);
        }, 1000);
    }, [type]);

    // Handle service deletion
    const handleDeleteService = (serviceId: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) {
            return;
        }

        // Simulate API call
        setServices(services.filter(service => service.id !== serviceId));
        toast.success("Service deleted successfully");
    };

    // Handle view service details
    const handleViewService = (service: Service) => {
        toast.info(`Viewing details for ${service.name}`);
    };

    // Handle edit service
    const handleEditService = (service: Service) => {
        toast.info(`Editing ${service.name}`);
    };

    // Handle add new service
    const handleAddService = () => {
        toast.info("Adding new service");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!services.length) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold capitalize">{type || "All"} Services</h2>
                    <Button onClick={handleAddService}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                    </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
                    <p>No services found for this category.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold capitalize">{type || "All"} Services</h2>
                <Button onClick={handleAddService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Base Price
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
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {service.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                    {service.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${service.basePrice.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}>
                                        {service.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewService(service)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditService(service)}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteService(service.id)}
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