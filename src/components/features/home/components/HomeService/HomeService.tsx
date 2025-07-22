import { HomeServiceProps } from '@/components/features/home/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export const HomeService: React.FC<HomeServiceProps> = ({ service }) => {
    const { src, category, about, link, linkText } = service;
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <div className="relative w-full h-48">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg" />
                )}
                <img
                    className="w-full h-48 object-cover rounded-t-lg transition-opacity duration-300"
                    style={{ opacity: imageLoaded ? 1 : 0 }}
                    src={src}
                    alt={category}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    {category}
                </h3>
                <p className="mb-3 text-gray-700 overflow-hidden flex-grow">
                    {about}
                </p>

                <Button asChild variant="default" className="bg-blue-700 hover:bg-blue-800 mt-auto w-full sm:w-auto">
                    <Link to={link} className="inline-flex items-center justify-center">
                        {linkText || 'Service Details'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
};