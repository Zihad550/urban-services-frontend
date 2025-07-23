import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { UploadIcon, XIcon, CheckCircleIcon, AlertCircleIcon, LoaderIcon } from 'lucide-react';
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
import { Progress } from '@/components/ui/badge';

interface FileUploadStatus {
    file: File;
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

interface AutoFileUploaderProps {
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
    uploadFn: (file: File) => Promise<{ url: string }>;
    onUploadComplete?: (urls: string[]) => void;
}

export const AutoFileUploader = ({
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
    uploadFn,
    onUploadComplete,
}: AutoFileUploaderProps) => {
    const { control, formState, setValue } = useFormContext();
    const isSubmitting = formState.isSubmitting;
    const [fileError, setFileError] = useState<string | null>(null);
    const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);

    // Update form value when file statuses change
    useEffect(() => {
        const successfulUploads = fileStatuses
            .filter((status) => status.status === 'success' && status.url)
            .map((status) => status.url as string);

        if (successfulUploads.length > 0) {
            setValue(name, multiple ? successfulUploads : successfulUploads[0]);

            if (onUploadComplete) {
                onUploadComplete(successfulUploads);
            }
        } else {
            setValue(name, multiple ? [] : null);
        }
    }, [fileStatuses, setValue, name, multiple, onUploadComplete]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

        // Add files to status tracking
        const newFileStatuses = Array.from(files).map((file) => ({
            file,
            progress: 0,
            status: 'idle' as const,
        }));

        setFileStatuses((prev) => [...prev, ...newFileStatuses]);

        // Start uploading each file
        Array.from(files).forEach(async (file, index) => {
            try {
                // Update status to uploading
                setFileStatuses((prev) => {
                    const updated = [...prev];
                    const fileIndex = updated.findIndex((status) => status.file === file);
                    if (fileIndex !== -1) {
                        updated[fileIndex] = { ...updated[fileIndex], status: 'uploading', progress: 10 };
                    }
                    return updated;
                });

                // Simulate progress updates
                const progressInterval = setInterval(() => {
                    setFileStatuses((prev) => {
                        const updated = [...prev];
                        const fileIndex = updated.findIndex((status) => status.file === file);
                        if (fileIndex !== -1 && updated[fileIndex].status === 'uploading' && updated[fileIndex].progress < 90) {
                            updated[fileIndex] = {
                                ...updated[fileIndex],
                                progress: Math.min(updated[fileIndex].progress + 10, 90)
                            };
                        }
                        return updated;
                    });
                }, 500);

                // Upload file
                const result = await uploadFn(file);

                // Clear interval and update status to success
                clearInterval(progressInterval);
                setFileStatuses((prev) => {
                    const updated = [...prev];
                    const fileIndex = updated.findIndex((status) => status.file === file);
                    if (fileIndex !== -1) {
                        updated[fileIndex] = {
                            ...updated[fileIndex],
                            status: 'success',
                            progress: 100,
                            url: result.url
                        };
                    }
                    return updated;
                });
            } catch (error) {
                // Update status to error
                setFileStatuses((prev) => {
                    const updated = [...prev];
                    const fileIndex = updated.findIndex((status) => status.file === file);
                    if (fileIndex !== -1) {
                        updated[fileIndex] = {
                            ...updated[fileIndex],
                            status: 'error',
                            progress: 0,
                            error: error instanceof Error ? error.message : 'Upload failed'
                        };
                    }
                    return updated;
                });
            }
        });

        // Clear the input value to allow uploading the same file again
        event.target.value = '';
    };

    const removeFile = (fileToRemove: FileUploadStatus) => {
        setFileStatuses((prev) => prev.filter((status) => status !== fileToRemove));
    };

    const removeAllFiles = () => {
        setFileStatuses([]);
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && (
                        <FormLabel className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
                            {label}
                        </FormLabel>
                    )}
                    <FormControl>
                        <div className="space-y-2">
                            <div
                                className={cn(
                                    'border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2',
                                    'hover:border-primary/50 transition-colors',
                                    'cursor-pointer'
                                )}
                                onClick={() => {
                                    if (!disabled && !isSubmitting) {
                                        document.getElementById(`auto-file-upload-${name}`)?.click();
                                    }
                                }}
                            >
                                <UploadIcon className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Drag & drop files here, or click to select files
                                </p>
                                {accept && (
                                    <p className="text-xs text-muted-foreground">
                                        Accepted file types: {accept.replace(/\./g, '').toUpperCase()}
                                    </p>
                                )}
                                {maxSize && (
                                    <p className="text-xs text-muted-foreground">
                                        Maximum file size: {maxSize}MB
                                    </p>
                                )}
                                <input
                                    id={`auto-file-upload-${name}`}
                                    type="file"
                                    className="hidden"
                                    accept={accept}
                                    multiple={multiple}
                                    disabled={disabled || isSubmitting}
                                    onChange={handleFileChange}
                                />
                            </div>

                            {fileError && (
                                <p className="text-sm text-destructive">{fileError}</p>
                            )}

                            {/* Display file upload statuses */}
                            {fileStatuses.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium">Files:</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeAllFiles}
                                            disabled={disabled || isSubmitting}
                                        >
                                            Remove all
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {fileStatuses.map((status, index) => (
                                            <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                                <div className="flex items-center gap-2 flex-1">
                                                    {status.status === 'uploading' && (
                                                        <LoaderIcon className="h-4 w-4 animate-spin text-primary" />
                                                    )}
                                                    {status.status === 'success' && (
                                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                    )}
                                                    {status.status === 'error' && (
                                                        <AlertCircleIcon className="h-4 w-4 text-destructive" />
                                                    )}
                                                    <span className="text-sm truncate max-w-[200px]">{status.file.name}</span>
                                                </div>

                                                {status.status === 'uploading' && (
                                                    <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${status.progress}%` }}
                                                        />
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    className="ml-2 p-1 rounded-full hover:bg-destructive/20"
                                                    onClick={() => removeFile(status)}
                                                    disabled={disabled || isSubmitting || status.status === 'uploading'}
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                    <span className="sr-only">Remove file</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};