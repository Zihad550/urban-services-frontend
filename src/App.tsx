import './App.css';
import { useAuth } from './hooks/useAuth';
import { useAuthListener } from './hooks/useAuthListener';

function App() {
  // Initialize auth listener to sync Firebase auth state with Redux
  useAuthListener();

  // Get auth state from Redux
  const { user, isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Urban Services Platform
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isAuthenticated && user ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h2 className="text-lg font-semibold">Welcome, {user.displayName || user.email}!</h2>
              <p>Role: {user.role}</p>
              <p>Authentication system is working correctly.</p>
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <h2 className="text-lg font-semibold">Authentication System Ready</h2>
              <p>User is not authenticated. The Redux auth slice is properly configured.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App
