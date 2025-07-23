import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import './App.css';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ThemeProvider } from './components/ui/theme-provider';
import { useAuthListener } from './hooks/useAuthListener';
import { selectIsLoading } from './redux/features/auth/authSlice';
import { useAppSelector } from './redux/hooks';
import { store } from './redux/store';
import { router } from './router';

// Loading component for initial app load
const AppLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">Loading Urban Services Platform...</p>
      </div>
    </div>
  );
};

// Auth initialization component that runs inside Redux provider
const AuthInitializer: React.FC = () => {
  const isAuthLoading = useAppSelector(selectIsLoading);

  // Initialize auth listener to sync Firebase auth state with Redux
  useAuthListener();

  // Global app initialization logic
  useEffect(() => {
    // Global app setup (analytics, error reporting, etc.)
    console.log('Urban Services Platform initialized');
  }, []);

  // Show loading screen while authentication is being initialized
  if (isAuthLoading) {
    return <AppLoadingScreen />;
  }

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="urban-services-theme">
        <Provider store={store}>
          {/* Skip to main content link for keyboard users */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="app min-h-screen bg-background text-foreground antialiased">
            <AuthInitializer />

            {/* Accessibility announcement region for screen readers */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
              id="announcer"
            >
              {/* Dynamic announcements will be inserted here */}
            </div>
          </div>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
