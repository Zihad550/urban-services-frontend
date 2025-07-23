import { useState } from 'react';
import { useGetServiceReviewsQuery } from '@/redux/api/servicesApi';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ServiceReviewsProps {
    serviceId: string;
    initialLimit?: number;
}

const ServiceReviews = ({ serviceId, initialLimit = 5 }: ServiceReviewsProps) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(initialLimit);

    const { data, isLoading, isFetching } = useGetServiceReviewsQuery({
        serviceId,
        page,
        limit
    });

    const reviews = data?.data || [];
    const pagination = data?.pagination;
    const isLoaded = !isLoading && !isFetching;

    const handleLoadMore = () => {
        if (pagination && page < pagination.totalPages) {
            setPage(page + 1);
        } else {
            setLimit(limit + 5);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reviews yet for this service</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-600">
                                    {review.isVerified && (
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded ml-2">
                                            Verified
                                        </span>
                                    )}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                        <div className="flex mt-3 space-x-2 overflow-x-auto">
                            {review.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Review image ${index + 1}`}
                                    className="h-20 w-20 object-cover rounded-md"
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {pagination && (pagination.page < pagination.totalPages || reviews.length < pagination.total) && (
                <div className="text-center pt-4">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={!isLoaded}
                    >
                        {isFetching ? <LoadingSpinner size="sm" /> : 'Load More Reviews'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ServiceReviews;