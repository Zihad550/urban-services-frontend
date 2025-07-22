import { cn } from '@/lib/utils';

interface TitleProps {
    children: React.ReactNode;
    className?: string;
}

export const Title: React.FC<TitleProps> = ({ children, className }) => (
    <div className={cn('w-max mx-auto', className)}>
        <h2
            className="lg:text-6xl md:text-5xl sm:text-4xl text-2xl text-center mt-5 font-serif"
        >
            {children}
        </h2>
        <span className="bg-violet-500 w-3/4 h-1 mx-auto text-center block mt-3" />
    </div>
);