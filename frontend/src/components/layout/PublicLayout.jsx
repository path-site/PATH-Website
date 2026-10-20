import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ParishAIAssistant from '../common/ParishAIAssistant';
import OverallMaintenanceScreen from '../common/OverallMaintenanceScreen';
import ParishChurchSplashScreen from '../common/ParishChurchSplashScreen';
import { useTheme } from '../../context/ThemeContext';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import { isOverallMaintenance, isAdminPreviewMode, disableAdminPreviewMode } from '../../config/maintenanceConfig';
import { ChevronUp } from 'lucide-react';

export default function PublicLayout() {
  const { settings, loading } = useTheme();
  const isOverallMaint = isOverallMaintenance(settings);
  const { pathname } = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Track scroll depth and toggle floating scroll-to-top button
  useEffect(() => {
    if (isOverallMaint) return;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowScrollTop(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOverallMaint]);

  // Universal Scroll-Triggered Reveal Animations System for ALL screens
  useEffect(() => {
    if (isOverallMaint || typeof window === 'undefined') return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const initObserver = () => {
      const mainEl = document.querySelector('main');
      if (!mainEl) return;

      // Auto-tag content sections and cards if not explicitly annotated
      const autoElements = mainEl.querySelectorAll(
        'section:not(:first-child), .card-lift, .parchment-card, .parchment-card-hover, [data-scroll-reveal]'
      );
      autoElements.forEach((el) => {
        if (
          !el.classList.contains('scroll-reveal') &&
          !el.classList.contains('scroll-reveal-scale') &&
          !el.classList.contains('scroll-reveal-left') &&
          !el.classList.contains('scroll-reveal-right')
        ) {
          el.classList.add('scroll-reveal');
        }
      });

      const targets = mainEl.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right'
      );

      if (isReducedMotion) {
        targets.forEach((el) => el.classList.add('is-revealed'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.08,
        }
      );

      observerRef.current = observer;

      targets.forEach((el) => {
        if (el.classList.contains('is-revealed')) return;
        const rect = el.getBoundingClientRect();
        // If element is already in initial viewport on page open, reveal immediately
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });
    };

    // Staggered initialization to catch synchronously and asynchronously rendered components
    const timer1 = setTimeout(initObserver, 60);
    const timer2 = setTimeout(initObserver, 350);
    const timer3 = setTimeout(initObserver, 900);

    // Watch for dynamic DOM additions (e.g., API queries populating cards)
    const mutationObserver = new MutationObserver(() => {
      initObserver();
    });

    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mutationObserver.observe(mainContainer, { childList: true, subtree: true });
    }

    // Safety fallback: reveal everything after 2.5s to ensure nothing ever gets hidden
    const safetyTimer = setTimeout(() => {
      document
        .querySelectorAll(
          '.scroll-reveal:not(.is-revealed), .scroll-reveal-scale:not(.is-revealed), .scroll-reveal-left:not(.is-revealed), .scroll-reveal-right:not(.is-revealed)'
        )
        .forEach((el) => el.classList.add('is-revealed'));
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(safetyTimer);
      mutationObserver.disconnect();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pathname, isOverallMaint]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Content to display based on maintenance & loading status
  const renderContent = () => {
    if (isOverallMaint) {
      return <OverallMaintenanceScreen />;
    }

    if (loading) {
      return <div className="min-h-screen bg-[#020914]" />;
    }

    const isAdminPreview = isAdminPreviewMode();
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    return (
      <div className="min-h-screen flex flex-col bg-[#FDFCF7] text-stone-900 font-sans selection:bg-[#800020] selection:text-white relative">
        {/* Floating Standalone Admin Preview Top Bar (Visible when browsing site directly in preview mode) */}
        {isAdminPreview && !isInIframe && (
          <aside aria-label="Admin Preview Mode" className="sticky top-0 z-[100] bg-gradient-to-r from-[#071838] via-[#0D2556] to-[#071838] text-white border-b border-amber-400/50 px-4 py-2 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold text-amber-300 font-serif-heading text-sm">
                  ADMIN LIVE PREVIEW MODE
                </span>
                <span className="text-stone-300 hidden md:inline">
                  • Viewing live site as Administrator. Public visitors see maintenance shield.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={ADMIN_ROUTES.preview}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-colors"
                >
                  Open Studio
                </Link>
                <Link
                  to={ADMIN_ROUTES.base}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-colors"
                >
                  CMS Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    disableAdminPreviewMode();
                    window.location.href = '/';
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-semibold border border-rose-800/60 transition-colors cursor-pointer"
                >
                  Exit Preview
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Liturgical Reading Progress Indicator (Fixed at Top) */}
        <div 
          className={`fixed left-0 h-[3px] bg-gradient-to-r from-[#A81B2B] via-[#C59B3F] to-[#0B3B95] z-[60] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(197,155,63,0.7)] pointer-events-none ${
            isAdminPreview && !isInIframe ? 'top-[41px]' : 'top-0'
          }`}
          style={{ width: `${scrollProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin="0"
          aria-valuemax="100"
        />

        <Navbar />

        {/* Main page wrapper with smooth entrance animation on navigation */}
        <main key={pathname} className="flex-1 animate-page-enter">
          <Outlet />
        </main>

        <Footer />

        {/* Smooth Floating Scroll to Top Button (Positioned above AI Assistant) */}
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className={`fixed bottom-20 right-7 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-white/95 text-stone-700 border border-stone-200 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-[#800020] hover:text-white hover:border-[#800020] hover:scale-105 active:scale-95 group ${
            showScrollTop 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
        </button>

        {/* Floating Parish AI Agent at bottom right */}
        <ParishAIAssistant />
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {!splashDone && (
        <ParishChurchSplashScreen
          isReady={!loading}
          onComplete={() => setSplashDone(true)}
        />
      )}
    </>
  );
}
