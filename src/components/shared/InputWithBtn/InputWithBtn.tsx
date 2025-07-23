import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState, useId } from 'react';

interface InputWithBtnProps extends React.InputHTMLAttributes<HTMLInputElement> {
    btnText?: string;
    onSubmit?: (value: string) => void;
    className?: string;
    icon?: React.ReactNode;
}

export const InputWithBtn: React.FC<InputWithBtnProps> = ({
    btnText = 'Submit',
    onSubmit,
    className,
    icon,
    placeholder,
    disabled,
    ...rest
}) => {
    const [value, setValue] = useState('');
    const id = useId();
    const inputId = `input-with-btn-${id}`;
    const buttonId = `submit-btn-${id}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit && value.trim()) {
            onSubmit(value.trim());
            setValue('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn('flex w-full max-w-full flex-col sm:flex-row gap-2 sm:gap-0', className)}
            role="search"
            aria-label="Newsletter subscription"
        >
            <div className="relative flex-grow">
                <Input
                    id={inputId}
                    className={cn(
                        "w-full sm:rounded-r-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "text-base sm:text-sm", // Larger text on mobile for better touch
                        "border-primary/20 dark:border-primary/10"
                    )}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-label={placeholder || "Email input"}
                    aria-describedby={buttonId}
                    {...rest}
                />
            </div>
            <Button
                id={buttonId}
                type="submit"
                className={cn(
                    "sm:rounded-l-none bg-primary hover:bg-primary/90 text-primary-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "transition-colors duration-200",
                    "min-h-10 px-4 py-2", // Ensure good touch target size
                    "text-base sm:text-sm" // Larger text on mobile
                )}
                disabled={disabled || !value.trim()}
                aria-label={btnText}
            >
                {icon ? (
                    <>
                        {icon}
                        <span className="sr-only">{btnText}</span>
                    </>
                ) : btnText}
            </Button>
        </form>
    );
};