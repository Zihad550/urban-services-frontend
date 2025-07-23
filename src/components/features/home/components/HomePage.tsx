import { useAuth } from '@/hooks/useAuth';
import { Title } from '@/components/shared/Title';
import { Button } from '@/components/ui/button';
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
import { Link } from 'react-router';

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
        <div className="min-h-screen bg-background">
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            {/* Banner */}
            <section aria-label="Hero banner">
                <HomeBanner slides={bannerSlides} />
            </section>

            {/* Main content */}
            <main id="main-content" className="space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-20">
                {/* Loading state */}
                {isLoading && (
                    <div className="container py-12 sm:py-16 lg:py-20">
                        <div className="flex justify-center items-center">
                            <LoadingSpinner size="lg" />
                            <span className="ml-3 text-muted-foreground">Loading content...</span>
                        </div>
                    </div>
                )}

                {/* Services */}
                <section
                    className="py-8 sm:py-12 md:py-16 lg:py-20"
                    aria-labelledby="services-heading"
                    role="region"
                >
                    <div className="container">
                        <Title id="services-heading">Services We Provide</Title>
                        <HomeServices services={serviceCategories} />
                    </div>
                </section>

                {/* Why Choose Us */}
                <section
                    className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/30"
                    aria-labelledby="why-choose-us-heading"
                    role="region"
                >
                    <WhyChooseUs sections={whyChooseUsSections} />
                </section>

                {/* Feedbacks */}
                <section
                    className="py-8 sm:py-12 md:py-16 lg:py-20"
                    aria-labelledby="feedback-heading"
                    role="region"
                >
                    <FeedbackSection feedbacks={feedbacks} />
                </section>

                {/* Partners */}
                <section
                    className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/20"
                    aria-labelledby="partners-heading"
                    role="region"
                >
                    <Partners partners={partners} />
                </section>

                {/* Newsletter */}
                <section
                    className="py-8 sm:py-12 md:py-16 lg:py-20"
                    aria-labelledby="newsletter-heading"
                    role="region"
                >
                    <div className="container">
                        <Newsletter />
                    </div>
                </section>

                {/* User-specific content */}
                {isAuthenticated && user && (
                    <section
                        className="py-8 sm:py-12 md:py-16 lg:py-20 bg-primary/5"
                        aria-labelledby="user-dashboard-heading"
                        role="region"
                    >
                        <div className="container text-center">
                            <h2 id="user-dashboard-heading" className="text-2xl sm:text-3xl font-bold mb-4">
                                Welcome back, {user.displayName || 'User'}!
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                Ready to manage your services? Access your dashboard to view bookings, manage your profile, and more.
                            </p>
                            <Button
                                asChild
                                size="lg"
                                className="text-base px-8 py-3"
                            >
                                <Link to="/dashboard">
                                    Go to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};