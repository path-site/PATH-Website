import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import { 
  MAINTENANCE_SECTIONS,
  getRawOverallMaintenance,
  getRawSectionMaintenance,
  setAdminPreviewSimulatePublic,
  enableAdminPreviewMode
} from '../../config/maintenanceConfig';
import { 
  Monitor, Tablet, Smartphone, ExternalLink, ArrowLeft, 
  RotateCcw, Eye, EyeOff, Wrench, ShieldCheck, Edit3, 
  Sparkles, Check, ChevronDown, RefreshCw, Home, HeartHandshake,
  Bell, Calendar, Users, History, Image as ImageIcon, Phone
} from 'lucide-react';

const PREVIEW_PAGES = [
  { path: '/', label: 'Home Page', icon: Home, cmsRoute: ADMIN_ROUTES.homepageBuilder, secKey: 'homepage' },
  { path: '/ministries', label: 'Ministries', icon: HeartHandshake, cmsRoute: ADMIN_ROUTES.ministries, secKey: 'ministries' },
  { path: '/announcements', label: 'Announcements', icon: Bell, cmsRoute: ADMIN_ROUTES.announcements, secKey: 'announcements' },
  { path: '/events', label: 'Events', icon: Calendar, cmsRoute: ADMIN_ROUTES.events, secKey: 'events' },
  { path: '/about/priests', label: 'Priests Directory', icon: Users, cmsRoute: ADMIN_ROUTES.priests, secKey: 'priests' },
  { path: '/about/history', label: 'Church History', icon: History, cmsRoute: ADMIN_ROUTES.history, secKey: 'history' },
  { path: '/gallery', label: 'Photo Gallery', icon: ImageIcon, cmsRoute: ADMIN_ROUTES.gallery, secKey: 'gallery' },
  { path: '/contact', label: 'Contact & Schedules', icon: Phone, cmsRoute: ADMIN_ROUTES.contactSettings, secKey: 'contactSettings' },
];

