import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import SectionRenderer from '../../components/sections/SectionRenderer';
import PublicMaintenanceNotice, { useSectionMaintenance } from '../../components/common/PublicMaintenanceNotice';
import { ArrowLeft } from 'lucide-react';
import ParishChurchOutlineIcon from '../../components/common/ParishChurchOutlineIcon';

export default function CustomPageView() {
  const isMaintenance = useSectionMaintenance('pages');
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    setLoading(true);
    setError(false);
    try {
      const pageRes = await publicApi.getPage(slug);
      const payload = pageRes?.data || pageRes;
      const pageData = payload?.page || (payload?.title ? payload : null);
      const sectionsData = payload?.sections || [];

      if (pageData && pageData.title) {
        setPage(pageData);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load page:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-[#FCFBF9] py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn select-none">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-400/10 flex items-center justify-center mb-3">
            <ParishChurchOutlineIcon className="w-9 h-auto text-amber-500/80 animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-stone-200/80 rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-96 max-w-full bg-stone-200/60 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4 max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="h-4 w-full bg-stone-200/70 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-stone-200/70 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-stone-200/70 rounded animate-pulse" />
          <div className="h-32 w-full bg-stone-100 rounded-2xl animate-pulse mt-6" />
        </div>
      </div>
    );
  }

  const formattedSlugTitle = (slug || 'Parish Section')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (error || !page) {
    return (
      <div>
        {/* Dynamic Branded Header Banner */}
        <div className="bg-[#191516] text-white py-14 sm:py-16 px-4 text-center relative overflow-hidden border-b-2 border-amber-600/30">
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-400/90 font-bold block mb-2">
              Parish of the Alliance of the Two Hearts • Banawa, Cebu City
            </span>
            <h1 className="text-3xl md:text-5xl font-serif-heading font-bold text-amber-50">
              {formattedSlugTitle}
            </h1>
            <p className="text-stone-300 max-w-xl mx-auto mt-3 text-sm md:text-base">
              Spiritual life, liturgical celebrations, and pastoral resources of our parish family.
            </p>
          </div>
        </div>

        {/* Courteous Preparation Notice Card */}
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200/90 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <ParishChurchOutlineIcon className="w-10 h-auto text-[#800020]" />
            </div>
            <h2 className="font-serif-heading text-2xl font-bold text-stone-800 mb-3">
              {formattedSlugTitle} Section
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mb-8 leading-relaxed max-w-md mx-auto">
              This page is currently being curated by the parish pastoral office. You may manage or publish custom content for this section through the Parish Admin Page Management.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#800020] text-white text-xs sm:text-sm font-semibold hover:bg-[#68001a] transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Homepage</span>
              </Link>
              <Link
                to="/contact#mass-schedule"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold hover:bg-amber-100 transition-all shadow-xs"
              >
                <span>Mass & Confession Schedules</span>
              </Link>
              <Link
                to="/announcements"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-200 transition-all"
              >
                <span>Announcements</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header Banner */}
      <div className="bg-[#191516] text-white py-16 px-4 text-center relative overflow-hidden border-b-2 border-amber-600/30">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-xs uppercase tracking-widest text-amber-400/90 font-bold block mb-2">
            Parish of the Alliance of the Two Hearts
          </span>
          <h1 className="text-3xl md:text-5xl font-serif-heading font-bold">
            {page.title}
          </h1>
          {page.seoDescription && (
            <p className="text-stone-300 max-w-2xl mx-auto mt-3 text-sm md:text-base">
              {page.seoDescription}
            </p>
          )}
        </div>
      </div>

      {/* STRICT MAINTENANCE MODE CHECK: If ON, strictly hide page content sections */}
      {isMaintenance ? (
        <div className="py-12 px-4 max-w-4xl mx-auto">
          <PublicMaintenanceNotice sectionKey="pages" forceShow />
        </div>
      ) : sections.length > 0 ? (
        <div className="space-y-0">
          {sections.map((section) => (
            <SectionRenderer key={section.id || section.title || section.sectionType} section={section} />
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200/80 shadow-xs max-w-2xl mx-auto">
            <h2 className="font-serif-heading text-2xl font-bold text-stone-800 mb-3">{page.title}</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              {page.seoDescription || "Welcome to this parish page. Content and sections can be configured through the Parish Admin Page Management."}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#800020] text-white font-medium hover:bg-[#68001a] transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
