import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { WorkerDashboardSidebar } from "./WorkerDashboardSidebar";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export const WorkerDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <WorkerDashboardSidebar />
            </div>

            {/* Mobile sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <Sheet.Content side="left" className="w-64 p-0">
                    <WorkerDashboardSidebar onNavClick={() => setSidebarOpen(false)} />
                </Sheet.Content>
            </Sheet>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
                <header className="bg-white shadow-sm z-10">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open sidebar</span>
                        </Button>

                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Worker Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-700 mr-2">
                                    {user?.displayName}
                                </span>
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || "User"}
                                        className="h-8 w-8 rounded-full"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-600 font-medium">
                                            {user?.displayName?.[0] || user?.email?.[0] || "U"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default WorkerDashboard;