export default function AdminLivePreview() {
  const { settings } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active page path
  const initialPage = searchParams.get('page') || '/';
  const [currentPath, setCurrentPath] = useState(initialPage);
  
  // Viewport mode: 'desktop', 'tablet', 'mobile'
  const [device, setDevice] = useState('desktop');

  // Preview Mode: true = bypass maintenance (see real site), false = simulate public view
  const [bypassMaintenance, setBypassMaintenance] = useState(true);

  // Iframe reload key & loading state
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef(null);

  // Always enable admin preview session on entering preview studio
  useEffect(() => {
    enableAdminPreviewMode();
  }, []);

  // Update query params when path changes
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', currentPath);
      return next;
    }, { replace: true });
  }, [currentPath, setSearchParams]);

  // Current active page configuration
  const activePageConfig = PREVIEW_PAGES.find(p => p.path === currentPath) || {
    path: currentPath,
    label: currentPath === '/' ? 'Home Page' : currentPath,
    icon: Home,
    cmsRoute: ADMIN_ROUTES.homepageBuilder,
    secKey: 'homepage',
  };

  // Maintenance states
  const isOverallMaint = getRawOverallMaintenance(settings);
  const isCurrentSectionMaint = activePageConfig.secKey 
    ? getRawSectionMaintenance(activePageConfig.secKey, settings) 
    : false;

  // Toggle between live bypass and public simulation
  const handleToggleBypass = (newBypass) => {
    setBypassMaintenance(newBypass);
    setAdminPreviewSimulatePublic(!newBypass);
    setIframeLoading(true);
    setIframeKey(k => k + 1);
  };

  // Construct iframe preview URL with query parameters
  const getIframeSrc = () => {
    const separator = currentPath.includes('?') ? '&' : '?';
    if (bypassMaintenance) {
      return `${currentPath}${separator}admin_preview=1&t=${iframeKey}`;
    }
    return `${currentPath}${separator}admin_preview=1&simulate_public=1&t=${iframeKey}`;
  };

  // Device container dimensions
  const getDeviceContainerClass = () => {
    switch (device) {
      case 'mobile':
        return 'w-[390px] h-[820px] max-h-[85vh] rounded-[48px] border-[10px] border-stone-800 shadow-2xl ring-1 ring-stone-700/60';
      case 'tablet':
        return 'w-[768px] h-[920px] max-h-[85vh] rounded-[36px] border-[10px] border-stone-800 shadow-2xl ring-1 ring-stone-700/60';
      case 'desktop':
      default:
        return 'w-full h-full rounded-2xl border border-stone-800/80 shadow-xl';
    }
  };

  return (
    <div className="h-screen w-screen bg-[#080d1a] text-stone-100 flex flex-col overflow-hidden font-sans select-none">
      
      {/* 1. TOP STUDIO CONTROL BAR */}
      <header className="shrink-0 bg-[#060a14] border-b border-stone-800/80 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 z-30 shadow-md">
        
        {/* Left: Brand, Back Button & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ADMIN_ROUTES.base)}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700/60"
            title="Exit Preview and return to CMS Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 font-serif-heading">
                <span>Live Admin Preview Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest font-bold">
                  Bypass Mode
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 hidden sm:block">
              {isOverallMaint || isCurrentSectionMaint ? (
                <span className="text-amber-400 font-semibold">
                  ⚠️ Public maintenance is active. You are viewing the live site because you are an Administrator.
                </span>
              ) : (
                <span>Public site is currently live. Previewing authentic visitor layout.</span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Live Bypass vs Public View Simulator */}
        <div className="flex items-center gap-2 bg-stone-900/90 p-1 rounded-2xl border border-stone-800 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleToggleBypass(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              bypassMaintenance
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="View the real live page with all sections and content rendered (maintenance bypassed)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Admin Live View</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleBypass(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !bypassMaintenance
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Simulate what public visitors currently see (shows maintenance screen if active)"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Public Simulator</span>
          </button>
        </div>

        {/* Right: Device Viewport, Edit Page & External Tab */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Device Viewport Selector */}
          <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                device === 'desktop' ? 'bg-stone-800 text-amber-300' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                device === 'tablet' ? 'bg-stone-800 text-amber-300' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                device === 'mobile' ? 'bg-stone-800 text-amber-300' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Reload Preview */}
          <button
            onClick={() => {
              setIframeLoading(true);
              setIframeKey(k => k + 1);
            }}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-800"
            title="Refresh preview canvas"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${iframeLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Edit in CMS Shortcut */}
          {activePageConfig.cmsRoute && (
            <Link
              to={activePageConfig.cmsRoute}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#800020] hover:bg-[#68001a] text-white text-xs font-bold transition-colors shadow-xs"
              title={`Edit ${activePageConfig.label} in CMS`}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Edit in CMS</span>
            </Link>
          )}

          {/* Open in Standalone Tab */}
          <a
            href={getIframeSrc()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold border border-stone-800 transition-colors"
            title="Open preview in new browser tab"
          >
            <span className="hidden sm:inline">New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* 2. PAGE NAVIGATION TABS RIBBON */}
      <nav className="shrink-0 bg-[#04070e] border-b border-stone-800/60 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 shrink-0 pl-1">
          Jump to:
        </span>
        {PREVIEW_PAGES.map((page) => {
          const PageIcon = page.icon;
          const isActive = currentPath === page.path;
          const pageMaint = page.secKey ? getRawSectionMaintenance(page.secKey, settings) : false;

          return (
            <button
              key={page.path}
              type="button"
              onClick={() => {
                setCurrentPath(page.path);
                setIframeLoading(true);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-900/70 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              <PageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{page.label}</span>
              {(isOverallMaint || pageMaint) && (
                <span
                  title={isOverallMaint ? 'Overall maintenance is active' : `${page.label} is in maintenance`}
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isActive ? 'bg-stone-950' : 'bg-amber-400 animate-ping'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. PREVIEW CANVAS CONTAINER */}
      <main className="flex-1 min-h-0 bg-[#0b1021] p-3 sm:p-6 flex items-center justify-center overflow-auto relative">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Device Wrapper */}
        <div className={`relative transition-all duration-300 flex flex-col overflow-hidden bg-white ${getDeviceContainerClass()}`}>
          
          {/* Tablet/Phone Speaker Notch (For mobile/tablet realistic frames) */}
          {(device === 'mobile' || device === 'tablet') && (
            <div className="h-6 bg-stone-900 shrink-0 flex items-center justify-center relative z-20">
              <div className="w-16 h-3 bg-stone-950 rounded-full" />
            </div>
          )}

          {/* Loading Indicator */}
          {iframeLoading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-10 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-[#800020] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-stone-700">Loading live site preview...</span>
            </div>
          )}

          {/* Interactive Live Website iframe */}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={getIframeSrc()}
            title="Live Site Preview"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-none flex-1 bg-[#FDFCF7]"
          />
        </div>

      </main>

    </div>
  );
}
