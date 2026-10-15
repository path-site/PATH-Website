import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ADMIN_ROUTES } from './config/adminConfig';

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
import HistoryManager from './pages/admin/HistoryManager';
import GalleryManager from './pages/admin/GalleryManager';
import MediaLibrary from './pages/admin/MediaLibrary';
import ContactSettings from './pages/admin/ContactSettings';
import UserManager from './pages/admin/UserManager';
import GeneralSettings from './pages/admin/GeneralSettings';
import AIResponsesManager from './pages/admin/AIResponsesManager';

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
    return <Navigate to={ADMIN_ROUTES.login} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
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

            {/* Secret Admin Authentication Gateway */}
            <Route path={ADMIN_ROUTES.login} element={<AdminLogin />} />

            {/* Secret Protected Admin Suite */}
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
              <Route path="history" element={<HistoryManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="theme" element={<Navigate to={ADMIN_ROUTES.base} replace />} />
              <Route path="contact-settings" element={<ContactSettings />} />
              <Route path="users" element={<UserManager />} />
              <Route path="ai-responses" element={<AIResponsesManager />} />
              <Route path="settings" element={<GeneralSettings />} />
            </Route>

            {/* Disallow old /admin path: quietly redirect curious visitors to Home */}
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
