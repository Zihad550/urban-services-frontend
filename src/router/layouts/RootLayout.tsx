import { Outlet } from 'react-router';
import { ErrorBoundary } from '../../components/shared/ErrorBoundary';
import { Footer } from '../../components/shared/Footer';
import { Header } from '../../components/shared/Header';

export const RootLayout: React.FC = () => {
    return (
        <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ErrorBoundary>
    );
};