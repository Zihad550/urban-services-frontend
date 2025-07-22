import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/features/auth/authSlice";
import {
    BarChart3,
    Users,
    MessageSquare,
    Mail,
    UserCheck,
    Briefcase,
    Zap,
    Droplet,
    ChefHat,
    Building,
    Plus,
    User,
    Home,
    LogOut,
    ChevronDown,
    ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const AdminDashboardSidebar = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [showServices, setShowServices] = useState(false);
    const [showWorkers, setShowWorkers] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    // Main navigation items
    const navItems = [
        {
            id: 1,
            label: "Make Admin",
            path: "/admin/make-admin",
            icon: <ShieldCheck className="h-5 w-5" />
        },
        {
            id: 2,
            label: "Customers",
            path: "/admin/customers",
            icon: <Users className="h-5 w-5" />
        },
        {
            id: 3,
            label: "Customer Messages",
            path: "/admin/messages",
            icon: <MessageSquare className="h-5 w-5" />
        },
        {
            id: 4,
            label: "Worker Requests",
            path: "/admin/worker-requests",
            icon: <Mail className="h-5 w-5" />
        },
        {
            id: 5,
            label: "ToLet Requests",
            path: "/admin/toLet-requests",
            icon: <Mail className="h-5 w-5" />
        },
        {
            id: 6,
            label: "Available Workers",
            path: "/admin/available-workers",
            icon: <UserCheck className="h-5 w-5" />
        },
        {
            id: 7,
            label: "Busy Workers",
            path: "/admin/busy-workers",
            icon: <Briefcase className="h-5 w-5" />
        },
    ];

    // Service categories
    const services = [
        {
            id: 1,
            label: "Electrician Services",
            path: "/admin/services/electrician",
            icon: <Zap className="h-5 w-5" />
        },
        {
            id: 2,
            label: "Plumber Services",
            path: "/admin/services/plumber",
            icon: <Droplet className="h-5 w-5" />
        },
        {
            id: 3,
            label: "Chef Services",
            path: "/admin/services/chef",
            icon: <ChefHat className="h-5 w-5" />
        },
        {
            id: 4,
            label: "To-Let",
            path: "/admin/services/tolet",
            icon: <Building className="h-5 w-5" />
        },
        {
            id: 5,
            label: "Add New Service",
            path: "/admin/add-service",
            icon: <Plus className="h-5 w-5" />
        },
    ];

    // Worker categories
    const workers = [
        {
            id: 1,
            label: "Electricians",
            path: "/admin/workers/electrician",
            icon: <User className="h-5 w-5" />
        },
        {
            id: 2,
            label: "Plumbers",
            path: "/admin/workers/plumber",
            icon: <User className="h-5 w-5" />
        },
        {
            id: 3,
            label: "Chefs",
            path: "/admin/workers/chef",
            icon: <User className="h-5 w-5" />
        },
        {
            id: 4,
            label: "To-Lets",
            path: "/admin/workers/toLets",
            icon: <User className="h-5 w-5" />
        },
        {
            id: 5,
            label: "Post ToLet",
            path: "/admin/post-toLet",
            icon: <Home className="h-5 w-5" />
        },
        {
            id: 6,
            label: "Add New Worker",
            path: "/admin/add-worker",
            icon: <Plus className="h-5 w-5" />
        },
    ];

    return (
        <aside className="h-full bg-card border-r w-64 flex flex-col">
            <div className="p-4 border-b">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold uppercase">Admin</h2>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                    {/* Dashboard link */}
                    <li>
                        <Link
                            to="/admin"
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-foreground"
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    {/* Services dropdown */}
                    <li>
                        <button
                            onClick={() => setShowServices(!showServices)}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-accent text-foreground"
                        >
                            <div className="flex items-center gap-3">
                                <Building className="h-5 w-5" />
                                <span>Services</span>
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                showServices && "transform rotate-180"
                            )} />
                        </button>

                        {showServices && (
                            <ul className="mt-1 ml-4 space-y-1">
                                {services.map((service) => (
                                    <li key={service.id}>
                                        <Link
                                            to={service.path}
                                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-foreground"
                                        >
                                            {service.icon}
                                            <span>{service.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    {/* Workers dropdown */}
                    <li>
                        <button
                            onClick={() => setShowWorkers(!showWorkers)}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-accent text-foreground"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5" />
                                <span>Workers</span>
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                showWorkers && "transform rotate-180"
                            )} />
                        </button>

                        {showWorkers && (
                            <ul className="mt-1 ml-4 space-y-1">
                                {workers.map((worker) => (
                                    <li key={worker.id}>
                                        <Link
                                            to={worker.path}
                                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-foreground"
                                        >
                                            {worker.icon}
                                            <span>{worker.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    {/* Main navigation items */}
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <Link
                                to={item.path}
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-foreground"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-accent text-foreground"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};