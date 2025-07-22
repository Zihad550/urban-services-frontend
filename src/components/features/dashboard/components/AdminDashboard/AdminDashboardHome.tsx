import {
    Users,
    UserCog,
    Mail,
    Building,
    UserCheck,
    Briefcase
} from "lucide-react";
import { AdminAllBookings } from "./AdminAllBookings";
import { useGetAllCustomersQuery } from "@/redux/api/usersApi";
import { useGetAllWorkersQuery } from "@/redux/api/usersApi";
import { useGetAvailableWorkersQuery } from "@/redux/api/usersApi";
import { useGetBusyWorkersQuery } from "@/redux/api/usersApi";
import { useGetBookingsQuery } from "@/redux/api/bookingsApi";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    bgColor: string;
    textColor?: string;
}

const StatCard = ({ title, value, icon, bgColor, textColor = "text-white" }: StatCardProps) => (
    <div className={`${bgColor} p-4 rounded-lg shadow-md flex items-center justify-between`}>
        <div>
            <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
            <h4 className={`text-lg ${textColor}`}>{title}</h4>
        </div>
        <div className={`text-4xl ${textColor}`}>{icon}</div>
    </div>
);

export const AdminDashboardHome = () => {
    // Fetch data using RTK Query
    const { data: customersData, isLoading: isLoadingCustomers } = useGetAllCustomersQuery({});
    const { data: workersData, isLoading: isLoadingWorkers } = useGetAllWorkersQuery({});
    const { data: availableWorkersData, isLoading: isLoadingAvailable } = useGetAvailableWorkersQuery({});
    const { data: busyWorkersData, isLoading: isLoadingBusy } = useGetBusyWorkersQuery({});
    const { data: bookingsData, isLoading: isLoadingBookings } = useGetBookingsQuery({});

    // Calculate counts
    const customerCount = customersData?.data.length || 0;
    const workerCount = workersData?.data.length || 0;
    const availableWorkerCount = availableWorkersData?.data.length || 0;
    const busyWorkerCount = busyWorkersData?.data.length || 0;

    // For worker requests and to-let requests, we would need additional API endpoints
    // For now, we'll use placeholder values
    const workerRequestsCount = 0;
    const toLetCount = 0;

    // Define stats cards data
    const stats = [
        {
            id: 1,
            title: "Customers",
            value: customerCount,
            icon: <Users />,
            bgColor: "bg-blue-500",
            isLoading: isLoadingCustomers
        },
        {
            id: 2,
            title: "Workers",
            value: workerCount,
            icon: <UserCog />,
            bgColor: "bg-purple-500",
            isLoading: isLoadingWorkers
        },
        {
            id: 3,
            title: "Worker Requests",
            value: workerRequestsCount,
            icon: <Mail />,
            bgColor: "bg-pink-500",
            isLoading: false
        },
        {
            id: 4,
            title: "To-Lets",
            value: toLetCount,
            icon: <Building />,
            bgColor: "bg-indigo-500",
            isLoading: false
        },
        {
            id: 5,
            title: "Available Workers",
            value: availableWorkerCount,
            icon: <UserCheck />,
            bgColor: "bg-green-500",
            isLoading: isLoadingAvailable
        },
        {
            id: 6,
            title: "Busy Workers",
            value: busyWorkerCount,
            icon: <Briefcase />,
            bgColor: "bg-red-500",
            isLoading: isLoadingBusy
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.id}
                        title={stat.title}
                        value={stat.isLoading ? -1 : stat.value}
                        icon={stat.icon}
                        bgColor={stat.bgColor}
                    />
                ))}
            </div>

            {/* All bookings section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Recent Bookings</h2>
                <AdminAllBookings />
            </div>
        </div>
    );
};