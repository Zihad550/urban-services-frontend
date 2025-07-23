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
    SheetClose,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import { logoutUser, selectIsAuthenticated, selectUser } from '@/redux/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Menu, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    const { resolvedTheme } = useTheme();

    const user = useAppSelector(selectUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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
                return '/dashboard/admin';
            case 'worker':
                return '/dashboard/worker';
            case 'customer':
            case 'user':
                return '/dashboard/user';
            default:
                return '/dashboard/user';
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
                                ? 'bg-primary dark:bg-gray-900 text-primary-foreground'
                                : 'bg-primary-foreground/20 dark:bg-gray-700 text-primary-foreground'
                            : mobile
                                ? 'text-gray-300 hover:bg-primary-foreground/10 dark:hover:bg-gray-700 hover:text-primary-foreground'
                                : 'text-primary-foreground hover:bg-primary-foreground/10 dark:hover:bg-gray-700 hover:text-primary-foreground',
                        mobile
                            ? 'block px-3 py-2 rounded-md text-base font-medium w-full min-h-[44px] flex items-center'
                            : 'px-3 py-2 rounded-md text-sm font-medium',
                        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
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
                    className={cn(
                        "justify-start px-3 py-2 text-base font-medium text-gray-300",
                        "hover:bg-primary-foreground/10 dark:hover:bg-gray-700 hover:text-primary-foreground",
                        "w-full min-h-[44px]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
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
                isWorkersPage ? 'md:bg-transparent' : 'bg-primary dark:bg-gray-800',
                'transition-colors duration-300 sticky top-0 z-40',
                className
            )}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className={isWorkersPage ? 'bg-gray-800 dark:bg-gray-900' : undefined}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-between h-16">
                        {/* Mobile menu button */}
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white bg-primary-foreground/20 hover:bg-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
                                        aria-label="Open main menu"
                                        aria-expanded={isMobileMenuOpen}
                                        aria-controls="mobile-menu"
                                    >
                                        <Menu className="h-6 w-6" aria-hidden="true" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-64 bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700"
                                    id="mobile-menu"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold text-white">Menu</h2>
                                        <SheetClose className="rounded-full hover:bg-gray-600 p-1 focus:outline-none focus:ring-2 focus:ring-white">
                                            <X className="h-5 w-5 text-white" aria-hidden="true" />
                                            <span className="sr-only">Close menu</span>
                                        </SheetClose>
                                    </div>
                                    <div className="flex flex-col space-y-1">
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
                                    className="text-primary-foreground font-serif text-xl hover:text-primary-foreground/80 transition-colors duration-200"
                                    aria-label="Urban Services Home"
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

                        {/* User menu and theme toggle */}
                        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            {/* Theme toggle */}
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>

                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "flex text-sm rounded-full items-center transition-all duration-200 hover:bg-transparent",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                "min-h-[44px] min-w-[44px]" // Ensure good touch target size
                                            )}
                                            aria-label="Open user menu"
                                        >
                                            <p className="text-lg text-primary-foreground uppercase hidden lg:block mr-2 font-medium">
                                                {user.displayName}
                                            </p>
                                            {user.photoURL ? (
                                                <img
                                                    className="h-8 w-8 rounded-full object-cover border-2 border-primary-foreground"
                                                    src={user.photoURL}
                                                    alt={user.displayName || 'User avatar'}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center border-2 border-primary-foreground">
                                                    <User className="h-4 w-4 text-white" aria-hidden="true" />
                                                </div>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-1" sideOffset={8}>
                                        <div className="text-sm text-center py-2 bg-accent text-accent-foreground font-medium rounded-md mb-1">
                                            Logged in as <span className="font-bold">{user.role}</span>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => navigate(getDashboardRoute(user.role))}
                                            className={cn(
                                                "cursor-pointer flex items-center gap-2 py-2",
                                                "focus:bg-accent focus:text-accent-foreground",
                                                "rounded-md transition-colors"
                                            )}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard">
                                                <rect width="7" height="9" x="3" y="3" rx="1" />
                                                <rect width="7" height="5" x="14" y="3" rx="1" />
                                                <rect width="7" height="9" x="14" y="12" rx="1" />
                                                <rect width="7" height="5" x="3" y="16" rx="1" />
                                            </svg>
                                            Dashboard
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {/* Mobile-only theme toggle */}
                                        <div className="sm:hidden px-2 py-2">
                                            <p className="text-xs text-muted-foreground mb-2">Theme</p>
                                            <ThemeToggle />
                                        </div>
                                        <DropdownMenuSeparator className="sm:hidden" />
                                        <DropdownMenuItem
                                            onClick={handleLogOut}
                                            className={cn(
                                                "cursor-pointer text-destructive focus:text-destructive-foreground focus:bg-destructive",
                                                "flex items-center gap-2 py-2",
                                                "rounded-md transition-colors"
                                            )}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" x2="9" y1="12" y2="12" />
                                            </svg>
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button
                                    asChild
                                    variant="secondary"
                                    className={cn(
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        "min-h-[44px]" // Ensure good touch target size
                                    )}
                                >
                                    <Link
                                        to="/login"
                                        className="text-secondary-foreground bg-secondary hover:bg-secondary/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
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