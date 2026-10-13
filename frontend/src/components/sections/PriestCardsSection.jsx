import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Church, ArrowRight, Calendar } from 'lucide-react';

export default function PriestCardsSection({ config = {} }) {
  const {
    heading = "Our Pastoral Shepherds",
    subheading = "Meet the 3 assigned priests dedicated to our pastoral care, sacramental celebrations, and spiritual guidance for this cycle.",
    maxItems = 3
  } = config;

  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriests = async () => {
      try {
        const res = await publicApi.getPriests();
        if (res.data) {
          // Filter to current priests first, then limit
          const current = res.data.filter(p => p.priestStatus === 'CURRENT');
          setPriests(current.length > 0 ? current.slice(0, maxItems) : res.data.slice(0, maxItems));
        }
      } catch (err) {
        console.error('Failed to load priests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPriests();
  }, [maxItems]);

  return (
    <section className="py-20 bg-[#F7F4EB] border-b border-[#C59B3F]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C59B3F]/15 border border-[#C59B3F]/35 text-[#8F6B1E] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Church className="w-3.5 h-3.5 text-[#C59B3F]" />
              <span>Current Set of Priests</span>
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1C1814] tracking-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
                {subheading}
              </p>
            )}
          </div>

          <Link
            to="/about/priests"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#C59B3F]/40 text-xs font-bold text-[#A81B2B] hover:bg-[#A81B2B] hover:text-white hover:border-[#A81B2B] transition-all shadow-xs group whitespace-nowrap uppercase tracking-wider"
          >
            <span>View All Clergy</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-96 animate-pulse border border-[#C59B3F]/20" />
            ))}
          </div>
        ) : priests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#C59B3F]/25 text-stone-500">
            Priest directory information will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {priests.map((p, idx) => (
              <div
                key={p.id}
                className={`bg-white rounded-3xl overflow-hidden border border-[#C59B3F]/25 shadow-xs card-lift animate-fade-in-up stagger-${(idx % 3) + 1} flex flex-col group shimmer-sweep`}
              >
                <div className="h-64 sm:h-72 w-full bg-stone-100 overflow-hidden relative img-zoom-hover">
                  {p.portraitImageUrl ? (
                    <img
                      src={resolveMediaUrl(p.portraitImageUrl)}
                      alt={p.fullName}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#14110E] flex flex-col items-center justify-center p-6 text-white text-center">
                      <div className="w-20 h-20 rounded-full bg-[#C59B3F]/20 border-2 border-[#C59B3F]/40 flex items-center justify-center mb-3">
                        <Church className="w-10 h-10 text-[#DFBE7B]" />
                      </div>
                      <span className="text-xs uppercase font-serif tracking-widest text-[#DFBE7B]">Clergy</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-xs font-bold text-[#A81B2B] shadow-xs border border-[#C59B3F]/20 transition-transform group-hover:scale-105">
                      {p.title || 'Parish Priest'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-heading text-lg font-bold text-[#1C1814] leading-snug group-hover:text-[#A81B2B] transition-colors">
                      {p.fullName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-[#C59B3F]" />
                      <span>Term: {p.serviceStart || ''} {p.serviceEnd ? `– ${p.serviceEnd}` : ''}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal line-clamp-4">
                      {p.biography}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
