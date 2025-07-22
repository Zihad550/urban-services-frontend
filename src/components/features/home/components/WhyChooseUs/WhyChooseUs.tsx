import { WhyChooseUsProps } from '@/components/features/home/types';
import { Title } from '@/components/shared/Title';
import { useGetWhyChooseUsSectionsQuery } from '@/redux/api/homeApi';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Fallback sections
const FALLBACK_SECTIONS = [
    {
        id: 1,
        title: 'Our Clients Are Happy',
        description: 'Nothing gives us greater pride than seeing our clients delighted with the work we\'ve done together. Our case studies are solid proof of all the different ways we\'ve transformed the way people collaborate, work, and succeed.',
        imageSrc: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
        imageAlt: 'Happy clients',
    },
    {
        id: 2,
        title: 'We Innovate for You',
        description: 'We\'re a team of dreamers, thinkers and creators. We\'re constantly evolving our products to reach even higher standards for design, quality, manufacturing, and environmental sustainability. It\'s how we earned ISO 9001 and ISO 14000 Certification and it\'s how we pledge to transform the way you work.',
        imageSrc: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e',
        imageAlt: 'Innovation',
        reverse: true,
    },
    {
        id: 3,
        title: 'We Stand by Our Values',
        description: 'We care deeply about the people we serve and the products we create. It stems from a set of uncompromising brand values that guide us in everything we do. It\'s why we believe in people-first design, working collaboratively, and sweating the details so we can find new ways to transform the way you think, create and work.',
        imageSrc: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
        imageAlt: 'Our values',
    },
];

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({
    sections: propSections,
    title = 'Why Choose Us'
}) => {
    const { data: apiSections, isLoading } = useGetWhyChooseUsSectionsQuery();
    const [visibleSections, setVisibleSections] = useState<Record<number, boolean>>({});

    // Use provided sections, API sections, or fallback sections
    const sections = propSections || apiSections || FALLBACK_SECTIONS;

    // Set up intersection observer for animations
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        sections.forEach((section) => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setVisibleSections(prev => ({
                                ...prev,
                                [section.id]: true
                            }));
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.2 }
            );

            const sectionElement = document.getElementById(`section-${section.id}`);
            if (sectionElement) {
                observer.observe(sectionElement);
                observers.push(observer);
            }
        });

        return () => {
            observers.forEach(observer => observer.disconnect());
        };
    }, [sections]);

    return (
        <div className="container mx-auto my-20">
            <Title className="mb-5">{title}</Title>

            <div className="space-y-16 mt-10">
                {sections.map((section) => (
                    <div
                        id={`section-${section.id}`}
                        key={section.id}
                        className={cn(
                            "md:grid md:grid-cols-2 md:gap-8 flex flex-col lg:w-4/5 mx-auto transition-all duration-700",
                            section.reverse && "flex-col-reverse",
                            visibleSections[section.id] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        )}
                    >
                        <div
                            className={cn(
                                "md:h-[400px] w-full flex items-center overflow-hidden",
                                section.reverse ? "md:order-2 justify-start" : "justify-end"
                            )}
                        >
                            <img
                                className={cn(
                                    "h-full w-full object-cover rounded-lg transition-all duration-1000",
                                    visibleSections[section.id] ? "scale-100" : "scale-110"
                                )}
                                src={section.imageSrc}
                                alt={section.imageAlt}
                                loading="lazy"
                            />
                        </div>

                        <div
                            className={cn(
                                "flex items-center justify-center flex-col p-5",
                                section.reverse ? "md:order-1" : ""
                            )}
                        >
                            <h3 className="text-2xl uppercase text-gray-700 mb-3 text-center">
                                {section.title}
                            </h3>
                            <p className="text-center text-gray-600">
                                {section.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};