import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat } from 'lucide-react';
import { baseApi } from '@/redux/api/baseApi';

// Define the form schema with Zod
const workerApplicationSchema = z.object({
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    location: z.string().min(3, 'Location is required'),
    experience: z.string().min(1, 'Experience level is required'),
    skill: z.string().min(1, 'Skill level is required'),
    category: z.string().min(1, 'Category is required'),
    salary: z.string().min(1, 'Salary expectation is required'),
    imageUrl: z.string().optional(),
    description: z.string().min(10, 'Please provide a brief description of your skills and experience'),
});

type WorkerApplicationFormValues = z.infer<typeof workerApplicationSchema>;

// Create a worker application API endpoint
const workerApplicationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitWorkerApplication: builder.mutation<
            { success: boolean; message: string },
            WorkerApplicationFormValues & { name: string; email: string }
        >({
            query: (data) => ({
                url: '/workers/apply',
                method: 'POST',
                body: {
                    ...data,
                    applicationStatus: 'applied',
                    role: 'worker',
                },
            }),
        }),
    }),
});

export const { useSubmitWorkerApplicationMutation } = workerApplicationApi;

export const BecomeWorker = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitWorkerApplication] = useSubmitWorkerApplicationMutation();

    const form = useForm<WorkerApplicationFormValues>({
        resolver: zodResolver(workerApplicationSchema),
        defaultValues: {
            phone: '',
            location: '',
            experience: '0-1 year',
            skill: 'beginner',
            category: 'electrician',
            salary: '',
            imageUrl: '',
            description: '',
        },
    });

    const onSubmit = async (values: WorkerApplicationFormValues) => {
        if (!user) {
            toast({
                title: 'Authentication Error',
                description: 'You must be logged in to submit an application.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitWorkerApplication({
                ...values,
                name: user.displayName || '',
                email: user.email || '',
            }).unwrap();

            toast({
                title: 'Application Submitted',
                description: result.message || 'Your worker application has been submitted successfully.',
            });

            form.reset();
        } catch (error) {
            toast({
                title: 'Submission Failed',
                description: 'There was an error submitting your application. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <HardHat className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mt-4">Become a Worker</CardTitle>
                    <CardDescription>
                        Fill out the form below to apply as a service provider on our platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input value={user?.displayName || ''} disabled />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input value={user?.email || ''} disabled />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Phone */}
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your phone number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Location */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your location" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Experience */}
                                <FormField
                                    control={form.control}
                                    name="experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Years of Experience</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select experience level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0-1 year">0 - 1 year</SelectItem>
                                                    <SelectItem value="1-5 years">1 - 5 years</SelectItem>
                                                    <SelectItem value="5+ years">5+ years</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Skill Level */}
                                <FormField
                                    control={form.control}
                                    name="skill"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skill Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select skill level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="expert">Expert</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Category */}
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Service Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="electrician">Electrician</SelectItem>
                                                    <SelectItem value="plumber">Plumber</SelectItem>
                                                    <SelectItem value="chef">Chef</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Salary */}
                                <FormField
                                    control={form.control}
                                    name="salary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Salary (per hour)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter expected salary" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Image URL */}
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profile Image URL (optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter image URL" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skills & Experience Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your skills and experience..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};