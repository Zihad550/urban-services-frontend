import { PartnersProps } from '@/components/features/home/types';
import { Title } from '@/components/shared/Title';
import { useGetPartnersQuery } from '@/redux/api/homeApi';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useState } from 'react';

// Fallback partners
const FALLBACK_PARTNERS = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    src: `https://via.placeholder.com/150x80?text=Partner+${i + 1}`,
    name: `Partner ${i + 1}`
}));

export const Partners: React.FC<PartnersProps> = ({
    partners: propPartners,
    title = 'Our Partners'
}) => {
    const { data: apiPartners, isLoading } = useGetPartnersQuery();
    const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

    // Use provided partners, API partners, or fallback partners
    const partners = propPartners || apiPartners || FALLBACK_PARTNERS;

    const handleImageLoad = (id: number) => {
        setLoadedImages(prev => ({
            ...prev,
            [id]: true
        }));
    };

    return (
        <div className="my-20">
            <Title>{title}</Title>

            {isLoading && !propPartners ? (
                <div className="flex justify-center items-center py-10">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="container mx-auto my-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:w-3/4">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-16 w-full">
                                {!loadedImages[partner.id] && (
                                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
                                )}
                                <img
                                    src={partner.src}
                                    alt={partner.name || `Partner ${partner.id}`}
                                    className="h-16 object-contain w-full transition-opacity duration-300"
                                    style={{ opacity: loadedImages[partner.id] ? 1 : 0 }}
                                    loading="lazy"
                                    onLoad={() => handleImageLoad(partner.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};