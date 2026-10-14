import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Search, Calendar, ArrowRight, BookOpen, Tag } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Liturgy', 'Parish Life', 'Youth', 'Sacraments', 'Community'];

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await publicApi.getAnnouncements(category, searchTerm);
      if (res.data) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B1D2F] block mb-3">
            Official Advisories
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Parish Announcements
          </h1>
          <p className="mt-3 text-stone-600 text-base sm:text-lg">
            Liturgical schedules, parish pastoral notices, and official news from the Parish of the Alliance of the Two Hearts.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/80 shadow-xs mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-all ${
                    category === cat
                      ? 'bg-[#6B1D2F] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearch} className="w-full md:w-80 flex items-center relative">
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D2F] focus:border-transparent bg-stone-50/50"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
              <button
                type="submit"
                className="sr-only"
              >
                Search
              </button>
            </form>

          </div>
        </div>

        {/* Announcements List / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-700">No Announcements Found</h3>
            <p className="text-sm text-stone-500 mt-1">
              Try choosing a different category or clearing your search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-stagger">
            {announcements.map((ann, idx) => (
              <article
                key={ann.id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs card-lift scroll-reveal shimmer-sweep"
              >
                <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden img-zoom-hover">
                  {ann.featuredImageUrl ? (
                    <img
                      src={resolveMediaUrl(ann.featuredImageUrl)}
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
                    <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-xs font-bold text-stone-800 shadow-xs flex items-center gap-1 transition-transform group-hover:scale-105">
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{ann.category || 'General'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mb-2.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {formatDate(ann.publishedAt || ann.createdAt)}
                      </span>
                    </div>

                    <h2 className="font-serif-heading text-xl font-bold text-stone-900 group-hover:text-[#6B1D2F] transition-colors line-clamp-2 leading-snug">
                      <Link to={`/announcements/${ann.slug}`}>
                        {ann.title}
                      </Link>
                    </h2>

                    <p className="mt-3 text-sm text-stone-600 line-clamp-3 leading-relaxed">
                      {ann.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-stone-100">
                    <Link
                      to={`/announcements/${ann.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B1D2F] group-hover:text-[#541624] tracking-wider uppercase"
                    >
                      <span>Read Full Notice</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
