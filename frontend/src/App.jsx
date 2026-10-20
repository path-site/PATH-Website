import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { 
  ADMIN_ROUTES, 
  ADMIN_GATEWAY_SECRET, 
  isAdminGatewayUnlocked, 
  unlockAdminGateway 
} from './config/adminConfig';

// Public Layout & Pages
import PublicLayout from './components/layout/PublicLayout';
import HomePage from './pages/public/HomePage';
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import AnnouncementDetailPage from './pages/public/AnnouncementDetailPage';
import MissionVisionPage from './pages/public/MissionVisionPage';
import HistoryPage from './pages/public/HistoryPage';
import PriestsPage from './pages/public/PriestsPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import MinistriesPage from './pages/public/MinistriesPage';
import CustomPageView from './pages/public/CustomPageView';

// Admin Layout & Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardOverview from './pages/admin/DashboardOverview';
import HomepageBuilder from './pages/admin/HomepageBuilder';
import PageManager from './pages/admin/PageManager';
import NavigationManager from './pages/admin/NavigationManager';
import AnnouncementManager from './pages/admin/AnnouncementManager';
import EventManager from './pages/admin/EventManager';
import PriestManager from './pages/admin/PriestManager';
import MinistriesManager from './pages/admin/MinistriesManager';
import HistoryManager from './pages/admin/HistoryManager';
import GalleryManager from './pages/admin/GalleryManager';
import MediaLibrary from './pages/admin/MediaLibrary';
import ContactSettings from './pages/admin/ContactSettings';
import UserManager from './pages/admin/UserManager';
import GeneralSettings from './pages/admin/GeneralSettings';
import AIResponsesManager from './pages/admin/AIResponsesManager';

// Secret Gateway Access Handler:
// When the secret link is accessed, unlock portal access and immediately redirect/replace URL with /admin/login
function SecretGatewayHandler() {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('path_admin_token');

  unlockAdminGateway();
  const target = (isAuthenticated || token) ? ADMIN_ROUTES.base : ADMIN_ROUTES.login;
  return <Navigate to={target} replace />;
}

// Protected Login Route:
// Direct access to /admin/login is forbidden unless unlocked via the secret link
function AdminLoginRoute() {
  const { isAuthenticated, loading } = useAuth();
  const token = localStorage.getItem('path_admin_token');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-10 h-10 border-4 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated, redirect straight to the admin dashboard
  if (isAuthenticated || token) {
    return <Navigate to={ADMIN_ROUTES.base} replace />;
  }

  // Only permit access if session is unlocked via the secret gateway link
  if (!isAdminGatewayUnlocked()) {
    return <Navigate to="/" replace />;
  }

  return <AdminLogin />;
}

// Protected Admin Suite Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-10 h-10 border-4 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const token = localStorage.getItem('path_admin_token');
  if (!isAuthenticated && !token) {
    // If unlocked via gateway, route to login; otherwise block and redirect to home
    return <Navigate to={isAdminGatewayUnlocked() ? ADMIN_ROUTES.login : '/'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Analytics />
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="announcements/:slug" element={<AnnouncementDetailPage />} />
              <Route path="about/mission-vision" element={<MissionVisionPage />} />
              <Route path="about/history" element={<HistoryPage />} />
              <Route path="about/priests" element={<PriestsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:slug" element={<EventDetailPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="ministries" element={<MinistriesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="mass-schedules" element={<Navigate to="/contact#mass-schedule" replace />} />
              <Route path="schedules" element={<Navigate to="/contact#mass-schedule" replace />} />
              
              {/* Dynamic Pages created via PageManager */}
              <Route path="pages/:slug" element={<CustomPageView />} />
            </Route>

            {/* Secret Gateway Entry Point: Unlocks portal and immediately replaces URL with /admin/login */}
            <Route path={ADMIN_GATEWAY_SECRET} element={<SecretGatewayHandler />} />
            <Route path={`${ADMIN_GATEWAY_SECRET}/*`} element={<SecretGatewayHandler />} />

            {/* Admin Login: Only accessible if unlocked via the secret link */}
            <Route path={ADMIN_ROUTES.login} element={<AdminLoginRoute />} />

            {/* Redirect /admin/preview to /preview so it never opens inside AdminLayout */}
            <Route path="/admin/preview" element={<Navigate to="/preview" replace />} />

            {/* Protected Whole-Page Admin Live Preview Routes */}
            <Route
              path="/preview"
              element={
                <ProtectedRoute>
                  <PublicLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="announcements/:slug" element={<AnnouncementDetailPage />} />
              <Route path="about/mission-vision" element={<MissionVisionPage />} />
              <Route path="about/history" element={<HistoryPage />} />
              <Route path="about/priests" element={<PriestsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:slug" element={<EventDetailPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="ministries" element={<MinistriesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="pages/:slug" element={<CustomPageView />} />
            </Route>

            {/* Protected Admin Management Suite */}
            <Route
              path={ADMIN_ROUTES.base}
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="homepage-builder" element={<HomepageBuilder />} />
              <Route path="pages" element={<PageManager />} />
              <Route path="navigation" element={<NavigationManager />} />
              <Route path="announcements" element={<AnnouncementManager />} />
              <Route path="events" element={<EventManager />} />
              <Route path="priests" element={<PriestManager />} />
              <Route path="ministries" element={<MinistriesManager />} />
              <Route path="history" element={<HistoryManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="theme" element={<Navigate to={ADMIN_ROUTES.base} replace />} />
              <Route path="contact-settings" element={<ContactSettings />} />
              <Route path="users" element={<UserManager />} />
              <Route path="ai-responses" element={<AIResponsesManager />} />
              <Route path="settings" element={<GeneralSettings />} />
            </Route>

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
