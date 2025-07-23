import { useState, useId } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { EyeIcon, EyeOffIcon, AlertCircle } from 'lucide-react';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PHInputProps {
    name: string;
    label?: string;
    type?: string;
    placeholder?: string;
    className?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    autoComplete?: string;
    showPasswordToggle?: boolean;
}

export const PHInput = ({
    name,
    label,
    type = 'text',
    placeholder,
    className,
    description,
    disabled = false,
    required = false,
    autoComplete,
    showPasswordToggle = false,
}: PHInputProps) => {
    const { control, formState } = useFormContext();
    const [showPassword, setShowPassword] = useState(false);
    const isSubmitting = formState.isSubmitting;
    const uniqueId = useId();
    const descriptionId = `${name}-description-${uniqueId}`;
    const hasError = !!formState.errors[name];

    // Determine the actual input type based on the showPassword state
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("w-full", className)}>
                    {label && (
                        <FormLabel
                            className={cn(
                                "text-base font-medium mb-1.5",
                                required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : '',
                                hasError && "text-destructive"
                            )}
                            htmlFor={`${name}-${uniqueId}`}
                        >
                            {label}
                        </FormLabel>
                    )}
                    <FormControl>
                        <div className="relative">
                            <Input
                                id={`${name}-${uniqueId}`}
                                type={inputType}
                                placeholder={placeholder}
                                autoComplete={autoComplete}
                                disabled={disabled || isSubmitting}
                                className={cn(
                                    "w-full transition-colors duration-200",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    "dark:placeholder:text-muted-foreground/70",
                                    "text-base sm:text-sm", // Larger text on mobile for better touch
                                    showPasswordToggle && "pr-10",
                                    hasError && "border-destructive focus-visible:ring-destructive"
                                )}
                                aria-required={required}
                                aria-invalid={hasError}
                                aria-describedby={description ? descriptionId : undefined}
                                {...field}
                            />
                            {showPasswordToggle && type === 'password' && (
                                <button
                                    type="button"
                                    className={cn(
                                        "absolute inset-y-0 right-0 flex items-center pr-3",
                                        "text-muted-foreground hover:text-foreground",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        "rounded-full transition-colors duration-200",
                                        "touch-manipulation", // Better touch behavior
                                        "h-full min-h-[44px] min-w-[44px]" // Larger touch target
                                    )}
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={disabled || isSubmitting}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            )}
                            {hasError && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                                </div>
                            )}
                        </div>
                    </FormControl>
                    {description && (
                        <FormDescription id={descriptionId} className="text-sm mt-1.5">
                            {description}
                        </FormDescription>
                    )}
                    <FormMessage className="text-sm font-medium mt-1.5" />
                </FormItem>
            )}
        />
    );
};