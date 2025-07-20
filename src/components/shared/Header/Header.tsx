import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { logoutUser, selectIsAuthenticated, selectUser } from '@/redux/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Menu, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

interface NavigationItem {
    name: string;
    to: string;
    current: boolean;
}

interface HeaderProps {
    className?: string;
}

const navigation: NavigationItem[] = [
    { name: 'Home', to: '/', current: false },
    { name: 'Services', to: '/allServices', current: false },
    { name: 'Workers', to: '/workers', current: false },
    { name: 'Contact Us', to: '/contactUs', current: false }
];

const Header: React.FC<HeaderProps> = ({ className }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const user = useAppSelector(selectUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const handleLogOut = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getDashboardRoute = (role: string) => {
        switch (role) {
            case 'admin':
                return '/adminDashboard';
            case 'worker':
                return '/workerDashboard';
            case 'customer':
            case 'user':
                return '/userDashboard';
            default:
                return '/userDashboard';
        }
    };

    const isWorkersPage = location.pathname === '/workers';

    const NavigationLinks = ({ mobile = false }: { mobile?: boolean }) => (
        <>
            {navigation.map((item) => (
                <Link
                    key={item.name}
                    to={item.to}
                    className={cn(
                        location.pathname === item.to
                            ? mobile
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-900 text-white'
                            : mobile
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-white hover:bg-gray-700 hover:text-white',
                        mobile
                            ? 'block px-3 py-2 rounded-md text-base font-medium'
                            : 'px-3 py-2 rounded-md text-sm font-medium',
                        'transition-colors duration-200'
                    )}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                    onClick={() => mobile && setIsMobileMenuOpen(false)}
                >
                    {item.name}
                </Link>
            ))}
            {mobile && isAuthenticated && user && (
                <Button
                    variant="ghost"
                    className="justify-start px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white w-full"
                    onClick={() => {
                        navigate(getDashboardRoute(user.role));
                        setIsMobileMenuOpen(false);
                    }}
                >
                    Dashboard
                </Button>
            )}
        </>
    );

    return (
        <nav
            className={cn(
                isWorkersPage ? 'md:bg-transparent' : 'bg-blue-400',
                className
            )}
        >
            <div className={isWorkersPage ? 'bg-gray-800' : undefined}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-between h-16">
                        {/* Mobile menu button */}
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white bg-violet-700 hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
                                    >
                                        <span className="sr-only">Open main menu</span>
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-64 bg-gray-700 border-gray-600">
                                    <div className="flex flex-col space-y-1 mt-6">
                                        <NavigationLinks mobile />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Logo */}
                        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="flex-shrink-0 flex items-center">
                                <Link
                                    to="/"
                                    className="text-white font-serif text-xl hover:text-gray-200 transition-colors duration-200"
                                >
                                    Urban Services
                                </Link>
                            </div>

                            {/* Desktop navigation */}
                            <div className="hidden sm:block sm:ml-6 m-auto">
                                <div className="flex space-x-4">
                                    <NavigationLinks />
                                </div>
                            </div>
                        </div>

                        {/* User menu */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white items-center transition-all duration-200 hover:bg-transparent"
                                        >
                                            <span className="sr-only">Open user menu</span>
                                            <p className="text-lg text-white uppercase hidden lg:block mr-2 font-medium">
                                                {user.displayName}
                                            </p>
                                            {user.photoURL ? (
                                                <img
                                                    className="h-8 w-8 rounded-full object-cover border-2 border-white"
                                                    src={user.photoURL}
                                                    alt={user.displayName || 'User avatar'}
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center border-2 border-white">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <div className="text-sm text-center py-2 bg-green-100 text-gray-600 font-medium rounded-t-md">
                                            Logged in as {user.role}
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => navigate(getDashboardRoute(user.role))}
                                            className="cursor-pointer"
                                        >
                                            Dashboard
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogOut}
                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button asChild>
                                    <Link
                                        to="/login"
                                        className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
                                    >
                                        Log In
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;