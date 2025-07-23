import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useId } from 'react';

interface PHTimePickerProps {
    name: string;
    label?: string;
    placeholder?: string;
    className?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    interval?: number; // Minutes interval between time options
}

export const PHTimePicker = ({
    name,
    label,
    placeholder = 'Select a time',
    className,
    description,
    disabled = false,
    required = false,
    interval = 30, // Default 30 minute intervals
}: PHTimePickerProps) => {
    const { control, formState } = useFormContext();
    const isSubmitting = formState.isSubmitting;
    const uniqueId = useId();
    const descriptionId = `${name}-description-${uniqueId}`;
    const buttonId = `${name}-button-${uniqueId}`;
    const hasError = !!formState.errors[name];

    // Generate time options based on interval
    const generateTimeOptions = () => {
        const options = [];
        const totalMinutesInDay = 24 * 60;

        for (let minutes = 0; minutes < totalMinutesInDay; minutes += interval) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

            const timeString = `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
            const value = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

            options.push({ label: timeString, value });
        }

        return options;
    };

    const timeOptions = generateTimeOptions();

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
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
                                    aria-label={`Select time${field.value ? `: ${formatTimeDisplay(field.value)}` : ''}`}
                                >
                                    {field.value ? (
                                        formatTimeDisplay(field.value)
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                    <ClockIcon className="ml-auto h-4 w-4 opacity-50" aria-hidden="true" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-2 sm:w-[220px] md:w-auto"
                            align="center"
                            sideOffset={8}
                        >
                            <div className="max-h-[240px] overflow-y-auto pr-1">
                                <div className="grid gap-1">
                                    {timeOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            variant={field.value === option.value ? "default" : "outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                "text-base sm:text-sm", // Larger text on mobile
                                                "min-h-[44px]", // Better touch target size
                                                field.value === option.value && "bg-primary text-primary-foreground"
                                            )}
                                            onClick={() => {
                                                field.onChange(option.value);
                                                // Close the popover after selection for better mobile experience
                                                document.body.click();

                                                // Announce time selection to screen readers
                                                const announcer = document.getElementById('announcer');
                                                if (announcer) {
                                                    announcer.textContent = `Selected time: ${formatTimeDisplay(option.value)}`;
                                                }
                                            }}
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
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

// Helper function to format time for display
const formatTimeDisplay = (timeValue: string) => {
    if (!timeValue) return '';

    const [hours, minutes] = timeValue.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};