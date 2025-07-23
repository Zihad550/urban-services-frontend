import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '../BookingWizard';
import { Service } from '@/types/service';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ServiceDetailsStepProps {
    form: UseFormReturn<BookingFormData>;
    service: Service;
}

const ServiceDetailsStep = ({ form, service }: ServiceDetailsStepProps) => {
    const commonRequests = [
        'Urgent service needed',
        'Weekend availability preferred',
        'Bring additional tools/equipment',
        'Eco-friendly options if available',
        'Detailed cost estimate before work',
    ];

    // Add service-specific requests based on category
    const serviceSpecificRequests = getServiceSpecificRequests(service.category);
    const allRequests = [...commonRequests, ...serviceSpecificRequests];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <Badge variant={service.isActive ? "outline" : "secondary"}>
                            {service.isActive ? 'Available' : 'Limited Availability'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <img
                            src={service.imageUrl || '/placeholder-service.jpg'}
                            alt={service.name}
                            className="w-20 h-20 object-cover rounded-md"
                        />
                        <div>
                            <p className="text-sm text-gray-500 capitalize">{service.category}</p>
                            <div className="flex items-center mt-1">
                                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm">{service.duration} minutes</span>
                            </div>
                            <div className="mt-2">
                                <span className="text-lg font-bold">${service.basePrice}</span>
                                <span className="text-sm text-gray-500 ml-1 capitalize">({service.priceType} rate)</span>
                            </div>
                        </div>
                    </div>

                    {service.description && (
                        <div className="mt-2 text-gray-700">
                            <p>{service.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>How urgent is this service?</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                            >
                                <Card className={`cursor-pointer hover:border-gray-400 ${field.value === 'low' ? 'border-primary' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="low" id="urgency-low" />
                                            <div className="flex-1">
                                                <Label htmlFor="urgency-low" className="font-medium cursor-pointer">Low Priority</Label>
                                                <p className="text-sm text-gray-500">Schedule at your convenience</p>
                                            </div>
                                            <Info className="h-5 w-5 text-blue-500" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`cursor-pointer hover:border-gray-400 ${field.value === 'medium' ? 'border-primary' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="medium" id="urgency-medium" />
                                            <div className="flex-1">
                                                <Label htmlFor="urgency-medium" className="font-medium cursor-pointer">Standard</Label>
                                                <p className="text-sm text-gray-500">Need service within a week</p>
                                            </div>
                                            <Clock className="h-5 w-5 text-amber-500" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`cursor-pointer hover:border-gray-400 ${field.value === 'high' ? 'border-primary' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="high" id="urgency-high" />
                                            <div className="flex-1">
                                                <Label htmlFor="urgency-high" className="font-medium cursor-pointer">High Priority</Label>
                                                <p className="text-sm text-gray-500">Need service within 48 hours</p>
                                            </div>
                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`cursor-pointer hover:border-gray-400 ${field.value === 'emergency' ? 'border-primary' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="emergency" id="urgency-emergency" />
                                            <div className="flex-1">
                                                <Label htmlFor="urgency-emergency" className="font-medium cursor-pointer">Emergency</Label>
                                                <p className="text-sm text-gray-500">Need immediate assistance (additional fees may apply)</p>
                                            </div>
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </RadioGroup>
                        </FormControl>
                        <FormDescription>
                            Higher urgency may affect pricing and worker availability
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Special Requests (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allRequests.map((request) => (
                            <div key={request} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`request-${request}`}
                                    onCheckedChange={(checked) => {
                                        const currentRequests = form.getValues('specialRequests') || [];
                                        if (checked) {
                                            form.setValue('specialRequests', [...currentRequests, request]);
                                        } else {
                                            form.setValue(
                                                'specialRequests',
                                                currentRequests.filter((r) => r !== request)
                                            );
                                        }
                                    }}
                                />
                                <Label htmlFor={`request-${request}`} className="text-sm">{request}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {service.requirements && service.requirements.length > 0 && (
                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-amber-800 flex items-center">
                            <Info className="h-5 w-5 mr-2" />
                            Service Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                            {service.requirements.map((req, index) => (
                                <li key={index} className="text-sm text-amber-700">{req}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {service.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper function to get service-specific requests based on category
function getServiceSpecificRequests(category: string): string[] {
    switch (category.toLowerCase()) {
        case 'electrician':
            return [
                'Electrical safety inspection',
                'Bring replacement parts',
                'Need circuit breaker work',
                'Lighting installation/repair'
            ];
        case 'plumber':
            return [
                'Emergency water leak',
                'Drain cleaning needed',
                'Water heater service',
                'Fixture installation'
            ];
        case 'chef':
            return [
                'Dietary restrictions (specify in notes)',
                'Bring own ingredients',
                'Kitchen equipment needed',
                'Multiple course meal'
            ];
        case 'to-let':
            return [
                'Virtual tour requested',
                'Need furniture options',
                'Pet-friendly required',
                'Parking space needed'
            ];
        default:
            return [
                'Specific equipment needed',
                'Special skills required',
                'Bring replacement parts',
                'Need consultation first'
            ];
    }
}

export default ServiceDetailsStep;