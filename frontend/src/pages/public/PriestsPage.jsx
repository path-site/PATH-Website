import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Church, Calendar, BookOpen, Clock } from 'lucide-react';

export default function PriestsPage() {
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriests = async () => {
      try {
        const res = await publicApi.getPriests();
        if (res.data) {
          setPriests(res.data);
        }
      } catch (err) {
        console.error('Failed to load priests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPriests();
  }, []);

  const currentPriests = priests.filter(p => p.priestStatus === 'CURRENT');
  const formerPriests = priests.filter(p => p.priestStatus === 'FORMER');

  return (
    <div className="min-h-screen bg-[#F7F4EB] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8F6B1E] block mb-3">
            Clergy of the Parish
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-[#1C1814] tracking-tight leading-tight">
            Our Parish Priests
          </h1>
          <p className="mt-4 text-stone-600 text-base sm:text-lg leading-relaxed">
            By diocesan assignment, our parish is served by a set of three (3) priests dedicated to celebrating the Holy Eucharist, administering the Sacraments, and shepherding our parish community.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-3xl h-96 animate-pulse border border-[#C59B3F]/20" />
            ))}
          </div>
        ) : (
          <>
            {/* Current Set of Priests (3 Priests) */}
            <div className="mb-20">
              <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-3xl border border-[#C59B3F]/30 mb-8 shadow-xs scroll-reveal">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <div>
                      <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C1814]">
                        Current Set of Priests
                      </h2>
                      <p className="text-xs sm:text-sm text-[#8F6B1E] font-medium mt-0.5">
                        Active Set of 3 Assigned Priests
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#C59B3F]/35 text-[#1C1814] text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#C59B3F]" />
                    <span>Active Pastoral Ministry</span>
                  </div>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-[#C59B3F]/15 pt-3">
                  Under our pastoral structure, three priests are assigned every set to collaborate in spiritual leadership, sacramental ministry, and pastoral administration across all Basic Ecclesial Communities and parish apostolates.
                </p>
              </div>

              {currentPriests.length === 0 ? (
                <p className="text-stone-500 italic">No current priests listed.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-stagger">
                  {currentPriests.map((p, idx) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl overflow-hidden border border-[#C59B3F]/25 shadow-xs card-lift scroll-reveal-scale flex flex-col group shimmer-sweep"
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
                          <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-xs font-bold text-[#A81B2B] shadow-xs border border-[#C59B3F]/20 transition-transform group-hover:scale-105">
                            {p.title || 'Parish Priest'}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif-heading text-xl font-bold text-[#1C1814] leading-snug group-hover:text-[#A81B2B] transition-colors">
                            {p.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1 mb-4">
                            <Calendar className="w-3.5 h-3.5 text-[#C59B3F]" />
                            <span>Service Term: {p.serviceStart || ''} {p.serviceEnd ? `– ${p.serviceEnd}` : ''}</span>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed font-normal">
                            {p.biography}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Sets & Former Clergy */}
            {formerPriests.length > 0 && (
              <div className="pt-8 border-t border-[#C59B3F]/25 scroll-reveal">
                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[#C59B3F]/20">
                  <span className="w-3.5 h-3.5 rounded-full bg-stone-400" />
                  <div>
                    <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C1814]">
                      Past Sets & Former Clergy
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500">
                      Reverend priests and pastors who served in previous sets
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-stagger">
                  {formerPriests.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white/80 rounded-3xl overflow-hidden border border-[#C59B3F]/20 shadow-xs card-lift scroll-reveal flex flex-col group opacity-90 hover:opacity-100"
                    >
                      <div className="h-64 sm:h-72 w-full bg-stone-100 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                        {p.portraitImageUrl ? (
                          <img
                            src={resolveMediaUrl(p.portraitImageUrl)}
                            alt={p.fullName}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#14110E] flex flex-col items-center justify-center p-6 text-white text-center">
                            <div className="w-16 h-16 rounded-full bg-stone-700/40 border border-stone-500/40 flex items-center justify-center mb-2">
                              <Church className="w-8 h-8 text-stone-300" />
                            </div>
                            <span className="text-[11px] uppercase font-serif tracking-widest text-stone-300">Former Clergy</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3">
                          <span className="px-3 py-1 rounded-full bg-[#1C1814]/90 text-white text-xs font-semibold">
                            {p.title || 'Former Pastor'}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif-heading text-lg font-bold text-[#1C1814] leading-snug">
                            {p.fullName}
                          </h3>
                          <p className="text-xs text-stone-500 font-medium mt-1 mb-3">
                            Years in Ministry: {p.serviceStart || ''} {p.serviceEnd ? `– ${p.serviceEnd}` : ''}
                          </p>
                          <p className="text-sm text-stone-600 leading-relaxed">
                            {p.biography}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
