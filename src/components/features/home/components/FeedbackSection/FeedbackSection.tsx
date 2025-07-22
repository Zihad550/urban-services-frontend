import { FeedbackSectionProps } from '@/components/features/home/types';
import { Title } from '@/components/shared/Title';
import { useGetFeedbacksQuery } from '@/redux/api/homeApi';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Feedback } from '../Feedback';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Fallback feedbacks
const FALLBACK_FEEDBACKS = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        name: 'Adam Smith',
        role: 'Customer',
        about: 'Hundreds of successful organizations and companies of every size, and in 62 different countries, are using Urban Services with great satisfaction.'
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        name: 'Jason Cole',
        role: 'Customer',
        about: 'The service quality exceeded my expectations. The workers were professional, on time, and completed the job perfectly. I highly recommend Urban Services to everyone.'
    }
];

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
    feedbacks: propFeedbacks,
    title = 'Clients Feedback',
    autoplay = true,
    autoplaySpeed = 5000
}) => {
    const { data: apiFeedbacks, isLoading } = useGetFeedbacksQuery();
    const [currentFeedback, setCurrentFeedback] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Use provided feedbacks, API feedbacks, or fallback feedbacks
    const feedbacks = propFeedbacks || apiFeedbacks || FALLBACK_FEEDBACKS;

    const handleNext = useCallback(() => {
        setCurrentFeedback((prev) => (prev + 1) % feedbacks.length);
    }, [feedbacks.length]);

    const handlePrev = useCallback(() => {
        setCurrentFeedback((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
    }, [feedbacks.length]);

    // Set up autoplay
    useEffect(() => {
        if (!autoplay) return;

        const interval = setInterval(handleNext, autoplaySpeed);
        return () => clearInterval(interval);
    }, [autoplay, autoplaySpeed, handleNext]);

    return (
        <div className="container mx-auto my-20">
            <Title className="mb-10">{title}</Title>

            {isLoading && !propFeedbacks ? (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="relative">
                    <div className="overflow-hidden">
                        <div
                            className="transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentFeedback * 100}%)` }}
                        >
                            <div className="flex">
                                {feedbacks.map((feedback) => (
                                    <div key={feedback.id} className="w-full flex-shrink-0">
                                        <Feedback feedback={feedback} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation buttons */}
                    {feedbacks.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute top-1/2 left-0 -translate-y-1/2 bg-blue-500 p-2 rounded-r-full text-white hover:bg-blue-600 transition-colors"
                                aria-label="Previous feedback"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute top-1/2 right-0 -translate-y-1/2 bg-blue-500 p-2 rounded-l-full text-white hover:bg-blue-600 transition-colors"
                                aria-label="Next feedback"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}

                    {/* Navigation dots */}
                    <div className="flex justify-center mt-6 gap-2">
                        {feedbacks.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentFeedback(index)}
                                className={`h-3 w-3 rounded-full transition-colors ${index === currentFeedback ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                aria-label={`Go to feedback ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};