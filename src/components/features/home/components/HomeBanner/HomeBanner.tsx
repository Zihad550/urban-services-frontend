import { HomeBannerProps } from '@/components/features/home/types';
import { useGetBannerSlidesQuery } from '@/redux/api/homeApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Placeholder banner slides for fallback
const FALLBACK_SLIDES = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216',
        title: 'Find the Perfect Service',
        link: '/allServices',
        linkText: 'Services'
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
        title: 'Connect with Skilled Workers',
        link: '/workers',
        linkText: 'Workers'
    },
    {
        id: 3,
        src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
        title: 'Need Help? Contact Us',
        link: '/contactUs',
        linkText: 'Contact Us'
    }
];

interface ArrowProps {
    direction: 'left' | 'right';
    onClick: () => void;
}

const Arrow: React.FC<ArrowProps> = ({ direction, onClick }) => {
    const isLeft = direction === 'left';

    return (
        <button
            onClick={onClick}
            className={`
        text-white absolute top-1/2 -translate-y-1/2 
        ${isLeft ? 'left-0 rounded-r-full' : 'right-0 rounded-l-full'}
        bg-blue-500 p-2 md:p-3 z-10 hover:bg-blue-600 transition-colors
      `}
            aria-label={isLeft ? 'Previous slide' : 'Next slide'}
        >
            {isLeft ? (
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            ) : (
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            )}
        </button>
    );
};

export const HomeBanner: React.FC<HomeBannerProps> = ({
    slides: propSlides,
    autoplay = true,
    speed = 5000
}) => {
    const { data: apiSlides, isLoading, error } = useGetBannerSlidesQuery();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Use provided slides, API slides, or fallback slides
    const slides = propSlides || apiSlides || FALLBACK_SLIDES;
    const slideCount = slides.length;

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide((index + slideCount) % slideCount);
    }, [slideCount]);

    const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
    const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

    // Set up autoplay
    React.useEffect(() => {
        if (!autoplay) return;

        const interval = setInterval(nextSlide, speed);
        return () => clearInterval(interval);
    }, [autoplay, speed, nextSlide]);

    return (
        <div className="relative overflow-hidden">
            {isLoading && !propSlides ? (
                <div className="w-full xl:h-[800px] md:h-[600px] h-[400px] flex items-center justify-center bg-gray-100">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((banner) => (
                        <div
                            key={banner.id}
                            className="w-full flex-shrink-0 xl:h-[800px] md:h-[600px] h-[400px]"
                        >
                            <div
                                className="w-full h-full flex items-center justify-center bg-cover bg-center"
                                style={{ backgroundImage: `url(${banner.src})` }}
                            >
                                <div className="flex flex-col items-center bg-blue-200 bg-opacity-60 p-5 rounded-lg">
                                    <h2 className="text-black text-3xl md:text-5xl text-center">
                                        {banner.title}
                                    </h2>
                                    <Link
                                        to={banner.link}
                                        className="mt-3 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-purple-300"
                                    >
                                        {banner.linkText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && slides.length > 1 && (
                <>
                    {/* Navigation arrows */}
                    <Arrow direction="left" onClick={prevSlide} />
                    <Arrow direction="right" onClick={nextSlide} />

                    {/* Dots navigation */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-3 w-3 rounded-full transition-colors ${index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};