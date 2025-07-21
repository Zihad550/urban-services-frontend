import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import './App.css';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useAuthListener } from './hooks/useAuthListener';
import { selectIsLoading } from './redux/features/auth/authSlice';
import { useAppSelector } from './redux/hooks';
import { store } from './redux/store';
import { router } from './router';

// Loading component for initial app load
const AppLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-600">Loading Urban Services Platform...</p>
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
      <Provider store={store}>
        <div className="app">
          <AuthInitializer />
        </div>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
