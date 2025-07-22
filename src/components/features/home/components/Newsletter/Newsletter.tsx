import { NewsletterProps } from '@/components/features/home/types';
import { InputWithBtn } from '@/components/shared/InputWithBtn';
import { useSubscribeNewsletterMutation } from '@/redux/api/homeApi';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const Newsletter: React.FC<NewsletterProps> = ({
    title = 'Subscribe to our Newsletter',
    placeholder = 'Your Email',
    buttonText = 'Subscribe',
    onSubscribe
}) => {
    const [subscribeNewsletter, { isLoading }] = useSubscribeNewsletterMutation();
    const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubscribe = async (email: string) => {
        if (!email || !email.includes('@')) {
            setSubscriptionStatus('error');
            setTimeout(() => setSubscriptionStatus('idle'), 3000);
            return;
        }

        try {
            if (onSubscribe) {
                onSubscribe(email);
            } else {
                await subscribeNewsletter(email).unwrap();
            }
            setSubscriptionStatus('success');

            // Reset status after 3 seconds
            setTimeout(() => {
                setSubscriptionStatus('idle');
            }, 3000);
        } catch (error) {
            setSubscriptionStatus('error');

            // Reset status after 3 seconds
            setTimeout(() => {
                setSubscriptionStatus('idle');
            }, 3000);
        }
    };

    return (
        <div className="w-full lg:w-max p-10 rounded-lg flex justify-center bg-blue-600 text-white flex-col md:flex-row mx-auto items-center mt-10">
            <h2 className="text-2xl lg:text-4xl font-serif mr-4 mb-4 md:mb-0">{title}</h2>
            <div className="flex align-center w-full md:w-auto">
                <InputWithBtn
                    placeholder={placeholder}
                    btnText={isLoading ? undefined : buttonText}
                    onSubmit={handleSubscribe}
                    disabled={isLoading || subscriptionStatus !== 'idle'}
                    className="max-w-xs"
                    icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                />
            </div>

            {/* Status messages */}
            {subscriptionStatus === 'success' && (
                <div className="mt-2 text-green-200 ml-2">
                    Thank you for subscribing!
                </div>
            )}

            {subscriptionStatus === 'error' && (
                <div className="mt-2 text-red-200 ml-2">
                    Please enter a valid email address.
                </div>
            )}
        </div>
    );
};