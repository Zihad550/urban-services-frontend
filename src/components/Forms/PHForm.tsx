import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, UseFormProps, FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface PHFormProps<TFormValues extends FieldValues> {
    schema: z.ZodType<TFormValues>;
    defaultValues?: DefaultValues<TFormValues>;
    children: React.ReactNode;
    onSubmit: SubmitHandler<TFormValues>;
    mode?: UseFormProps<TFormValues>['mode'];
    className?: string;
    id?: string;
    resetOnSubmit?: boolean;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    role?: string;
}

export const PHForm = <TFormValues extends FieldValues>({
    schema,
    defaultValues,
    children,
    onSubmit,
    mode = 'onBlur',
    className = '',
    id,
    resetOnSubmit = false,
    ariaLabel,
    ariaDescribedBy,
    role = 'form',
}: PHFormProps<TFormValues>) => {
    const methods = useForm<TFormValues>({
        resolver: zodResolver(schema),
        defaultValues,
        mode,
    });

    const { formState } = methods;
    const { errors } = formState;

    // Announce form errors to screen readers
    useEffect(() => {
        const errorCount = Object.keys(errors).length;
        if (errorCount > 0) {
            const errorMessage = `Form submission has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please correct the highlighted fields.`;

            // Create and use an aria-live region to announce errors
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.setAttribute('role', 'status');
            liveRegion.className = 'sr-only';
            liveRegion.textContent = errorMessage;

            document.body.appendChild(liveRegion);

            // Remove after announcement
            setTimeout(() => {
                document.body.removeChild(liveRegion);
            }, 1000);
        }
    }, [errors]);

    const handleSubmit = async (data: TFormValues) => {
        await onSubmit(data);
        if (resetOnSubmit) {
            methods.reset();
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                id={id}
                className={cn(
                    "space-y-6 w-full",
                    className
                )}
                onSubmit={methods.handleSubmit(handleSubmit)}
                noValidate
                aria-label={ariaLabel}
                aria-describedby={ariaDescribedBy}
                role={role}
            >
                {/* Hidden error summary for screen readers */}
                {Object.keys(errors).length > 0 && (
                    <div className="sr-only" role="alert" aria-live="assertive">
                        <p>Please correct the following errors:</p>
                        <ul>
                            {Object.entries(errors).map(([key, error]) => (
                                <li key={key}>
                                    {error?.message?.toString() || `${key} field has an error`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {children}
            </form>
        </FormProvider>
    );
};