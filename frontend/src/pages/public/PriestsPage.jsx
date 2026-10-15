import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { sortPriests, isPriestDeceased } from '../../utils/priestSorter';
import { Church, Calendar, BookOpen, Clock } from 'lucide-react';

export default function PriestsPage() {
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriests = async () => {
      try {
        const res = await publicApi.getPriests();
        if (res.data) {
          setPriests(sortPriests(res.data));
        }
      } catch (err) {
        console.error('Failed to load priests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPriests();
  }, []);

  const sortedPriests = sortPriests(priests);
  const currentPriests = sortedPriests.filter(p => p.priestStatus === 'CURRENT');
  const formerPriests = sortedPriests.filter(p => p.priestStatus !== 'CURRENT');

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
            By diocesan assignment, our parish is served by a team of three (3) priests headed by the Team Moderator. The clergy directory is arranged chronologically, with the current set on top, and the Team Moderator placed first within each year range.
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
                  {currentPriests.map((p, idx) => {
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
                            <span className={`px-3 py-1 rounded-full backdrop-blur-xs text-xs font-bold shadow-xs transition-transform group-hover:scale-105 ${
                              p.title?.toLowerCase().includes('moderator')
                                ? 'bg-[#C59B3F] text-[#1C1814] border border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                                : 'bg-white/95 text-[#A81B2B] border border-[#C59B3F]/20'
                            }`}>
                              {p.title || 'Parish Priest'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 sm:p-7 flex-1 flex flex-col">
                          <h3 className="font-serif-heading text-xl font-bold text-[#1C1814] leading-snug group-hover:text-[#A81B2B] transition-colors min-h-[3.5rem] flex items-start gap-1.5">
                            {isDeceased && <span className="text-stone-500 font-serif font-bold shrink-0" title="Deceased">†</span>}
                            <span>{p.fullName}</span>
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1 mb-2 h-5">
                            <Calendar className="w-3.5 h-3.5 text-[#C59B3F] shrink-0" />
                            <span>Service Term: {p.serviceStart || ''} {p.serviceEnd ? `– ${p.serviceEnd}` : ''}</span>
                          </div>
                          {isDeceased && (
                            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium mb-3 bg-stone-100/90 px-3 py-1.5 rounded-xl border border-stone-200">
                              <span className="text-amber-600 font-bold">✝</span>
                              <span>
                                Called to eternal rest {p.dateOfDeath ? `in ${p.dateOfDeath}` : ''} &bull; <span className="italic font-serif text-stone-600">Requiescat in pace</span>
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-stone-600 leading-relaxed font-normal">
                            {p.biography}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Sets & Former Clergy */}
            {formerPriests.length > 0 && (
              <div className="pt-8 border-t border-[#C59B3F]/25 scroll-reveal">
                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[#C59B3F]/20">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#C59B3F] ring-4 ring-[#C59B3F]/20" />
                  <div>
                    <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C1814]">
                      Former Team of Pastors, Parish Priests and Parochial Vicars
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8F6B1E] font-medium mt-0.5">
                      Reverend priests and pastors who served in previous sets
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-stagger">
                  {formerPriests.map((p) => {
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
                                {isDeceased ? 'In Memoriam' : 'Former Clergy'}
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3">
                            <span className={`px-3 py-1 rounded-full backdrop-blur-xs text-xs font-bold shadow-xs transition-transform group-hover:scale-105 ${
                              p.title?.toLowerCase().includes('moderator')
                                ? 'bg-[#C59B3F] text-[#1C1814] border border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                                : 'bg-white/95 text-[#A81B2B] border border-[#C59B3F]/20'
                            }`}>
                              {p.title || 'Former Pastor'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 sm:p-7 flex-1 flex flex-col">
                          <h3 className="font-serif-heading text-xl font-bold text-[#1C1814] leading-snug group-hover:text-[#A81B2B] transition-colors min-h-[3.5rem] flex items-start gap-1.5">
                            {isDeceased && <span className="text-stone-500 font-serif font-bold shrink-0" title="Deceased">†</span>}
                            <span>{p.fullName}</span>
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1 mb-2 h-5">
                            <Calendar className="w-3.5 h-3.5 text-[#C59B3F] shrink-0" />
                            <span>Years in Ministry: {p.serviceStart || ''} {p.serviceEnd ? `– ${p.serviceEnd}` : ''}</span>
                          </div>
                          {isDeceased && (
                            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium mb-3 bg-stone-100/90 px-3 py-1.5 rounded-xl border border-stone-200">
                              <span className="text-amber-600 font-bold">✝</span>
                              <span>
                                Called to eternal rest {p.dateOfDeath ? `in ${p.dateOfDeath}` : ''} &bull; <span className="italic font-serif text-stone-600">Requiescat in pace</span>
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-stone-600 leading-relaxed font-normal">
                            {p.biography}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
