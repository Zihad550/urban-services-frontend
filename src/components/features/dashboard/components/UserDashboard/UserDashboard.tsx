import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserDashboardSidebar } from './UserDashboardSidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const UserDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    const getPageTitle = () => {
        const path = location.pathname.split('/');
        const lastSegment = path[path.length - 1];

        if (lastSegment === 'dashboard') return 'Dashboard';
        return lastSegment.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen bg-background">
            {/* Skip to main content link */}
            <a href="#dashboard-main" className="skip-link">
                Skip to main content
            </a>

            {/* Desktop sidebar */}
            <aside
                className="hidden md:block w-64 lg:w-72 xl:w-80 border-r border-border bg-card/50 backdrop-blur-sm"
                aria-label="Dashboard navigation"
            >
                <UserDashboardSidebar />
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent
                    side="left"
                    className="p-0 w-64 sm:w-72 max-w-[85vw]"
                    aria-label="Mobile dashboard navigation"
                >
                    <UserDashboardSidebar />
                </SheetContent>
            </Sheet>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-center min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden mr-2 sm:mr-3 flex-shrink-0 h-9 w-9"
                            onClick={toggleSidebar}
                            aria-label="Open navigation menu"
                            aria-expanded={sidebarOpen}
                            aria-controls="mobile-sidebar"
                        >
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-foreground truncate">
                                {getPageTitle()}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                                Manage your account and services
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                        <div className="hidden sm:flex flex-col items-end min-w-0">
                            <span className="text-sm font-medium text-foreground truncate max-w-32 lg:max-w-48">
                                {user?.displayName || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-32 lg:max-w-48">
                                {user?.email}
                            </span>
                        </div>
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 ring-2 ring-border">
                            <AvatarImage
                                src={user?.photoURL || ''}
                                alt={`${user?.displayName || 'User'} avatar`}
                            />
                            <AvatarFallback className="text-xs sm:text-sm font-medium">
                                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Main content */}
                <main
                    id="dashboard-main"
                    className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 xl:p-8"
                    role="main"
                    aria-label="Dashboard content"
                >
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="min-h-full">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};