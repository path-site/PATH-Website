import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { sortPriests, isPriestDeceased } from '../../utils/priestSorter';
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
          const sorted = sortPriests(res.data);
          const current = sorted.filter(p => p.priestStatus === 'CURRENT');
          setPriests(current.length > 0 ? current.slice(0, maxItems) : sorted.slice(0, maxItems));
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
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 scroll-reveal">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8F6B1E] block mb-2.5">
              Current Set of Priests
            </span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-stagger">
            {priests.map((p, idx) => {
              const isDeceased = isPriestDeceased(p);
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl overflow-hidden border shadow-xs card-lift scroll-reveal-scale flex flex-col group shimmer-sweep ${
                    isDeceased ? 'border-stone-400/80 ring-1 ring-stone-900/10' : 'border-[#C59B3F]/25'
                  }`}
                >
                  <div className="h-64 sm:h-72 w-full bg-stone-100 overflow-hidden relative img-zoom-hover">
                    {isDeceased && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/95 text-amber-300 border border-amber-400/40 text-xs font-serif font-bold shadow-md backdrop-blur-xs">
                          <span className="text-amber-400">✝</span> In Memoriam
                        </span>
                      </div>
                    )}
                    {p.portraitImageUrl ? (
                      <img
                        src={resolveMediaUrl(p.portraitImageUrl)}
                        alt={p.fullName}
                        className={`w-full h-full object-cover object-top transition-all duration-500 ${
                          isDeceased ? 'filter grayscale-[25%] contrast-[1.05] group-hover:grayscale-0' : ''
                        }`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#14110E] flex flex-col items-center justify-center p-6 text-white text-center">
                        <div className="w-20 h-20 rounded-full bg-[#C59B3F]/20 border-2 border-[#C59B3F]/40 flex items-center justify-center mb-3">
                          {isDeceased ? (
                            <span className="text-3xl text-[#DFBE7B] font-serif font-bold">✝</span>
                          ) : (
                            <Church className="w-10 h-10 text-[#DFBE7B]" />
                          )}
                        </div>
                        <span className="text-xs uppercase font-serif tracking-widest text-[#DFBE7B]">
                          {isDeceased ? 'In Memoriam' : 'Clergy'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className={`inline-block px-3 py-1 rounded-full backdrop-blur-xs text-xs font-bold shadow-xs transition-transform group-hover:scale-105 ${
                        p.title?.toLowerCase().includes('moderator') || p.title?.toLowerCase().includes('vicar')
                          ? 'bg-[#C59B3F] text-[#1C1814] border border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                          : 'bg-white/95 text-[#A81B2B] border border-[#C59B3F]/20'
                      }`}>
                        {p.title || 'Parish Priest'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-serif-heading text-lg font-bold text-[#1C1814] leading-snug group-hover:text-[#A81B2B] transition-colors min-h-[3.25rem] flex items-start gap-1.5">
                      {isDeceased && <span className="text-stone-500 font-serif font-bold shrink-0" title="Deceased">†</span>}
                      <span>{p.fullName}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1 mb-2 h-5">
                      <Calendar className="w-3.5 h-3.5 text-[#C59B3F] shrink-0" />
                      <span>Term: {p.serviceStart || ''} {p.serviceEnd ? `– ${p.serviceEnd}` : ''}</span>
                    </div>
                    {isDeceased && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium mb-3 bg-stone-100/90 px-2.5 py-1 rounded-lg border border-stone-200">
                        <span className="text-amber-600 font-bold">✝</span>
                        <span>Called to rest {p.dateOfDeath ? `in ${p.dateOfDeath}` : ''}</span>
                      </div>
                    )}
                    <p className="text-xs text-stone-600 leading-relaxed font-normal line-clamp-4">
                      {p.biography}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
