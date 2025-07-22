import { baseApi } from './baseApi';
import type {
    BannerSlide,
    ServiceCategory,
    Partner,
    Feedback,
    WhyChooseUsSection
} from '@/components/features/home/types';

export const homeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBannerSlides: builder.query<BannerSlide[], void>({
            query: () => '/banners',
            transformResponse: (response: { data: BannerSlide[] }) => response.data,
            providesTags: ['Banner']
        }),

        getServiceCategories: builder.query<ServiceCategory[], void>({
            query: () => '/services/categories',
            transformResponse: (response: { data: ServiceCategory[] }) => response.data,
            providesTags: ['ServiceCategory']
        }),

        getPartners: builder.query<Partner[], void>({
            query: () => '/partners',
            transformResponse: (response: { data: Partner[] }) => response.data,
            providesTags: ['Partner']
        }),

        getFeedbacks: builder.query<Feedback[], void>({
            query: () => '/feedbacks',
            transformResponse: (response: { data: Feedback[] }) => response.data,
            providesTags: ['Feedback']
        }),

        getWhyChooseUsSections: builder.query<WhyChooseUsSection[], void>({
            query: () => '/why-choose-us',
            transformResponse: (response: { data: WhyChooseUsSection[] }) => response.data,
            providesTags: ['WhyChooseUs']
        }),

        subscribeNewsletter: builder.mutation<{ success: boolean }, string>({
            query: (email) => ({
                url: '/newsletter/subscribe',
                method: 'POST',
                body: { email }
            })
        })
    }),
});

export const {
    useGetBannerSlidesQuery,
    useGetServiceCategoriesQuery,
    useGetPartnersQuery,
    useGetFeedbacksQuery,
    useGetWhyChooseUsSectionsQuery,
    useSubscribeNewsletterMutation
} = homeApi;