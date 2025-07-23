import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/dropdown-menu';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { useId } from 'react';

interface PHDatePickerProps {
    name: string;
    label?: string;
    placeholder?: string;
    className?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[] | ((date: Date) => boolean);
}

export const PHDatePicker = ({
    name,
    label,
    placeholder = 'Select a date',
    className,
    description,
    disabled = false,
    required = false,
    minDate,
    maxDate,
    disabledDates,
}: PHDatePickerProps) => {
    const { control, formState } = useFormContext();
    const isSubmitting = formState.isSubmitting;
    const uniqueId = useId();
    const descriptionId = `${name}-description-${uniqueId}`;
    const hasError = !!formState.errors[name];
    const buttonId = `${name}-button-${uniqueId}`;

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
                            htmlFor={buttonId}
                        >
                            {label}
                        </FormLabel>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    id={buttonId}
                                    variant="outline"
                                    className={cn(
                                        'w-full pl-3 text-left font-normal transition-colors duration-200',
                                        !field.value && 'text-muted-foreground',
                                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                        'text-base sm:text-sm', // Larger text on mobile for better touch
                                        'min-h-[44px]', // Better touch target size
                                        hasError && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    disabled={disabled || isSubmitting}
                                    aria-required={required}
                                    aria-invalid={hasError}
                                    aria-describedby={description ? descriptionId : undefined}
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-label={`Select date${field.value ? `: ${format(field.value, 'PPP')}` : ''}`}
                                >
                                    {field.value ? (
                                        format(field.value, 'PPP')
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" aria-hidden="true" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0 sm:w-[280px] md:w-auto"
                            align="center"
                            sideOffset={8}
                        >
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                    field.onChange(date);
                                    // Close the popover after selection for better mobile experience
                                    document.body.click();

                                    // Announce date selection to screen readers
                                    const announcer = document.getElementById('announcer');
                                    if (announcer && date) {
                                        announcer.textContent = `Selected date: ${format(date, 'PPP')}`;
                                    }
                                }}
                                disabled={disabled || isSubmitting || disabledDates}
                                initialFocus
                                fromDate={minDate}
                                toDate={maxDate}
                                className="rounded-md border border-border"
                            />
                        </PopoverContent>
                    </Popover>
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