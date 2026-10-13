import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider, useEvents } from './context/EventContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { MyEvents } from './pages/MyEvents';
import { Timeline } from './pages/Timeline';
import { AIImporter } from './pages/AIImporter';
import { DiscoverEvents } from './pages/DiscoverEvents';
import { Settings } from './pages/Settings';
import { EventDetailModal } from './components/events/EventDetailModal';
import { AddEventModal } from './components/events/AddEventModal';
import { AddTaskModal } from './components/tasks/AddTaskModal';
import { ToastContainer } from './components/common/Toast';
import { NavigationPage } from './types';

const MainLayout: React.FC = () => {
  const { activePage, setActivePage, loading } = useEvents();
  const { currentRoute, navigate } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Synchronize active page from route when currentRoute changes (e.g. browser back/forward or direct link)
  useEffect(() => {
    const path = currentRoute.replace(/^\//, '');
    const validPages: NavigationPage[] = ['dashboard', 'my-events', 'timeline', 'ai-importer', 'discover', 'settings'];
    if (validPages.includes(path as NavigationPage)) {
      if (activePage !== path) {
        setActivePage(path as NavigationPage);
      }
    }
  }, [currentRoute]);

  // Synchronize route when activePage changes within the app
  useEffect(() => {
    if (currentRoute !== `/${activePage}`) {
      navigate(`/${activePage}`);
    }
  }, [activePage, currentRoute, navigate]);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'my-events':
        return <MyEvents />;
      case 'timeline':
        return <Timeline />;
      case 'ai-importer':
        return <AIImporter />;
      case 'discover':
        return <DiscoverEvents />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#111311] text-[#F3F0E8] font-sans">
      {/* Desktop Command Sidebar */}
      <div className="hidden md:block bg-[#151713] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 bg-tech-grid">
        <Header onToggleMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="w-8 h-8 rounded-full border-2 border-[#C6FF3D] border-t-transparent animate-spin" />
            </div>
          ) : (
            renderCurrentPage()
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <EventDetailModal />
      <AddEventModal />
      <AddTaskModal />

      {/* Global Toast Feedback System */}
      <ToastContainer />
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { currentRoute, isAuthenticated, isLoadingAuth, navigate } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#111311] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#C6FF3D] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#A5A89F]">Initializing MyCampus session...</span>
        </div>
      </div>
    );
  }

  // Public Landing Page route
  if (currentRoute === '/' || currentRoute === '') {
    return <LandingPage />;
  }

  // Demo Login route
  if (currentRoute === '/login') {
    if (isAuthenticated) {
      return <MainLayout />;
    }
    return <LoginPage />;
  }

  // Protected application routes
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <EventProvider>
          <AppRouter />
        </EventProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
