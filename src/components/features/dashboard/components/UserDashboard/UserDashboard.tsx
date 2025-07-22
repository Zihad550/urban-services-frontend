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
        <div className="flex h-full">
            {/* Desktop sidebar */}
            <div className="hidden md:block">
                <UserDashboardSidebar />
            </div>

            {/* Mobile sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0">
                    <UserDashboardSidebar />
                </SheetContent>
            </Sheet>

            <div className="flex-1">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden mr-2"
                            onClick={toggleSidebar}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium hidden sm:block">
                            {user?.displayName || user?.email}
                        </span>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                            <AvatarFallback>
                                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};