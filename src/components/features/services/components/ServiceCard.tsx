import { useNavigate } from 'react-router';
import type { Service } from '@/types/service';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
    service: Service;
    serviceFor?: string;
    className?: string;
}

const ServiceCard = ({ service, serviceFor, className }: ServiceCardProps) => {
    const navigate = useNavigate();
    const { name, description, imageUrl, category, basePrice, isActive } = service;

    const handleClick = () => {
        if (serviceFor) {
            navigate(`/workers/${serviceFor}`);
        } else {
            navigate(`/services/${service.id}`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <article
            className={cn(
                "group bg-card rounded-lg border border-border shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary/30",
                "min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]", // Consistent card heights
                "flex flex-col", // Flex layout for better content distribution
                !isActive && "opacity-60 cursor-not-allowed",
                className
            )}
        >
            <button
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                disabled={!isActive}
                className={cn(
                    "w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg flex flex-col",
                    "disabled:cursor-not-allowed disabled:opacity-60"
                )}
                aria-label={`View details for ${name || category} service${!isActive ? ' (currently unavailable)' : ''}`}
                aria-describedby={`service-${service.id}-description`}
                tabIndex={0}
            >
                <div className="relative aspect-video sm:aspect-[4/3] lg:aspect-[3/2] overflow-hidden rounded-t-lg flex-shrink-0">
                    <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        role="presentation"
                    />
                    {!isActive && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                                Unavailable
                            </Badge>
                        </div>
                    )}
                    {basePrice && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                            <Badge variant="default" className="text-xs sm:text-sm font-semibold">
                                From ${basePrice}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="mb-2 text-base sm:text-lg lg:text-xl xl:text-2xl font-bold tracking-tight text-foreground line-clamp-2">
                            {name || category}
                        </h3>
                        <p
                            id={`service-${service.id}-description`}
                            className="text-xs sm:text-sm lg:text-base text-muted-foreground line-clamp-3 sm:line-clamp-4 leading-relaxed"
                        >
                            {description}
                        </p>
                    </div>
                    <div className="mt-3 sm:mt-4 flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-primary font-medium">
                            {isActive ? 'Learn more →' : 'Currently unavailable'}
                        </span>
                        {category && (
                            <Badge variant="outline" className="text-xs">
                                {category}
                            </Badge>
                        )}
                    </div>
                </div>
            </button>
        </article>
    );
};

export default ServiceCard;