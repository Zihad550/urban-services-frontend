import { HomeServicesProps } from '@/components/features/home/types';
import { useGetServiceCategoriesQuery } from '@/redux/api/homeApi';
import { HomeService } from '../HomeService';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useState, useEffect } from 'react';

// Fallback service categories
const FALLBACK_SERVICES = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
        category: 'Electrician Service',
        link: '/services/electricianService',
        linkText: 'Electrician Service Details',
        about: "Professional electricians for all your electrical needs. From installations to repairs, our certified experts ensure safety and quality in every job."
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39',
        category: 'Plumber Service',
        link: '/services/plumberService',
        linkText: 'Plumber Service Details',
        about: "Expert plumbing solutions for residential and commercial properties. Our plumbers handle everything from leaks and clogs to installations and renovations."
    },
    {
        id: 3,
        src: 'https://images.unsplash.com/photo-1556911220-bff31c812dba',
        category: 'Chef Service',
        link: '/services/chefService',
        linkText: 'Chef Service Details',
        about: "Elevate your dining experience with our professional chefs. Whether it's a special occasion or regular meal prep, our culinary experts bring restaurant-quality food to your home."
    },
    {
        id: 4,
        src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
        category: 'To-Let',
        link: '/services/toLetService',
        linkText: 'Available To-Let',
        about: "Find your perfect rental property. Our platform connects you with verified property listings across the city, making your house hunting experience smooth and reliable."
    }
];

export const HomeServices: React.FC<HomeServicesProps> = ({ services: propServices }) => {
    const { data: apiServices, isLoading } = useGetServiceCategoriesQuery();
    const [visibleServices, setVisibleServices] = useState<Record<number, boolean>>({});

    // Use provided services, API services, or fallback services
    const services = propServices || apiServices || FALLBACK_SERVICES;

    // Set up intersection observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const serviceId = Number(entry.target.getAttribute('data-service-id'));
                    if (entry.isIntersecting && serviceId) {
                        setVisibleServices(prev => ({
                            ...prev,
                            [serviceId]: true
                        }));
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        const serviceElements = document.querySelectorAll('[data-service-id]');
        serviceElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [services]);

    if (isLoading && !propServices) {
        return (
            <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 sm:px-0">
                {services.map((service, index) => (
                    <div
                        key={service.id}
                        data-service-id={service.id}
                        className="transform transition-all duration-500"
                        style={{
                            opacity: visibleServices[service.id] ? 1 : 0,
                            transform: visibleServices[service.id] ? 'translateY(0)' : 'translateY(20px)',
                            transitionDelay: `${index * 100}ms`
                        }}
                    >
                        <HomeService service={service} />
                    </div>
                ))}
            </div>
        </div>
    );
};