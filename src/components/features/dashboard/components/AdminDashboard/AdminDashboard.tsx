import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { AdminDashboardSidebar } from "./AdminDashboardSidebar";
import { Sheet } from "@/components/ui";
import { Menu } from "lucide-react";

export const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const user = useAppSelector(selectCurrentUser);
    const location = useLocation();

    // Extract the current section from the URL path
    const currentSection = location.pathname.split("/")[2] || "dashboard";

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop sidebar */}
            <div className={`hidden md:block ${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out`}>
                <AdminDashboardSidebar />
            </div>

            {/* Mobile sidebar using Sheet component */}
            <Sheet>
                <Sheet.Trigger asChild className="md:hidden absolute top-4 left-4">
                    <button className="p-2 rounded-md hover:bg-accent">
                        <Menu className="h-6 w-6" />
                    </button>
                </Sheet.Trigger>
                <Sheet.Content side="left" className="w-[80%] max-w-xs p-0">
                    <AdminDashboardSidebar />
                </Sheet.Content>
            </Sheet>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="border-b bg-card shadow-sm">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden md:flex p-2 rounded-md hover:bg-accent"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <h1 className="text-2xl font-semibold capitalize">
                                {currentSection}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                    {user?.displayName?.charAt(0) || "A"}
                                </div>
                            )}
                            <span className="font-medium">{user?.displayName}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};