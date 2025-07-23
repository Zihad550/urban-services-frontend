import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetServiceByIdQuery, useGetServiceReviewsQuery } from '@/redux/api/servicesApi';
import { useGetWorkersByServiceQuery } from '@/redux/api/workersApi';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import Title from '@/components/shared/Title/Title';
import WorkerCard from './WorkerCard';
import ServiceReviews from './ServiceReviews';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { BookingWizard } from '@/components/features/bookings/components';

const ServiceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showReviews, setShowReviews] = useState(false);

    const { data: service, isLoading: isServiceLoading } = useGetServiceByIdQuery(
        { id: id! },
        { skip: !id }
    );

    const { data: workersData, isLoading: isWorkersLoading } = useGetWorkersByServiceQuery(
        { serviceId: id!, limit: 4 },
        { skip: !id }
    );

    const { data: reviewsData } = useGetServiceReviewsQuery(
        { serviceId: id!, limit: 5 },
        { skip: !id }
    );

    const workers = workersData?.data || [];
    const reviews = reviewsData?.data || [];
    const reviewCount = reviewsData?.pagination?.total || 0;

    if (isServiceLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Service not found</h2>
                <Button onClick={() => navigate('/services')}>Back to Services</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="rounded-lg overflow-hidden mb-6">
                        <img
                            src={service.imageUrl || '/placeholder-service.jpg'}
                            alt={service.name}
                            className="w-full h-[300px] object-cover"
                        />
                    </div>

                    <h1 className="text-3xl font-bold mb-4">{service.name}</h1>

                    <div className="flex items-center mb-6">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-2">
                            {service.category}
                        </span>
                        <span className="text-gray-600">
                            {reviewCount} reviews
                        </span>
                    </div>

                    <div className="prose max-w-none mb-8">
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p className="text-gray-700">{service.description}</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Service Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-700">Price</h3>
                                <p className="text-lg font-bold">${service.basePrice}</p>
                                <p className="text-sm text-gray-500 capitalize">{service.priceType} rate</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-700">Duration</h3>
                                <p className="text-lg font-bold">{service.duration} minutes</p>
                                <p className="text-sm text-gray-500">Estimated time</p>
                            </div>
                        </div>
                    </div>

                    {service.requirements && service.requirements.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                {service.requirements.map((req, index) => (
                                    <li key={index} className="text-gray-700">{req}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Reviews</h2>
                            <Button variant="outline" onClick={() => setShowReviews(!showReviews)}>
                                {showReviews ? 'Hide Reviews' : 'Show All Reviews'}
                            </Button>
                        </div>

                        {showReviews && (
                            <ServiceReviews serviceId={service.id} />
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Book this Service</h2>
                        <p className="text-gray-700 mb-6">
                            Select your preferred date and time to book this service.
                        </p>

                        <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Price</h3>
                            <p className="text-2xl font-bold">${service.basePrice}</p>
                            <p className="text-sm text-gray-500 capitalize">{service.priceType} rate</p>
                        </div>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button className="w-full">Book Now</Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-lg">
                                <SheetHeader>
                                    <SheetTitle>Book {service.name}</SheetTitle>
                                    <SheetDescription>
                                        Complete your booking details to schedule this service.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="py-6">
                                    {!user ? (
                                        <div className="text-center py-8">
                                            <p className="mb-4">Please login to book this service</p>
                                            <Button onClick={() => navigate('/login')}>Login</Button>
                                        </div>
                                    ) : (
                                        <BookingWizard service={service} onClose={() => document.querySelector('[data-radix-collection-item]')?.dispatchEvent(new MouseEvent('click'))} />
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            {/* Available Workers Section */}
            <div className="mt-16">
                <Title>Available {service.category} Professionals</Title>
                <p className="text-center mx-auto mt-3 mb-10">
                    Choose from our top-rated professionals
                </p>

                {isWorkersLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <LoadingSpinner />
                    </div>
                ) : workers.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">
                        No workers available for this service at the moment
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workers.map((worker) => (
                            <WorkerCard key={worker.id} worker={worker} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-8">
                    <Button onClick={() => navigate(`/workers/${service.category}`)}>
                        View All {service.category} Professionals
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;