import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ChevronUp } from 'lucide-react';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF7] text-stone-900 font-sans selection:bg-[#800020] selection:text-white relative">
      
      {/* Liturgical Reading Progress Indicator (Fixed at Top) */}
      <div 
        className="fixed top-0 left-0 h-[3.5px] bg-gradient-to-r from-[#A81B2B] via-[#C59B3F] to-[#0B3B95] z-50 transition-all duration-150 ease-out shadow-xs pointer-events-none"
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

      {/* Smooth Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white/95 text-[#A81B2B] border-2 border-[#C59B3F]/50 shadow-xl backdrop-blur-xs transition-all duration-300 hover:bg-[#A81B2B] hover:text-white hover:border-[#A81B2B] hover:scale-110 active:scale-95 ${
          showScrollTop 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
      </button>

    </div>
  );
}
