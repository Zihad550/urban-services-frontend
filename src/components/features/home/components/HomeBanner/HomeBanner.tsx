import { HomeBannerProps } from '@/components/features/home/types';
import { useGetBannerSlidesQuery } from '@/redux/api/homeApi';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';

// Placeholder banner slides for fallback
const FALLBACK_SLIDES = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216',
        title: 'Find the Perfect Service',
        subtitle: 'Connect with trusted professionals for all your home and business needs',
        link: '/allServices',
        linkText: 'Browse Services'
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
        title: 'Connect with Skilled Workers',
        subtitle: 'Discover experienced professionals ready to help with your projects',
        link: '/workers',
        linkText: 'Find Workers'
    },
    {
        id: 3,
        src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
        title: 'Need Help? Contact Us',
        subtitle: 'Get support and answers to all your questions',
        link: '/contactUs',
        linkText: 'Contact Us'
    }
];

interface ArrowProps {
    direction: 'left' | 'right';
    onClick: () => void;
    disabled?: boolean;
}

const Arrow: React.FC<ArrowProps> = ({ direction, onClick, disabled = false }) => {
    const isLeft = direction === 'left';

    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            variant="secondary"
            size="icon"
            className={`
                absolute top-1/2 -translate-y-1/2 z-20
                ${isLeft ? 'left-2 sm:left-4' : 'right-2 sm:right-4'}
                bg-white/90 hover:bg-white text-gray-900 shadow-lg
                h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14
                backdrop-blur-sm border border-white/20
                focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
                transition-all duration-200
            `}
            aria-label={isLeft ? 'Previous slide' : 'Next slide'}
        >
            {isLeft ? (
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            ) : (
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            )}
        </Button>
    );
};

export const HomeBanner: React.FC<HomeBannerProps> = ({
    slides: propSlides,
    autoplay = true,
    speed = 5000
}) => {
    const { data: apiSlides, isLoading, error } = useGetBannerSlidesQuery();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

    // Use provided slides, API slides, or fallback slides
    const slides = propSlides || apiSlides || FALLBACK_SLIDES;
    const slideCount = slides.length;

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide((index + slideCount) % slideCount);
    }, [slideCount]);

    const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
    const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

    const toggleAutoplay = () => {
        setIsAutoplayPaused(!isAutoplayPaused);
    };

    // Set up autoplay
    React.useEffect(() => {
        if (!autoplay || isAutoplayPaused) return;

        const interval = setInterval(nextSlide, speed);
        return () => clearInterval(interval);
    }, [autoplay, isAutoplayPaused, speed, nextSlide]);

    // Keyboard navigation
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            prevSlide();
        } else if (event.key === 'ArrowRight') {
            nextSlide();
        } else if (event.key === ' ') {
            event.preventDefault();
            toggleAutoplay();
        }
    }, [prevSlide, nextSlide]);

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <section
            className="relative overflow-hidden bg-gray-900"
            aria-label="Hero banner carousel"
            role="region"
        >
            {isLoading && !propSlides ? (
                <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    role="group"
                    aria-label={`Slide ${currentSlide + 1} of ${slideCount}`}
                >
                    {slides.map((banner, index) => (
                        <div
                            key={banner.id}
                            className="w-full flex-shrink-0 h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh] relative"
                            aria-hidden={index !== currentSlide}
                        >
                            <div
                                className="w-full h-full flex items-center justify-center bg-cover bg-center relative"
                                style={{ backgroundImage: `url(${banner.src})` }}
                            >
                                {/* Overlay for better text readability */}
                                <div className="absolute inset-0 bg-black/30" />

                                <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 lg:p-10 shadow-2xl">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                            {banner.title}
                                        </h1>
                                        {banner.subtitle && (
                                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
                                                {banner.subtitle}
                                            </p>
                                        )}
                                        <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                                            <Link
                                                to={banner.link}
                                                className="focus:ring-4 focus:ring-primary/30"
                                            >
                                                {banner.linkText}
                                            </Link>
                                        </Button>
                                    </div>
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

                    {/* Autoplay control */}
                    <Button
                        onClick={toggleAutoplay}
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm border border-white/20"
                        aria-label={isAutoplayPaused ? 'Resume autoplay' : 'Pause autoplay'}
                    >
                        {isAutoplayPaused ? (
                            <Play className="h-4 w-4" />
                        ) : (
                            <Pause className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Dots navigation */}
                    <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 sm:gap-3">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`
                                    h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-200
                                    focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/20
                                    ${index === currentSlide
                                        ? 'bg-white scale-125'
                                        : 'bg-white/60 hover:bg-white/80'
                                    }
                                `}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={index === currentSlide ? 'true' : 'false'}
                            />
                        ))}
                    </div>

                    {/* Screen reader announcements */}
                    <div className="sr-only" aria-live="polite" aria-atomic="true">
                        Slide {currentSlide + 1} of {slideCount}: {slides[currentSlide]?.title}
                    </div>
                </>
            )}
        </section>
    );
};