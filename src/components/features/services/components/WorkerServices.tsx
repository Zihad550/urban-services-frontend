import { useParams } from 'react-router-dom';
import { useGetServicesByCategoryQuery } from '@/redux/api/servicesApi';
import { useGetTopRatedWorkersQuery } from '@/redux/api/workersApi';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import Title from '@/components/shared/Title/Title';
import ServiceCard from './ServiceCard';
import WorkerCard from './WorkerCard';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { ServiceBanner } from './ServiceBanner';
import type { ServiceCategoryType } from '@/types/common';

interface SkillCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const SkillCard = ({ icon, title, description }: SkillCardProps) => (
    <div className="bg-white p-3 rounded-lg shadow-md flex flex-col">
        <div className="text-6xl my-3 text-blue-500 flex justify-center">
            {icon}
        </div>
        <h2 className="mb-3 text-xl text-center">{title}</h2>
        <p className="text-center">{description}</p>
    </div>
);

const WorkerServices = () => {
    const { service } = useParams<{ service: string }>();

    // Convert URL parameter to service category type
    const getServiceCategory = (): ServiceCategoryType => {
        if (service === 'electrician') return 'electrician';
        if (service === 'plumber') return 'plumber';
        if (service === 'chef') return 'chef';
        if (service === 'to-let' || service === 'tolet') return 'to_let';
        return 'electrician'; // Default
    };

    const serviceCategory = getServiceCategory();
    const categoryId = serviceCategory; // Assuming category ID matches the category name

    const { data: servicesData, isLoading: isServicesLoading } = useGetServicesByCategoryQuery({
        categoryId,
        limit: 8
    });

    const { data: workersData, isLoading: isWorkersLoading } = useGetTopRatedWorkersQuery({
        serviceCategory,
        limit: 4
    });

    const services = servicesData?.data || [];
    const workers = workersData?.data || [];

    // Skills section data
    const skills = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Lightning Response Time",
            description: "You shouldn't have to wait to get your emergency fixed. We pride ourselves on our 24/7 availability and same-day response."
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "FAIR & OPEN PRICING",
            description: "We'll provide you with a free all-inclusive quote before you commit to anything. No hidden fees or nasty surprises."
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            title: "Expertise You Can Trust",
            description: "Our professionals are fully licensed and insured, and possess all the tools and expertise necessary to get the job done."
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            title: "Through Fix",
            description: "We find the root cause of the issue, and help you prevent it from happening again."
        }
    ];

    return (
        <div>
            {/* Header */}
            <Header />

            {/* Banner */}
            <ServiceBanner serviceType={serviceCategory} />

            {/* Skills */}
            <div className="mt-10 lg:mt-0">
                <Title className="lg:hidden block">Skills</Title>
                <div className="container grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 lg:-mt-28 mx-auto mt-10">
                    {skills.map((skill, index) => (
                        <SkillCard
                            key={index}
                            icon={skill.icon}
                            title={skill.title}
                            description={skill.description}
                        />
                    ))}
                </div>
            </div>

            {/* Services */}
            <div className="my-20 container mx-auto px-4">
                <Title>Our Services</Title>
                <p className="md:w-2/4 text-center mx-auto mt-3 mb-10">
                    Our estimates are free, schedule an appointment with our online scheduling
                </p>

                {isServicesLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <LoadingSpinner />
                    </div>
                ) : services.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">
                        No services available at the moment
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                serviceFor={serviceCategory}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Top Workers */}
            <div className="my-20 container mx-auto px-4">
                <Title>Top {serviceCategory === 'to_let' ? 'Property Owners' : `${serviceCategory}s`}</Title>
                <p className="md:w-2/4 text-center mx-auto mt-3 mb-10">
                    Top professionals available to hire
                </p>

                {isWorkersLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <LoadingSpinner />
                    </div>
                ) : workers.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">
                        No workers available at the moment
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workers.map((worker) => (
                            <WorkerCard key={worker.id} worker={worker} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default WorkerServices;