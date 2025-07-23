import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '../BookingWizard';
import { Service } from '@/types/service';
import { useGetWorkersByServiceQuery } from '@/redux/api/workersApi';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Filter, Search, Award, ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkerSelectionStepProps {
    form: UseFormReturn<BookingFormData>;
    service: Service;
}

const WorkerSelectionStep = ({ form, service }: WorkerSelectionStepProps) => {
    const [sortBy, setSortBy] = useState<'rating' | 'price' | 'availability'>('rating');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAvailability, setFilterAvailability] = useState<'all' | 'available'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data: workersData, isLoading } = useGetWorkersByServiceQuery(
        { serviceId: service.id, limit: 20 },
        { skip: !service.id }
    );

    const workers = workersData?.data || [];

    // Filter workers based on search query and availability
    const filteredWorkers = workers
        .filter(worker =>
            worker.displayName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (filterAvailability === 'all' || worker.workingStatus === 'Free')
        );

    // Sort workers based on selected criteria
    const sortedWorkers = [...filteredWorkers].sort((a, b) => {
        if (sortBy === 'rating') {
            return b.rating - a.rating;
        } else if (sortBy === 'price') {
            // This is a placeholder - in a real app, workers might have different pricing
            return a.completedJobs - b.completedJobs;
        } else {
            // Sort by availability - Free workers first
            return a.workingStatus === 'Free' ? -1 : 1;
        }
    });

    // Set first worker as default if none selected
    useEffect(() => {
        if (sortedWorkers.length > 0 && !form.getValues('workerId')) {
            form.setValue('workerId', sortedWorkers[0].id);
        }
    }, [sortedWorkers, form]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    if (sortedWorkers.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-lg font-medium mb-2">No workers available</p>
                <p className="text-gray-500">
                    There are currently no workers available for this service. Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-medium">Select a Professional</h3>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search workers..."
                            className="pl-8 w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        <Select
                            value={filterAvailability}
                            onValueChange={(value) => setFilterAvailability(value as any)}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Availability" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Workers</SelectItem>
                                <SelectItem value="available">Available Now</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as any)}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rating">Top Rated</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="availability">Availability</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as any)}>
                <div className="flex justify-end mb-4">
                    <TabsList>
                        <TabsTrigger value="grid">Grid</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="grid">
                    <FormField
                        control={form.control}
                        name="workerId"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {sortedWorkers.map((worker) => (
                                            <Card
                                                key={worker.id}
                                                className={`cursor-pointer transition-all hover:border-primary ${field.value === worker.id ? 'border-primary bg-primary/5' : ''}`}
                                                onClick={() => form.setValue('workerId', worker.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start space-x-4">
                                                        <RadioGroupItem value={worker.id} id={`worker-${worker.id}`} className="mt-1" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center">
                                                                <img
                                                                    src={worker.photoURL || '/placeholder-avatar.jpg'}
                                                                    alt={worker.displayName}
                                                                    className="w-12 h-12 rounded-full object-cover mr-3"
                                                                />
                                                                <div>
                                                                    <Label htmlFor={`worker-${worker.id}`} className="text-base font-medium">
                                                                        {worker.displayName}
                                                                    </Label>
                                                                    <div className="flex items-center mt-1">
                                                                        <div className="flex items-center">
                                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                            <span className="ml-1 text-sm">{worker.rating.toFixed(1)}</span>
                                                                        </div>
                                                                        <span className="mx-2 text-gray-300">•</span>
                                                                        <span className="text-sm text-gray-500">
                                                                            {worker.completedJobs} jobs completed
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <Badge variant={worker.workingStatus === 'Free' ? 'outline' : 'secondary'}>
                                                                    {worker.workingStatus === 'Free' ? 'Available Now' : 'Busy'}
                                                                </Badge>
                                                                {worker.services.slice(0, 3).map((service) => (
                                                                    <Badge key={service} variant="outline">
                                                                        {service}
                                                                    </Badge>
                                                                ))}
                                                            </div>

                                                            {worker.rating >= 4.8 && (
                                                                <div className="mt-2 flex items-center text-sm text-amber-600">
                                                                    <Award className="h-4 w-4 mr-1" />
                                                                    Top Rated Professional
                                                                </div>
                                                            )}

                                                            {worker.completedJobs > 50 && (
                                                                <div className="mt-1 flex items-center text-sm text-blue-600">
                                                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                                                    Experienced (50+ jobs)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </TabsContent>

                <TabsContent value="list">
                    <FormField
                        control={form.control}
                        name="workerId"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="space-y-4"
                                    >
                                        {sortedWorkers.map((worker) => (
                                            <div
                                                key={worker.id}
                                                className={`flex items-start space-x-4 p-4 border rounded-lg ${field.value === worker.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                                                    }`}
                                            >
                                                <RadioGroupItem value={worker.id} id={`worker-list-${worker.id}`} className="mt-1" />
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={worker.photoURL || '/placeholder-avatar.jpg'}
                                                            alt={worker.displayName}
                                                            className="w-12 h-12 rounded-full object-cover mr-3"
                                                        />
                                                        <div>
                                                            <Label htmlFor={`worker-list-${worker.id}`} className="text-base font-medium">
                                                                {worker.displayName}
                                                            </Label>
                                                            <div className="flex items-center mt-1">
                                                                <div className="flex items-center">
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                    <span className="ml-1 text-sm">{worker.rating.toFixed(1)}</span>
                                                                </div>
                                                                <span className="mx-2 text-gray-300">•</span>
                                                                <span className="text-sm text-gray-500">
                                                                    {worker.completedJobs} jobs completed
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <Badge variant={worker.workingStatus === 'Free' ? 'outline' : 'secondary'}>
                                                            {worker.workingStatus === 'Free' ? 'Available Now' : 'Busy'}
                                                        </Badge>
                                                        {worker.services.slice(0, 3).map((service) => (
                                                            <Badge key={service} variant="outline">
                                                                {service}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-4">
                                                        {worker.rating >= 4.8 && (
                                                            <div className="flex items-center text-sm text-amber-600">
                                                                <Award className="h-4 w-4 mr-1" />
                                                                Top Rated Professional
                                                            </div>
                                                        )}

                                                        {worker.completedJobs > 50 && (
                                                            <div className="flex items-center text-sm text-blue-600">
                                                                <ThumbsUp className="h-4 w-4 mr-1" />
                                                                Experienced (50+ jobs)
                                                            </div>
                                                        )}

                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            Next available: Today
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default WorkerSelectionStep;