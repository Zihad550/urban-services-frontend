import { useAuth } from '@/hooks/useAuth';
import { Title } from '@/components/shared/Title';
import { HomeBanner } from './HomeBanner';
import { HomeServices } from './HomeServices';
import { WhyChooseUs } from './WhyChooseUs';
import { FeedbackSection } from './FeedbackSection';
import { Partners } from './Partners';
import { Newsletter } from './Newsletter';
import {
    useGetBannerSlidesQuery,
    useGetServiceCategoriesQuery,
    useGetFeedbacksQuery,
    useGetPartnersQuery,
    useGetWhyChooseUsSectionsQuery
} from '@/redux/api/homeApi';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const HomePage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    // Pre-fetch all data for the home page components
    const { data: bannerSlides, isLoading: isBannerLoading } = useGetBannerSlidesQuery();
    const { data: serviceCategories, isLoading: isServicesLoading } = useGetServiceCategoriesQuery();
    const { data: whyChooseUsSections, isLoading: isWhyChooseUsLoading } = useGetWhyChooseUsSectionsQuery();
    const { data: feedbacks, isLoading: isFeedbacksLoading } = useGetFeedbacksQuery();
    const { data: partners, isLoading: isPartnersLoading } = useGetPartnersQuery();

    // Check if any data is still loading
    const isLoading = isBannerLoading || isServicesLoading || isWhyChooseUsLoading ||
        isFeedbacksLoading || isPartnersLoading;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header is now included in the layout */}

            {/* Banner */}
            <HomeBanner slides={bannerSlides} />

            {/* Services */}
            <div className="my-20">
                <Title>Services We Provide</Title>
                <HomeServices services={serviceCategories} />
            </div>

            {/* Why Choose Us */}
            <WhyChooseUs sections={whyChooseUsSections} />

            {/* Feedbacks */}
            <FeedbackSection feedbacks={feedbacks} />

            {/* Partners */}
            <Partners partners={partners} />

            {/* Newsletter */}
            <div className="container mx-auto">
                <Newsletter />
            </div>

            {/* Footer is now included in the layout */}
        </div>
    );
};