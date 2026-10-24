import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { useTheme, resolveContactNumbers } from '../../context/ThemeContext';
import { isAdminPreviewMode, resolvePreviewPath } from '../../config/maintenanceConfig';
import { 
  Menu, X, ChevronDown, Church, Heart, BookOpen, Clock, 
  Users, Calendar, Image as ImageIcon, Mail, Phone, Smartphone, ArrowRight,
  Sparkles
} from 'lucide-react';

const getDynamicIcon = (label = '') => {
  const l = (label || '').toLowerCase();
  if (l.includes('prayer') || l.includes('devotion') || l.includes('rosary') || l.includes('novena')) return Sparkles;
  if (l.includes('mission') || l.includes('vision') || l.includes('heart') || l.includes('charity') || l.includes('love')) return Heart;
  if (l.includes('history') || l.includes('schedule') || l.includes('time') || l.includes('clock')) return Clock;
  if (l.includes('priest') || l.includes('clergy') || l.includes('pastor') || l.includes('shepherd')) return Users;
  if (l.includes('ministr') || l.includes('apostolate') || l.includes('servant') || l.includes('server') || l.includes('youth')) return Users;
  if (l.includes('announcement') || l.includes('news') || l.includes('bulletin') || l.includes('reading') || l.includes('scripture')) return BookOpen;
  if (l.includes('event') || l.includes('calendar') || l.includes('feast') || l.includes('fiesta')) return Calendar;
  if (l.includes('gallery') || l.includes('photo') || l.includes('image') || l.includes('album')) return ImageIcon;
  if (l.includes('contact') || l.includes('inquir') || l.includes('reach') || l.includes('office')) return Mail;
  return Church;
};

