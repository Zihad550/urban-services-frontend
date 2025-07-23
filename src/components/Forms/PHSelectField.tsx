import { useFormContext } from 'react-hook-form';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface PHSelectFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    className?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
}

export const PHSelectField = ({
    name,
    label,
    placeholder = 'Select an option',
    options,
    className,
    description,
    disabled = false,
    required = false,
}: PHSelectFieldProps) => {
    const { control, formState } = useFormContext();
    const isSubmitting = formState.isSubmitting;
    const uniqueId = useId();
    const descriptionId = `${name}-description-${uniqueId}`;
    const hasError = !!formState.errors[name];

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
                            htmlFor={`${name}-trigger-${uniqueId}`}
                        >
                            {label}
                        </FormLabel>
                    )}
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled || isSubmitting}
                        value={field.value}
                    >
                        <FormControl>
                            <SelectTrigger
                                id={`${name}-trigger-${uniqueId}`}
                                className={cn(
                                    "w-full transition-colors duration-200",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    "text-base sm:text-sm", // Larger text on mobile for better touch
                                    "min-h-[44px]", // Better touch target size
                                    hasError && "border-destructive focus-visible:ring-destructive"
                                )}
                                aria-required={required}
                                aria-invalid={hasError}
                                aria-describedby={description ? descriptionId : undefined}
                            >
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent
                            position="popper"
                            className="max-h-[300px] overflow-y-auto"
                            sideOffset={4}
                            align="center"
                        >
                            {options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    className={cn(
                                        "focus:bg-accent focus:text-accent-foreground",
                                        "cursor-pointer min-h-[40px] flex items-center",
                                        "text-base sm:text-sm" // Larger text on mobile
                                    )}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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