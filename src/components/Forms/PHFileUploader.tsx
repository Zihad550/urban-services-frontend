import { useFormContext } from 'react-hook-form';
import { useState, useId } from 'react';
import { UploadIcon, XIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';

interface PHFileUploaderProps {
    name: string;
    label?: string;
    className?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    maxFiles?: number;
}

export const PHFileUploader = ({
    name,
    label,
    className,
    description,
    disabled = false,
    required = false,
    accept,
    multiple = false,
    maxSize = 5, // Default 5MB
    maxFiles = 5,
}: PHFileUploaderProps) => {
    const { control, formState, setValue } = useFormContext();
    const isSubmitting = formState.isSubmitting;
    const [fileError, setFileError] = useState<string | null>(null);
    const uniqueId = useId();
    const descriptionId = `${name}-description-${uniqueId}`;
    const fileInputId = `file-upload-${name}-${uniqueId}`;
    const hasError = !!formState.errors[name];

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        onChange: (value: File | File[] | null) => void,
        currentValue: File | File[] | null
    ) => {
        const files = event.target.files;
        setFileError(null);

        if (!files || files.length === 0) {
            return;
        }

        // Check number of files
        if (multiple && files.length > maxFiles) {
            setFileError(`You can upload a maximum of ${maxFiles} files`);
            return;
        }

        // Check file sizes
        const oversizedFiles = Array.from(files).filter(
            (file) => file.size > maxSize * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            setFileError(`Some files exceed the maximum size of ${maxSize}MB`);
            return;
        }

        // Set value based on multiple flag
        if (multiple) {
            const newFiles = Array.from(files);
            onChange(newFiles);
        } else {
            onChange(files[0]);
        }
    };

    const removeFile = (
        fileToRemove: File,
        currentFiles: File[],
        onChange: (value: File[]) => void
    ) => {
        const updatedFiles = currentFiles.filter((file) => file !== fileToRemove);
        onChange(updatedFiles);
    };

    const removeAllFiles = (onChange: (value: File[] | null) => void) => {
        onChange(multiple ? [] : null);
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem className={className}>
                    {label && (
                        <FormLabel
                            className={cn(
                                "text-base font-medium mb-1.5",
                                required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : '',
                                hasError && "text-destructive"
                            )}
                            htmlFor={fileInputId}
                        >
                            {label}
                        </FormLabel>
                    )}
                    <FormControl>
                        <div className="space-y-2">
                            <div
                                className={cn(
                                    'border-2 border-dashed rounded-md p-4 sm:p-6 flex flex-col items-center justify-center gap-2',
                                    'hover:border-primary/50 transition-colors',
                                    'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                    hasError && "border-destructive",
                                    (disabled || isSubmitting) && 'opacity-60 cursor-not-allowed'
                                )}
                                onClick={() => {
                                    if (!disabled && !isSubmitting) {
                                        document.getElementById(fileInputId)?.click();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isSubmitting) {
                                        e.preventDefault();
                                        document.getElementById(fileInputId)?.click();
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-controls={fileInputId}
                                aria-label={`Upload ${multiple ? 'files' : 'a file'}`}
                            >
                                <UploadIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" aria-hidden="true" />
                                <p className="text-xs sm:text-sm text-center text-muted-foreground">
                                    Drag & drop files here, or click to select files
                                </p>
                                {accept && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        Accepted file types: {accept.replace(/\./g, '').toUpperCase()}
                                    </p>
                                )}
                                {maxSize && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        Maximum file size: {maxSize}MB
                                    </p>
                                )}
                                <input
                                    id={fileInputId}
                                    type="file"
                                    className="hidden"
                                    accept={accept}
                                    multiple={multiple}
                                    disabled={disabled || isSubmitting}
                                    onChange={(e) => handleFileChange(e, onChange, value)}
                                    aria-required={required}
                                    aria-invalid={hasError}
                                    aria-describedby={description ? descriptionId : undefined}
                                    {...fieldProps}
                                />
                            </div>

                            {fileError && (
                                <div className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
                                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                                    <p>{fileError}</p>
                                </div>
                            )}

                            {/* Display selected files */}
                            {value && (
                                <div className="mt-2">
                                    {multiple && Array.isArray(value) && value.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                <p className="text-sm font-medium" id={`${name}-selected-files`}>Selected files ({value.length}):</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeAllFiles(onChange)}
                                                    disabled={disabled || isSubmitting}
                                                    className="transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[36px]"
                                                    aria-label="Remove all files"
                                                >
                                                    Remove all
                                                </Button>
                                            </div>
                                            <div
                                                className="flex flex-wrap gap-2"
                                                role="list"
                                                aria-labelledby={`${name}-selected-files`}
                                            >
                                                {value.map((file, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="flex items-center gap-1 max-w-full text-xs sm:text-sm py-1 px-2"
                                                    >
                                                        <span className="truncate max-w-[150px] sm:max-w-[200px]" title={file.name}>
                                                            {file.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors duration-200"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFile(file, value, onChange);
                                                            }}
                                                            disabled={disabled || isSubmitting}
                                                            aria-label={`Remove file ${file.name}`}
                                                        >
                                                            <XIcon className="h-3 w-3" aria-hidden="true" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ) : !multiple && value ? (
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center gap-1 max-w-full text-xs sm:text-sm py-1 px-2"
                                            >
                                                <span className="truncate max-w-[200px] sm:max-w-[300px]" title={(value as File).name}>
                                                    {(value as File).name}
                                                </span>
                                            </Badge>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onChange(null)}
                                                disabled={disabled || isSubmitting}
                                                className="transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[36px]"
                                                aria-label={`Remove file ${(value as File).name}`}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : null}
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