export default function Navbar() {
  const { settings } = useTheme();
  const { telephone, mobile } = resolveContactNumbers(settings);
  const location = useLocation();
  const [navItems, setNavItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await publicApi.getNavigation();
        if (res.data) {
          setNavItems(res.data);
        }
      } catch (err) {
        console.error('Failed to load navigation', err);
      }
    };
    fetchNav();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleMouseEnter = (itemId) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(itemId);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180); // gentle grace period
  };

  const toggleMobileSubmenu = (itemId) => {
    setMobileExpanded(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isPreview = isAdminPreviewMode() || location.pathname.startsWith('/admin/preview');

  const getNavUrl = (targetPath) => {
    if (!targetPath) return isPreview ? '/admin/preview' : '/';
    const trimmed = String(targetPath).trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('tel:') ||
      trimmed.startsWith('#')
    ) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (!isPreview) return cleanPath;
    return resolvePreviewPath(cleanPath);
  };

  const isCurrentActive = (path) => {
    if (!path) return false;
    const trimmed = String(path).trim();
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const resolved = isPreview ? resolvePreviewPath(cleanPath) : cleanPath;
    if (cleanPath === '/' || resolved === '/admin/preview') {
      return isPreview ? location.pathname === '/admin/preview' : location.pathname === '/';
    }
    return (
      location.pathname === resolved ||
      location.pathname.startsWith(resolved + '/') ||
      location.pathname === cleanPath ||
      location.pathname.startsWith(cleanPath + '/')
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs transition-all">
      {/* Main Navbar */}
      <div className="bg-[#FDFCF9]/95 backdrop-blur-md border-b-2 border-[#C59B3F]/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[4.5rem] sm:min-h-[5rem] py-1.5 sm:py-2">
            
            {/* Left: Parish Official Logo and Name */}
            <Link to={isPreview ? "/admin/preview" : "/"} className="flex items-center gap-2 sm:gap-3 group text-left min-w-0 shrink mr-1 sm:mr-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow-md ring-2 ring-[#C59B3F] group-hover:ring-[#A81B2B] transition-all flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="/logo.png" 
                  alt="PATH Parish Official Seal" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif-heading text-xs sm:text-sm lg:text-xs xl:text-base 2xl:text-lg font-bold tracking-tight text-[#1C1814] leading-tight group-hover:text-[#A81B2B] transition-colors truncate">
                  PARISH OF THE ALLIANCE OF THE TWO HEARTS
                </span>
                <span className="text-[9px] sm:text-[10px] xl:text-xs font-bold uppercase tracking-wider text-amber-800/90 mt-0.5 flex items-center gap-1.5 truncate">
                  <span>J. FORTICH ST., BANAWA, CEBU CITY</span>
                </span>
              </div>
            </Link>

            {/* Right: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 shrink-0 flex-nowrap" aria-label="Main Navigation">
              {navItems.map((item) => {
                const children = Array.isArray(item.children) ? item.children : [];
                const hasChildren = children.length > 0;
                const isDropdown = hasChildren || item.destinationType === 'DROPDOWN_PARENT';
                const isDropdownOpen = activeDropdown === item.id;
                const isActive = isCurrentActive(item.targetPath || '');

                if (isDropdown) {
                  return (
                    <div
                      key={item.id}
                      className="relative shrink-0"
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen}
                        className={`inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C59B3F] whitespace-nowrap cursor-pointer ${
                          isActive || isDropdownOpen
                            ? 'text-[#A81B2B] bg-[#C59B3F]/15 font-bold'
                            : 'text-[#1C1814] hover:text-[#A81B2B] hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-[#C59B3F]' : 'text-stone-400'
                          }`}
                        />
                      </button>

                      {/* Desktop Dropdown Menu with animation */}
                      {isDropdownOpen && (
                        <div
                          className="absolute right-0 mt-2 min-w-64 max-w-xs rounded-2xl bg-[#FDFCF9] p-2.5 shadow-2xl ring-1 ring-black/5 border-t-4 border-t-[#C59B3F] border border-[#C59B3F]/30 animate-in fade-in slide-in-from-top-2 duration-150 z-50 origin-top-right"
                          onMouseEnter={() => handleMouseEnter(item.id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {hasChildren ? (
                            <div className="space-y-1.5">
                              {children.map((subItem) => {
                                const SubIcon = getDynamicIcon(subItem.label);
                                const subTarget = getNavUrl(subItem.targetPath);
                                const isSubActive = isCurrentActive(subItem.targetPath);
                                return (
                                  <Link
                                    key={subItem.id}
                                    to={subTarget}
                                    target={subItem.openInNewTab ? '_blank' : '_self'}
                                    rel={subItem.openInNewTab ? 'noopener noreferrer' : ''}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs xl:text-sm font-medium transition-all duration-150 ${
                                      isSubActive
                                        ? 'bg-[#800020] text-white shadow-xs font-semibold'
                                        : 'text-[#1C1814] hover:bg-[#F5EEDC] hover:text-[#800020]'
                                    }`}
                                  >
                                    <div className={`w-7 h-7 xl:w-8 xl:h-8 rounded-full flex items-center justify-center shrink-0 ${
                                      isSubActive ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-[#DFBE7B] to-[#C59B3F] text-stone-900 shadow-xs'
                                    }`}>
                                      <SubIcon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                                    </div>
                                    <span className="font-semibold truncate">{subItem.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-center">
                              <p className="text-xs text-stone-500 italic">Sub-links coming soon</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // Normal single link
                return (
                  <Link
                    key={item.id}
                    to={item.destinationType === 'EXTERNAL' ? item.externalUrl : getNavUrl(item.targetPath || '/')}
                    target={item.openInNewTab ? '_blank' : '_self'}
                    rel={item.openInNewTab ? 'noopener noreferrer' : ''}
                    className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-[#A81B2B] bg-[#C59B3F]/15 border-b-2 border-[#C59B3F] font-bold'
                        : 'text-[#1C1814] hover:text-[#A81B2B] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#6B1D2F]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#C59B3F]/30 bg-[#FDFCF9]/98 backdrop-blur-xl px-4 pt-4 pb-7 shadow-2xl animate-in slide-in-from-top-3 duration-200 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const children = Array.isArray(item.children) ? item.children : [];
              const hasChildren = children.length > 0;
              const isDropdown = hasChildren || item.destinationType === 'DROPDOWN_PARENT';
              const isExpanded = mobileExpanded[item.id];
              const isActive = isCurrentActive(item.targetPath || '');

              if (isDropdown) {
                return (
                  <div key={item.id} className="rounded-xl overflow-hidden border border-stone-200/60 bg-white/70 shadow-xs mb-1.5">
                    <button
                      type="button"
                      onClick={() => toggleMobileSubmenu(item.id)}
                      className="w-full flex items-center justify-between py-3 px-3.5 text-sm font-bold text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <span className="font-serif-heading">{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 text-[#C59B3F] ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-[#FAF7F0] border-t border-stone-100">
                        {hasChildren ? (
                          children.map((subItem) => {
                            const SubIcon = getDynamicIcon(subItem.label);
                            const subTarget = getNavUrl(subItem.targetPath);
                            const isSubActive = isCurrentActive(subItem.targetPath);
                            return (
                              <Link
                                key={subItem.id}
                                to={subTarget}
                                target={subItem.openInNewTab ? '_blank' : '_self'}
                                rel={subItem.openInNewTab ? 'noopener noreferrer' : ''}
                                className={`flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                                  isSubActive
                                    ? 'bg-[#800020] text-white shadow-xs'
                                    : 'text-stone-700 hover:text-[#800020] hover:bg-white'
                                }`}
                              >
                                <SubIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })
                        ) : (
                          <p className="px-3 py-2 text-xs text-stone-400 italic">No sub-items added yet</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.destinationType === 'EXTERNAL' ? item.externalUrl : getNavUrl(item.targetPath || '/')}
                  target={item.openInNewTab ? '_blank' : '_self'}
                  rel={item.openInNewTab ? 'noopener noreferrer' : ''}
                  className={`block py-2.5 px-3.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#800020] text-white shadow-xs font-bold'
                      : 'text-stone-800 hover:bg-stone-100 hover:text-[#800020]'
                  }`}
                >
                  <span className="font-serif-heading">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Action Button for Mobile Drawer */}
          <div className="mt-4 pt-3 border-t border-stone-200/80">
            <Link
              to={isPreview ? "/admin/preview/contact#mass-schedule" : "/contact#mass-schedule"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#DFBE7B] via-[#C59B3F] to-[#A27B27] text-stone-900 text-xs font-extrabold uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition-all"
            >
              <Calendar className="w-4 h-4 text-stone-900" />
              <span>Mass Schedules & Confessions</span>
            </Link>
          </div>

          {/* Direct Tap-to-Contact Bar */}
          <div className="mt-4 pt-3 border-t border-stone-200/60 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Parish Office & Inquiries</span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {telephone && (
                <a
                  href={`tel:${telephone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">Tel: {telephone}</span>
                </a>
              )}
              {mobile && (
                <a
                  href={`tel:${mobile.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">Mobile: {mobile}</span>
                </a>
              )}
              <a
                href={`mailto:${settings.email || 'pathsoccomit@gmail.com'}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="truncate">{settings.email || 'pathsoccomit@gmail.com'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
