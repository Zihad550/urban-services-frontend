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
import { Home } from 'lucide-react';
import { baseApi } from '@/redux/api/baseApi';

// Define the form schema with Zod
const toLetSchema = z.object({
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    price: z.string().min(1, 'Price is required'),
    location: z.string().min(3, 'Location is required'),
    houseCategory: z.string().min(1, 'House category is required'),
    imageUrl: z.string().optional(),
    description: z.string().min(10, 'Please provide a brief description of the property'),
    bedrooms: z.string().min(1, 'Number of bedrooms is required'),
    bathrooms: z.string().min(1, 'Number of bathrooms is required'),
    area: z.string().min(1, 'Property area is required'),
});

type ToLetFormValues = z.infer<typeof toLetSchema>;

// Create a to-let API endpoint
const toLetApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitToLet: builder.mutation<
            { success: boolean; message: string },
            ToLetFormValues & { name: string; email: string }
        >({
            query: (data) => ({
                url: '/tolets',
                method: 'POST',
                body: {
                    ...data,
                    category: 'toLet',
                    applicationStatus: 'Pending',
                },
            }),
        }),
    }),
});

export const { useSubmitToLetMutation } = toLetApi;

export const PostToLet = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitToLet] = useSubmitToLetMutation();

    const form = useForm<ToLetFormValues>({
        resolver: zodResolver(toLetSchema),
        defaultValues: {
            phone: '',
            price: '',
            location: '',
            houseCategory: 'Office Rent',
            imageUrl: '',
            description: '',
            bedrooms: '1',
            bathrooms: '1',
            area: '',
        },
    });

    const onSubmit = async (values: ToLetFormValues) => {
        if (!user) {
            toast({
                title: 'Authentication Error',
                description: 'You must be logged in to post a to-let listing.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitToLet({
                ...values,
                name: user.displayName || '',
                email: user.email || '',
            }).unwrap();

            toast({
                title: 'Listing Submitted',
                description: result.message || 'Your to-let listing has been submitted successfully.',
            });

            form.reset();
        } catch (error) {
            toast({
                title: 'Submission Failed',
                description: 'There was an error submitting your listing. Please try again.',
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
                        <Home className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mt-4">Post To-Let</CardTitle>
                    <CardDescription>
                        Fill out the form below to list your property for rent
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
                                            <FormLabel>Owner Name</FormLabel>
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

                                {/* Price */}
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monthly Rent</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter monthly rent" {...field} />
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
                                            <FormLabel>Property Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter property location" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* House Category */}
                                <FormField
                                    control={form.control}
                                    name="houseCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select property type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Office Rent">Office Space</SelectItem>
                                                    <SelectItem value="Bachelor House Rent">Bachelor Apartment</SelectItem>
                                                    <SelectItem value="Family House Rent">Family House</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Bedrooms */}
                                <FormField
                                    control={form.control}
                                    name="bedrooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bedrooms</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select number of bedrooms" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">1</SelectItem>
                                                    <SelectItem value="2">2</SelectItem>
                                                    <SelectItem value="3">3</SelectItem>
                                                    <SelectItem value="4">4</SelectItem>
                                                    <SelectItem value="5+">5+</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Bathrooms */}
                                <FormField
                                    control={form.control}
                                    name="bathrooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bathrooms</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select number of bathrooms" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">1</SelectItem>
                                                    <SelectItem value="2">2</SelectItem>
                                                    <SelectItem value="3">3</SelectItem>
                                                    <SelectItem value="4+">4+</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Area */}
                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Area (sq ft)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter property area" {...field} />
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
                                            <FormLabel>Property Image URL</FormLabel>
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
                                        <FormLabel>Property Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your property..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Post Listing'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};