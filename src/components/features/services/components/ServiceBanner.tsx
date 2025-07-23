import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Title from '@/components/shared/Title/Title';
import type { ServiceCategoryType } from '@/types/common';

interface ServiceBannerProps {
    serviceType: ServiceCategoryType;
}

export const ServiceBanner = ({ serviceType }: ServiceBannerProps) => {
    const navigate = useNavigate();

    // Banner content based on service type
    const getBannerContent = () => {
        switch (serviceType) {
            case 'electrician':
                return {
                    title: 'Welcome to our Electrician Services',
                    description: 'Our electrician expertise isn't all that sets us apart, though! We believe every customer deserves nothing but the best customer service.That's why our team strives to provide prompt, professional electrician services at an affordable price — all from friendly and knowledgeable technicians.',
                    image: '/images/services/electrician-banner.jpg',
                    buttonText: 'Available Electricians'
                };
            case 'plumber':
                return {
                    title: 'Professional Plumbing Services',
                    description: 'From minor repairs to major installations, our licensed plumbers have the expertise to handle all your plumbing needs. We provide fast, reliable service with upfront pricing and a satisfaction guarantee on all our work.',
                    image: '/images/services/plumber-banner.jpg',
                    buttonText: 'Available Plumbers'
                };
            case 'chef':
                return {
                    title: 'Gourmet Chef Services',
                    description: 'Experience restaurant-quality dining in the comfort of your home. Our professional chefs create personalized menus tailored to your preferences and dietary needs, using only the freshest ingredients for an unforgettable culinary experience.',
                    image: '/images/services/chef-banner.jpg',
                    buttonText: 'Available Chefs'
                };
            case 'to_let':
                return {
                    title: 'Premium Rental Properties',
                    description: 'Find your perfect home with our extensive selection of rental properties. From cozy apartments to spacious houses, we offer quality accommodations to suit every lifestyle and budget, with transparent terms and professional property management.',
                    image: '/images/services/tolet-banner.jpg',
                    buttonText: 'Available Properties'
                };
            default:
                return {
                    title: 'Professional Services',
                    description: 'We provide high-quality services with experienced professionals. Our team is dedicated to delivering exceptional results and customer satisfaction on every project.',
                    image: '/images/services/default-banner.jpg',
                    buttonText: 'Available Professionals'
                };
        }
    };

    const { title, description, image, buttonText } = getBannerContent();

    // Fallback image if the specified one doesn't exist
    const fallbackImage = '/images/services/default-banner.jpg';

    return (
        <div
            className="text-white flex items-center justify-center flex-col px-4 md:px-10 h-[400px] md:h-[600px] lg:h-[700px] bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${image})`,
                backgroundSize: 'cover'
            }}
        >
            <Title className="mb-3 text-white">{title}</Title>
            <p className="mb-6 lg:w-1/2 md:w-2/3 text-center">
                {description}
            </p>
            <Button
                onClick={() => navigate(`/workers/${serviceType}`)}
                size="lg"
            >
                {buttonText}
            </Button>
        </div>
    );
};

export default ServiceBanner;