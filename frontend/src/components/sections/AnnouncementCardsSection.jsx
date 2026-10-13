import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

export default function AnnouncementCardsSection({ config = {} }) {
  const {
    heading = "Official Parish Announcements",
    subheading = "Stay informed on liturgical celebrations, pastoral advisories, and community news.",
    maxItems = 3,
    showViewAll = true
  } = config;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await publicApi.getAnnouncements();
        if (res.data) {
          setAnnouncements(res.data.slice(0, maxItems));
        }
      } catch (err) {
        console.error('Failed to load announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [maxItems]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="py-20 bg-stone-100/50 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B1D2F]/10 text-[#6B1D2F] text-xs font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Announcements</span>
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-2xl">
                {subheading}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link
              to="/announcements"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B1D2F] hover:text-[#541624] group whitespace-nowrap"
            >
              <span>View All Announcements</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500">
            No published announcements at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((ann, idx) => (
              <article
                key={ann.id}
                className={`group flex flex-col bg-[#FAF7F0] rounded-3xl overflow-hidden border border-[#C59B3F]/30 shadow-xs card-lift animate-fade-in-up stagger-${(idx % 4) + 1} shimmer-sweep`}
              >
                {/* Image with zoom on hover */}
                <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden img-zoom-hover">
                  {ann.featuredImageUrl ? (
                    <img
                      src={ann.featuredImageUrl}
                      alt={ann.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#800020] via-[#541624] to-[#1C1814] flex flex-col items-center justify-center p-6 text-white text-center">
                      <BookOpen className="w-8 h-8 text-[#DFBE7B] mb-2 opacity-85" />
                      <span className="text-[11px] uppercase font-serif tracking-widest text-[#DFBE7B]">Parish Bulletin</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-[#FAF7F0]/95 border border-[#C59B3F]/40 backdrop-blur-xs text-xs font-bold text-amber-900 shadow-xs transition-transform group-hover:scale-105">
                      {ann.category || 'Parish Bulletin'}
                    </span>
                  </div>
                </div>

                {/* Content with Numbered Gold Badge and Vertical Gold Accent Border */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex items-start gap-4">
                    {/* Golden Numeral Circle */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E2C384] to-[#C59B3F] text-stone-900 font-extrabold flex items-center justify-center shrink-0 shadow-xs text-base">
                      {idx + 1}
                    </div>

                    {/* Title with Gold Accent Rule */}
                    <div className="border-l-3 border-[#C59B3F] pl-3.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>{formatDate(ann.publishedAt || ann.createdAt)}</span>
                      </div>
                      <h3 className="font-serif-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#A81B2B] transition-colors line-clamp-2 leading-snug uppercase tracking-wide">
                        <Link to={`/announcements/${ann.slug}`}>
                          {ann.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-stone-600 line-clamp-3 leading-relaxed">
                        {ann.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#C59B3F]/20 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-400">#PATHway</span>
                    <Link
                      to={`/announcements/${ann.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A81B2B] group-hover:text-[#8E1227] tracking-wider uppercase"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
