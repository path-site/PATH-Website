import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import SectionRenderer from '../../components/sections/SectionRenderer';
import PublicMaintenanceNotice, { useSectionMaintenance } from '../../components/common/PublicMaintenanceNotice';
import ParishChurchOutlineIcon from '../../components/common/ParishChurchOutlineIcon';
import HomePageSkeleton from '../../components/common/HomePageSkeleton';
import { 
  getCachedHomeSections, 
  setCachedHomeSections, 
  DEFAULT_HOME_SECTIONS 
} from '../../utils/homeCache';

export default function HomePage() {
  const isMaintenance = useSectionMaintenance('homepage');
  
  // Synchronously initialize with cached sections to completely eliminate loading screen when returning to Home
  const cached = getCachedHomeSections();
  const [sections, setSections] = useState(() => (Array.isArray(cached) && cached.length > 0 ? cached : []));
  const [loading, setLoading] = useState(() => !(Array.isArray(cached) && cached.length > 0));

  useEffect(() => {
    let isSubscribed = true;

    const fetchHome = async (showLoadingIfEmpty = false) => {
      if (showLoadingIfEmpty && (!sections || sections.length === 0)) {
        setLoading(true);
      }

      try {
        const res = await publicApi.getPage('home');
        if (!isSubscribed) return;

        if (res?.data?.sections && Array.isArray(res.data.sections) && res.data.sections.length > 0) {
          setSections(res.data.sections);
          setCachedHomeSections(res.data.sections);
        } else if (!cached || cached.length === 0) {
          // If server returns empty sections and no cache exists, use high-quality default fallback sections
          setSections(DEFAULT_HOME_SECTIONS);
          setCachedHomeSections(DEFAULT_HOME_SECTIONS);
        }
      } catch (err) {
        console.warn('Failed to load homepage data, checking fallback', err);
        if (!isSubscribed) return;
        // If error and we have no sections at all, fallback to default sections so user is never stranded
        setSections((prev) => (prev && prev.length > 0 ? prev : DEFAULT_HOME_SECTIONS));
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchHome();

    // Listen for admin cache invalidation event (e.g. from HomepageBuilder)
    const handleCacheInvalidated = () => {
      fetchHome(true);
    };

    window.addEventListener('path:home-cache-invalidated', handleCacheInvalidated);

    return () => {
      isSubscribed = false;
      window.removeEventListener('path:home-cache-invalidated', handleCacheInvalidated);
    };
  }, []);

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="w-16 h-16 rounded-full bg-[#6B1D2F] text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-md">
            <ParishChurchOutlineIcon className="w-10 h-auto text-amber-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
            Archdiocese of Cebu
          </span>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900">
            Parish of the Alliance of the Two Hearts
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            J. Fortich St., Banawa, Cebu City
          </p>
        </div>

        <PublicMaintenanceNotice sectionKey="homepage" forceShow />
      </div>
    );
  }

  // During initial/cold load, display the magnificent church-branded skeleton layout
  if (loading && (!sections || sections.length === 0)) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen animate-fadeIn">
      {sections.map((section) => (
        <SectionRenderer key={section.id || section.sectionType} section={section} />
      ))}
    </div>
  );
}
