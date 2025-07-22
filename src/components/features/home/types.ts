export interface BannerSlide {
    id: number;
    src: string;
    title: string;
    link: string;
    linkText: string;
}

export interface ServiceCategory {
    id: number;
    src: string;
    category: string;
    link: string;
    linkText: string;
    about: string;
}

export interface Partner {
    id: number;
    src: string;
    name?: string;
}

export interface Feedback {
    id: number;
    src: string;
    name: string;
    role: string;
    about: string;
}

export interface WhyChooseUsSection {
    id: number;
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    reverse?: boolean;
}

export interface HomeBannerProps {
    slides?: BannerSlide[];
    autoplay?: boolean;
    speed?: number;
}

export interface HomeServicesProps {
    services?: ServiceCategory[];
}

export interface HomeServiceProps {
    service: ServiceCategory;
}

export interface PartnersProps {
    partners?: Partner[];
    title?: string;
}

export interface FeedbackProps {
    feedback: Feedback;
}

export interface FeedbackSectionProps {
    feedbacks?: Feedback[];
    title?: string;
    autoplay?: boolean;
    autoplaySpeed?: number;
}

export interface NewsletterProps {
    title?: string;
    placeholder?: string;
    buttonText?: string;
    onSubscribe?: (email: string) => void;
}

export interface WhyChooseUsProps {
    sections?: WhyChooseUsSection[];
    title?: string;
}