import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ChevronUp } from 'lucide-react';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Track scroll depth and toggle floating scroll-to-top button
  useEffect(() => {
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
  }, []);

  // Universal Scroll-Triggered Reveal Animations System for ALL screens
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF7] text-stone-900 font-sans selection:bg-[#800020] selection:text-white relative">
      
      {/* Liturgical Reading Progress Indicator (Fixed at Top) */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#A81B2B] via-[#C59B3F] to-[#0B3B95] z-[60] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(197,155,63,0.7)] pointer-events-none"
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

      {/* Smooth Floating Scroll to Top Button with Micro-Animation */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-white/95 text-[#A81B2B] border-2 border-[#C59B3F]/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-[#A81B2B] hover:text-white hover:border-[#A81B2B] hover:scale-110 active:scale-95 group ${
          showScrollTop 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
      </button>

    </div>
  );
}
