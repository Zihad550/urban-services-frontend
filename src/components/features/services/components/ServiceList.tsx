import { useState } from 'react';
import { useGetServicesQuery } from '@/redux/api/servicesApi';
import ServiceCard from './ServiceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Title } from '@/components/shared/Title';
import { cn } from '@/lib/utils';
import type { ServiceCategoryType } from '@/types/common';

interface ServiceListProps {
    title?: string;
    description?: string;
    category?: ServiceCategoryType;
    limit?: number;
    showFilters?: boolean;
    className?: string;
}

const ServiceList = ({
    title = "Our Services",
    description = "Our estimates are free, schedule an appointment with our online scheduling",
    category,
    limit = 8,
    showFilters = false,
    className
}: ServiceListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(category || '');
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isFetching } = useGetServicesQuery({
        page: currentPage,
        limit,
        category: selectedCategory || undefined,
        sortBy: 'popularity',
        sortOrder: 'desc'
    });

    const services = data?.data || [];
    const pagination = data?.pagination;
    const isLoaded = !isLoading && !isFetching;

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <section className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)} aria-labelledby="services-heading">
            {title && (
                <div className="text-center mb-8 sm:mb-12">
                    <Title id="services-heading" level={2}>{title}</Title>
                    {description && (
                        <p className="w-full md:w-2/3 lg:w-1/2 text-center mx-auto mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {showFilters && (
                <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12" role="search" aria-label="Service filters">
                    <div className="flex-1">
                        <label htmlFor="service-search" className="sr-only">
                            Search services
                        </label>
                        <Input
                            id="service-search"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                            aria-describedby="search-help"
                        />
                        <div id="search-help" className="sr-only">
                            Search by service name or description
                        </div>
                    </div>
                    <div className="w-full sm:w-48">
                        <label htmlFor="category-filter" className="sr-only">
                            Filter by category
                        </label>
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger id="category-filter" className="w-full">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Categories</SelectItem>
                                <SelectItem value="electrician">Electrician</SelectItem>
                                <SelectItem value="plumber">Plumber</SelectItem>
                                <SelectItem value="chef">Chef</SelectItem>
                                <SelectItem value="to_let">To-Let</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-16 sm:py-20" role="status" aria-label="Loading services">
                    <LoadingSpinner size="lg" />
                    <span className="sr-only">Loading services...</span>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                    <div className="max-w-md mx-auto">
                        <p className="text-lg sm:text-xl text-muted-foreground mb-2">No services found</p>
                        <p className="text-sm text-muted-foreground">
                            {searchTerm || selectedCategory
                                ? "Try adjusting your search or filter criteria"
                                : "No services are currently available"
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
                        role="grid"
                        aria-label={`${filteredServices.length} services available`}
                    >
                        {filteredServices.map((service) => (
                            <div key={service.id} role="gridcell">
                                <ServiceCard
                                    service={service}
                                    serviceFor={service.category}
                                />
                            </div>
                        ))}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <nav
                            className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 sm:mt-16"
                            aria-label="Services pagination"
                        >
                            <Button
                                variant="outline"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || !isLoaded}
                                aria-label="Go to previous page"
                                className="w-full sm:w-auto"
                            >
                                Previous
                            </Button>
                            <span
                                className="text-sm sm:text-base text-muted-foreground px-4"
                                aria-current="page"
                                aria-label={`Page ${currentPage} of ${pagination.totalPages}`}
                            >
                                Page {currentPage} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={handleNextPage}
                                disabled={currentPage === pagination.totalPages || !isLoaded}
                                aria-label="Go to next page"
                                className="w-full sm:w-auto"
                            >
                                Next
                            </Button>
                        </nav>
                    )}
                </>
            )}
        </section>
    );
};

export default ServiceList;