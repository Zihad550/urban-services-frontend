import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    Calendar,
    Clock,
    HardHat,
    Home,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const UserDashboardSidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        {
            id: 1,
            label: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
            id: 2,
            label: 'My Bookings',
            path: '/dashboard/bookings',
            icon: <Calendar className="h-5 w-5" />
        },
        {
            id: 3,
            label: 'Pending Requests',
            path: '/dashboard/pending-requests',
            icon: <Clock className="h-5 w-5" />
        },
        {
            id: 4,
            label: 'Become Worker',
            path: '/dashboard/become-worker',
            icon: <HardHat className="h-5 w-5" />
        },
        {
            id: 5,
            label: 'Post To-Let',
            path: '/dashboard/post-tolet',
            icon: <Home className="h-5 w-5" />
        }
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="h-full w-64 bg-gray-50 border-r p-4 flex flex-col">
            <div className="flex items-center justify-center py-4 border-b mb-4">
                <h2 className="text-xl font-bold">User Dashboard</h2>
            </div>

            <nav className="flex-1">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/dashboard'}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mt-auto pt-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    );
};