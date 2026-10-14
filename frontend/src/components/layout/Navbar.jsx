import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu, X, ChevronDown, Church, Heart, BookOpen, Clock, 
  Users, Calendar, Image as ImageIcon, Mail, Shield
} from 'lucide-react';

const iconMap = {
  'Mission & Vision': Heart,
  'History of the Church': Clock,
  'Priests': Users,
  'Ministries': Users,
  'Announcements': BookOpen,
  'Events': Calendar,
  'Gallery': ImageIcon,
  'Contact': Mail,
};

export default function Navbar() {
  const { settings } = useTheme();
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

  const isCurrentActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs transition-all">
      {/* Main Navbar */}
      <div className="bg-[#FDFCF9]/95 backdrop-blur-md border-b-2 border-[#C59B3F]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Parish Official Logo and Name */}
            <Link to="/" className="flex items-center gap-3.5 group text-left">
              <div className="w-13 h-13 rounded-full bg-white p-0.5 shadow-md ring-2 ring-[#C59B3F] group-hover:ring-[#A81B2B] transition-all flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="/logo.png" 
                  alt="PATH Parish Official Seal" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-heading text-lg sm:text-xl font-bold tracking-tight text-[#1C1814] leading-tight group-hover:text-[#A81B2B] transition-colors">
                  PARISH OF THE ALLIANCE OF THE TWO HEARTS
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800/90 mt-0.5 flex items-center gap-1.5">
                  <span>J. FORTICH ST., BANAWA, CEBU CITY</span>
                </span>
              </div>
            </Link>

            {/* Right: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isDropdownOpen = activeDropdown === item.id;
                const isActive = isCurrentActive(item.targetPath || '');

                if (hasChildren || item.destinationType === 'DROPDOWN_PARENT') {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C59B3F] ${
                          isActive || isDropdownOpen
                            ? 'text-[#A81B2B] bg-[#C59B3F]/15 font-bold'
                            : 'text-[#1C1814] hover:text-[#A81B2B] hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-[#C59B3F]' : 'text-stone-400'
                          }`}
                        />
                      </button>

                      {/* Desktop Dropdown Menu with animation */}
                      {isDropdownOpen && (
                        <div
                          className="absolute left-0 mt-1.5 w-68 rounded-2xl bg-[#FDFCF9] p-2 shadow-xl ring-1 ring-black/5 border-t-3 border-t-[#C59B3F] border border-[#C59B3F]/30 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                          onMouseEnter={() => handleMouseEnter(item.id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="space-y-1">
                            {item.children.map((subItem) => {
                              const SubIcon = iconMap[subItem.label] || Church;
                              const isSubActive = location.pathname === subItem.targetPath;
                              return (
                                <Link
                                  key={subItem.id}
                                  to={subItem.targetPath}
                                  target={subItem.openInNewTab ? '_blank' : '_self'}
                                  rel={subItem.openInNewTab ? 'noopener noreferrer' : ''}
                                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    isSubActive
                                      ? 'bg-[#A81B2B] text-white shadow-xs font-semibold'
                                      : 'text-[#1C1814] hover:bg-[#F5EEDC] hover:text-[#A81B2B]'
                                  }`}
                                >
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    isSubActive ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-[#DFBE7B] to-[#C59B3F] text-stone-900 shadow-xs'
                                  }`}>
                                    <SubIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-semibold">{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Normal single link
                return (
                  <Link
                    key={item.id}
                    to={item.destinationType === 'EXTERNAL' ? item.externalUrl : (item.targetPath || '/')}
                    target={item.openInNewTab ? '_blank' : '_self'}
                    rel={item.openInNewTab ? 'noopener noreferrer' : ''}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-[#A81B2B] bg-[#C59B3F]/15 border-b-2 border-[#C59B3F]'
                        : 'text-[#1C1814] hover:text-[#A81B2B] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

            {/* Quick Admin Portal Link */}
            <Link
              to="/admin"
              title="Admin Portal"
              className="ml-3 p-2 rounded-lg text-stone-400 hover:text-[#6B1D2F] hover:bg-stone-50 transition-colors"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/admin"
              className="p-2 text-stone-400 hover:text-[#6B1D2F]"
              title="Admin"
            >
              <Shield className="w-5 h-5" />
            </Link>
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
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = mobileExpanded[item.id];
              const isActive = isCurrentActive(item.targetPath || '');

              if (hasChildren || item.destinationType === 'DROPDOWN_PARENT') {
                return (
                  <div key={item.id} className="border-b border-stone-100 last:border-b-0 py-1">
                    <button
                      type="button"
                      onClick={() => toggleMobileSubmenu(item.id)}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-base font-semibold text-stone-800 hover:bg-stone-50"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 text-stone-500 ${
                          isExpanded ? 'rotate-180 text-[#0B3B95]' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-[#D4AF37] ml-3 mt-1">
                        {item.children.map((subItem) => {
                          const SubIcon = iconMap[subItem.label] || Church;
                          const isSubActive = location.pathname === subItem.targetPath;
                          return (
                            <Link
                              key={subItem.id}
                              to={subItem.targetPath}
                              target={subItem.openInNewTab ? '_blank' : '_self'}
                              rel={subItem.openInNewTab ? 'noopener noreferrer' : ''}
                              className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                isSubActive
                                  ? 'bg-[#C41E3A] text-white font-semibold'
                                  : 'text-stone-700 hover:text-[#0B3B95] hover:bg-stone-100'
                              }`}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.destinationType === 'EXTERNAL' ? item.externalUrl : (item.targetPath || '/')}
                  target={item.openInNewTab ? '_blank' : '_self'}
                  rel={item.openInNewTab ? 'noopener noreferrer' : ''}
                  className={`block py-2.5 px-3 rounded-lg text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#C41E3A]/10 text-[#C41E3A]'
                      : 'text-stone-800 hover:bg-stone-50 hover:text-[#0B3B95]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col gap-2">
            <div className="text-xs text-stone-500">
              <p className="font-semibold text-stone-700">Parish Office & Inquiries:</p>
              <p>{settings.phone}</p>
              <p>{settings.email}</p>
            </div>
            <Link
              to="/admin/login"
              className="mt-2 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
