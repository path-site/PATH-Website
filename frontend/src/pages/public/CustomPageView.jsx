import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import SectionRenderer from '../../components/sections/SectionRenderer';
import { Church, ArrowLeft } from 'lucide-react';

export default function CustomPageView() {
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
      if (pageRes.data?.success && pageRes.data.data) {
        setPage(pageRes.data.data);
        const sectionsRes = await publicApi.getPageSections(slug);
        if (sectionsRes.data?.success) {
          setSections(sectionsRes.data.data || []);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 font-serif-heading">Loading page content...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="py-28 px-4 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
          <Church className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif-heading font-bold text-stone-800 mb-2">Page Not Found</h1>
        <p className="text-stone-600 mb-6">
          The requested parish page could not be found or has not been published yet.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#800020] text-white font-medium hover:bg-[#68001a] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
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

      {/* Sections rendering or fallback content */}
      {sections.length > 0 ? (
        <SectionRenderer sections={sections} />
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-16 prose prose-stone">
          <p className="text-stone-500 italic text-center">
            This page has no configured content sections yet. Administrators can add sections via the Page Management dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
