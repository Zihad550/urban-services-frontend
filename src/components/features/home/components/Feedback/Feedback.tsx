import { FeedbackProps } from '@/components/features/home/types';
import { useState } from 'react';

export const Feedback: React.FC<FeedbackProps> = ({ feedback }) => {
    const { name, src, about, role } = feedback;
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="px-4 py-8">
            <div className="md:grid md:grid-cols-2 mx-auto overflow-hidden md:gap-10 flex flex-col items-center justify-center">
                {/* Image */}
                <div className="overflow-hidden rounded-full flex items-center justify-end h-max relative">
                    {!imageLoaded && (
                        <div className="w-48 h-48 rounded-full bg-gray-200 animate-pulse absolute inset-0" />
                    )}
                    <img
                        className="rounded-full w-48 h-48 object-cover transition-opacity duration-300"
                        style={{ opacity: imageLoaded ? 1 : 0 }}
                        src={src}
                        alt={name}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center items-center md:items-start mt-6 md:mt-0">
                    <h4 className="text-3xl font-serif mb-1">{name}</h4>
                    <span className="bg-gray-500 text-white py-1 px-2 rounded-full mb-3 inline-block w-max text-sm">
                        {role}
                    </span>
                    <p className="text-gray-500 md:w-3/4 text-center md:text-left">{about}</p>
                </div>
            </div>
        </div>
    );
};