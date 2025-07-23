import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    Briefcase,
    ClipboardList,
    Clock,
    LogOut,
    Settings,
    User
} from "lucide-react";

interface WorkerDashboardSidebarProps {
    onNavClick?: () => void;
}

export const WorkerDashboardSidebar = ({ onNavClick }: WorkerDashboardSidebarProps) => {
    const { user, logout } = useAuth();

    const navigation = [
        {
            name: "Dashboard",
            to: "/dashboard/worker",
            icon: BarChart3,
            end: true
        },
        {
            name: "Current Works",
            to: "/dashboard/worker/current-works",
            icon: Clock
        },
        {
            name: "All Works",
            to: "/dashboard/worker/all-works",
            icon: Briefcase
        },
        {
            name: "Work Requests",
            to: "/dashboard/worker/work-requests",
            icon: ClipboardList
        },
        {
            name: "Profile",
            to: "/dashboard/worker/profile",
            icon: User
        },
        {
            name: "Settings",
            to: "/dashboard/worker/settings",
            icon: Settings
        }
    ];

    return (
        <div className="flex h-full flex-col bg-gray-800">
            <div className="flex h-16 items-center justify-center bg-gray-900">
                <h2 className="text-xl font-bold text-white">Worker Panel</h2>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-2 py-4">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.to}
                            end={item.end}
                            onClick={onNavClick}
                            className={({ isActive }) =>
                                cn(
                                    isActive
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                )
                            }
                        >
                            <item.icon
                                className="mr-3 h-5 w-5 flex-shrink-0"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-2 py-4 border-t border-gray-700">
                    <div className="flex items-center px-2 py-2 text-sm font-medium">
                        <div className="flex-shrink-0">
                            {user?.photoURL ? (
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={user.photoURL}
                                    alt={user.displayName || "User"}
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {user?.displayName?.[0] || user?.email?.[0] || "U"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">
                                {user?.displayName || user?.email}
                            </p>
                            <p className="text-xs font-medium text-gray-300">Worker</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="mt-2 group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboardSidebar;