import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../services/api';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import { 
  MAINTENANCE_SECTIONS, 
  getSectionByPath, 
  getRawSectionMaintenance,
  getRawOverallMaintenance
} from '../../config/maintenanceConfig';
import { 
  LayoutDashboard, LayoutTemplate, FileText, Menu as MenuIcon, 
  Bell, Calendar, Users, History, Image as ImageIcon, 
  HardDrive, PhoneCall, UserCheck, Settings, 
  LogOut, ExternalLink, ChevronRight, Church, X, Bot, HeartHandshake,
  Wrench, Eye
} from 'lucide-react';

const sidebarItems = [
  { path: ADMIN_ROUTES.base, label: 'Dashboard', icon: LayoutDashboard },
  { path: ADMIN_ROUTES.homepageBuilder, label: 'Homepage Builder', icon: LayoutTemplate },
  { path: ADMIN_ROUTES.pages, label: 'Pages', icon: FileText },
  { path: ADMIN_ROUTES.navigation, label: 'Navigation', icon: MenuIcon },
  { path: ADMIN_ROUTES.announcements, label: 'Announcements', icon: Bell },
  { path: ADMIN_ROUTES.events, label: 'Events', icon: Calendar },
  { path: ADMIN_ROUTES.priests, label: 'Priests', icon: Users },
  { path: ADMIN_ROUTES.ministries, label: 'Ministries', icon: HeartHandshake },
  { path: ADMIN_ROUTES.history, label: 'Church History', icon: History },
  { path: ADMIN_ROUTES.aiResponses, label: 'AI Responses', icon: Bot },
  { path: ADMIN_ROUTES.gallery, label: 'Gallery', icon: ImageIcon },
  { path: ADMIN_ROUTES.media, label: 'Media Library', icon: HardDrive },
  { path: ADMIN_ROUTES.contactSettings, label: 'Contact Settings', icon: PhoneCall },
  { path: ADMIN_ROUTES.users, label: 'Admin Users', icon: UserCheck },
  { path: ADMIN_ROUTES.settings, label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings, refreshSettings } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerSaving, setHeaderSaving] = useState(false);

  // Overall system-wide maintenance mode (raw CMS database state)
  const isOverallMaint = getRawOverallMaintenance(settings);

  // Determine current active section for topbar maintenance control (raw state)
  const activeSection = getSectionByPath(location.pathname);
  const isCurrentSectionMaintenance = getRawSectionMaintenance(activeSection, settings);

  const handleHeaderMaintenanceToggle = async () => {
    if (!activeSection || headerSaving) return;
    setHeaderSaving(true);
    try {
      const nextState = !isCurrentSectionMaintenance;
      const payload = {
        [activeSection.settingKey]: nextState ? 'true' : 'false',
      };
      if (activeSection.id === 'ministries') {
        payload.ministries_banner_enabled = nextState ? 'true' : 'false';
      }
      await adminApi.saveSettings(payload);
      await refreshSettings();
    } catch (err) {
      console.error('Failed to toggle maintenance from topbar', err);
    } finally {
      setHeaderSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-stone-100 flex text-stone-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. SEPARATE SIDEBAR CONTAINER (FIXED & NEVER SCROLLS WITH PAGE) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-[#191516] text-white flex flex-col justify-between shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 overflow-hidden border-r border-stone-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header Identity - Fixed */}
          <div className="h-20 shrink-0 px-6 flex items-center justify-between border-b border-stone-800">
            <Link to={ADMIN_ROUTES.base} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-md ring-2 ring-[#D4AF37] flex items-center justify-center shrink-0 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="PATH Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif-heading font-bold text-white text-base block leading-tight">
                  PATH CMS
                </span>
                <span className="text-xs text-amber-300 font-semibold tracking-wide">
                  Parish Admin Suite
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links - Internal Scroll only if vertical space requires */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1 min-h-0">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === ADMIN_ROUTES.base 
                ? location.pathname === ADMIN_ROUTES.base
                : location.pathname.startsWith(item.path);
              const matchingSec = MAINTENANCE_SECTIONS.find(s => s.adminPath === item.path);
              const isItemMaintenance = matchingSec ? getRawSectionMaintenance(matchingSec, settings) : false;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#800020] text-white shadow-md font-semibold ring-1 ring-amber-400/40'
                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.path === ADMIN_ROUTES.settings && isOverallMaint && (
                    <span 
                      title="Master Maintenance Mode is ACTIVE. The entire public website is shielded."
                      className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold tracking-wider uppercase shadow-xs shrink-0 animate-pulse"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping shrink-0" />
                      <span>MASTER ON</span>
                    </span>
                  )}
                  {item.path !== ADMIN_ROUTES.settings && isItemMaintenance && (
                    <span 
                      title={`${item.label} is currently in Under Maintenance Mode`}
                      className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold tracking-wider uppercase shadow-xs shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping shrink-0" />
                      <span>Maint</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout - Fixed at bottom of sidebar */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/50 shrink-0">
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {user?.fullName || 'Administrator'}
              </p>
              <p className="text-xs text-stone-400 truncate">
                {user?.email || 'pathsoccomit@gmail.com'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300">
              ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-800 hover:bg-rose-950/40 hover:text-rose-300 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT CONTAINER: TOP NAV CONTAINER + MAIN SCROLLING VIEW */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP NAVBAR: DISTINCT FIXED CONTAINER */}
        <header className="h-16 sm:h-20 shrink-0 bg-white border-b border-stone-200 px-3 sm:px-8 flex items-center justify-between z-30 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 mr-2 sm:mr-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-stone-700 hover:bg-stone-100 shrink-0"
              aria-label="Open sidebar menu"
            >
              <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs text-stone-400 font-medium block truncate leading-tight">
                Parish Content Management System
              </span>
              <h2 className="text-xs sm:text-base lg:text-lg font-bold text-stone-800 uppercase tracking-tight truncate leading-tight mt-0.5">
                {settings.site_name || 'Parish of the Alliance of the Two Hearts'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeSection && (
              <button
                type="button"
                onClick={handleHeaderMaintenanceToggle}
                disabled={headerSaving}
                title={
                  isCurrentSectionMaintenance
                    ? 'Under Maintenance Mode is ACTIVE for this section. Public visitors see an Under Maintenance notice. Click to switch to Live Mode.'
                    : 'Section is Live. Click to turn ON Under Maintenance Mode so you can safely make major changes.'
                }
                className={`inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                  isCurrentSectionMaintenance
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-300/60 hover:bg-amber-200 animate-pulse'
                    : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isCurrentSectionMaintenance ? 'bg-amber-600 animate-ping' : 'bg-emerald-500'
                  }`}
                />
                <span className="hidden md:inline">{activeSection.shortLabel}:</span>
                <span>{isCurrentSectionMaintenance ? 'Maintenance ON' : 'Live Mode'}</span>
              </button>
            )}

            {isOverallMaint && (
              <Link
                to={ADMIN_ROUTES.settings}
                title="System-Wide Maintenance Mode is ACTIVE. The entire public website is shielded. Click to manage in Settings."
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500 text-stone-950 text-[11px] sm:text-xs font-extrabold shadow-sm ring-2 ring-amber-300 animate-pulse shrink-0 whitespace-nowrap hover:bg-amber-400 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping shrink-0" />
                <span className="hidden md:inline">Master Maintenance:</span>
                <span>SHIELDED</span>
              </Link>
            )}

            <a
              href="/admin/preview"
              target="_blank"
              rel="noopener noreferrer"
              title="Preview the whole live website as an Administrator in a new window (bypasses maintenance mode)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#071838] via-[#0D2556] to-[#071838] text-amber-300 hover:text-white border border-amber-400/50 text-[11px] sm:text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap hover:shadow-md hover:scale-102"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Preview Whole Site</span>
              <span className="sm:hidden">Preview</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] uppercase font-extrabold tracking-wider border border-amber-400/30">
                Live
              </span>
            </a>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              title="View public website as external visitors see it"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-[11px] sm:text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap"
            >
              <span className="hidden sm:inline">View Public Website</span>
              <span className="sm:hidden">View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* MAIN CONTENT BODY: SEPARATE CONTAINER WITH INTERNAL SCROLL ONLY */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-stone-100">
          <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
            <div key={location.pathname} className="animate-page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
