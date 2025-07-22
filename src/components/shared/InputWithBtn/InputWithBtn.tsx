import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface InputWithBtnProps extends React.InputHTMLAttributes<HTMLInputElement> {
    btnText?: string;
    onSubmit?: (value: string) => void;
    className?: string;
    icon?: React.ReactNode;
}

export const InputWithBtn: React.FC<InputWithBtnProps> = ({
    btnText,
    onSubmit,
    className,
    icon,
    ...rest
}) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit && value.trim()) {
            onSubmit(value.trim());
            setValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn('flex w-full', className)}>
            <Input
                className="rounded-r-none focus-visible:ring-1 focus-visible:ring-blue-500"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                {...rest}
            />
            <Button
                type="submit"
                className="rounded-l-none bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300"
            >
                {icon ? icon : btnText}
            </Button>
        </form>
    );
};