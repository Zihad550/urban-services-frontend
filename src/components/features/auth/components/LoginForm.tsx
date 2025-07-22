import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { handleApiError, showSuccessToast } from '@/lib/errorUtils';

interface LocationState {
    from?: string;
}

export const LoginForm: React.FC = () => {
    // Track form submission for analytics and UX improvements
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin, error, clearAuthError, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize form with validation
    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur', // Validate on blur for better UX
    });

    // Clear form errors when auth error is cleared
    useEffect(() => {
        if (!error) {
            form.clearErrors();
        }
    }, [error, form]);

    // Handle form submission
    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);
        clearAuthError();
        setLoginAttempts(prev => prev + 1);

        try {
            const result = await login(data);

            if (result.success) {
                showSuccessToast('Login successful! Welcome back.');
                const locationState = location.state as LocationState;
                const from = locationState?.from || '/dashboard';
                navigate(from, { replace: true });
            } else {
                const errorMessage = result.error || 'Login failed';
                toast.error(errorMessage);

                // Set form error based on the error message
                if (errorMessage.toLowerCase().includes('password')) {
                    form.setError('password', {
                        type: 'manual',
                        message: 'Invalid password'
                    });
                    form.setFocus('password');
                } else if (errorMessage.toLowerCase().includes('user') ||
                    errorMessage.toLowerCase().includes('email') ||
                    errorMessage.toLowerCase().includes('not found')) {
                    form.setError('email', {
                        type: 'manual',
                        message: 'User not found'
                    });
                    form.setFocus('email');
                } else {
                    form.setFocus('email');
                }

                // Show additional help message after multiple failed attempts
                if (loginAttempts >= 2) {
                    toast.info('Having trouble logging in? Try resetting your password or use Google sign-in.');
                }
            }
        } catch (err) {
            const errorMessage = handleApiError(err);
            toast.error(errorMessage);
            form.setFocus('email');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Google login
    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        clearAuthError();

        try {
            const result = await googleLogin();

            if (result.success) {
                showSuccessToast('Login successful! Welcome back.');
                const locationState = location.state as LocationState;
                const from = locationState?.from || '/dashboard';
                navigate(from, { replace: true });
            } else {
                toast.error(result.error || 'Google login failed');
            }
        } catch (err) {
            const errorMessage = handleApiError(err);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" aria-label="Login form">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        {...field}
                                        disabled={isSubmitting || isLoading}
                                        aria-invalid={!!form.formState.errors.email}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <FormLabel>Password</FormLabel>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-blue-600 hover:text-blue-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            {...field}
                                            disabled={isSubmitting || isLoading}
                                            className="pr-10"
                                            aria-invalid={!!form.formState.errors.password}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isSubmitting || isLoading}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <LoadingSpinner size="sm" />
                                <span>Signing in...</span>
                            </span>
                        ) : (
                            'Sign in'
                        )}
                    </Button>
                </form>
            </Form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || isLoading}
            >
                {isSubmitting || isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Signing in...</span>
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>Sign in with Google</span>
                    </span>
                )}
            </Button>

            <div className="text-center">
                <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                    Don't have an account? Sign up
                </Link>
            </div>
        </div>
    );
};