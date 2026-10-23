import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { sortPriests, isPriestDeceased } from '../../utils/priestSorter';
import PublicMaintenanceNotice, { useSectionMaintenance } from '../../components/common/PublicMaintenanceNotice';
import { Calendar, BookOpen, Clock, X, ChevronRight } from 'lucide-react';
import ParishChurchOutlineIcon from '../../components/common/ParishChurchOutlineIcon';

export default function PriestsPage() {
  const isMaintenance = useSectionMaintenance('priests');
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriest, setSelectedPriest] = useState(null);

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

  // Lock background scroll when modal is open and handle Escape key
  useEffect(() => {
    if (selectedPriest) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedPriest(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedPriest]);

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
            By diocesan assignment, our parish is served by a team of three (3) priests headed by the Team Moderator. The clergy directory is arranged chronologically, with the current set on top, and the Team Moderator placed first within each year range. Click on any priest's name to view their complete pastoral profile and details.
          </p>
        </div>

        {/* STRICT MAINTENANCE MODE CHECK: If ON, strictly hide all priest cards and directories */}
        {isMaintenance ? (
          <PublicMaintenanceNotice sectionKey="priests" forceShow />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-2xl sm:rounded-3xl h-24 animate-pulse border border-[#C59B3F]/20" />
            ))}
          </div>
        ) : (
          <>
            {/* Current Set of Priests (3 Priests) */}
            <div className="mb-16">
              <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-3xl border border-[#C59B3F]/30 mb-8 shadow-xs scroll-reveal">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <div>
                      <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C1814]">
                        Current Parish Priests
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-stagger">
                  {currentPriests.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPriest(p)}
                      className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#C59B3F]/25 hover:border-[#C59B3F] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer text-left flex items-center justify-between gap-4 w-full focus:outline-none focus:ring-2 focus:ring-[#C59B3F]/50 scroll-reveal-scale"
                    >
                      <span className="font-serif-heading text-lg sm:text-xl font-bold text-[#1C1814] group-hover:text-[#A81B2B] transition-colors leading-snug">
                        {p.fullName}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-[#FAF7F0] group-hover:bg-[#A81B2B] border border-[#C59B3F]/20 group-hover:border-[#A81B2B] flex items-center justify-center shrink-0 transition-colors shadow-xs">
                        <ChevronRight className="w-4 h-4 text-[#8F6B1E] group-hover:text-white transition-colors" />
                      </span>
                    </button>
                  ))}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 scroll-stagger">
                  {formerPriests.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPriest(p)}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-[#C59B3F]/25 hover:border-[#C59B3F] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer text-left flex items-center justify-between gap-4 w-full focus:outline-none focus:ring-2 focus:ring-[#C59B3F]/50 scroll-reveal-scale"
                    >
                      <span className="font-serif-heading text-base sm:text-lg font-bold text-[#1C1814] group-hover:text-[#A81B2B] transition-colors leading-snug">
                        {p.fullName}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-[#FAF7F0] group-hover:bg-[#A81B2B] border border-[#C59B3F]/20 group-hover:border-[#A81B2B] flex items-center justify-center shrink-0 transition-colors shadow-xs">
                        <ChevronRight className="w-3.5 h-3.5 text-[#8F6B1E] group-hover:text-white transition-colors" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Priest Details Modal */}
      {!isMaintenance && selectedPriest && createPortal(
        <div
          className="fixed inset-0 z-[100] w-screen h-screen bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSelectedPriest(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="priest-modal-title"
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#C59B3F]/30 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button (Top-Right Floating) */}
            <button
              type="button"
              onClick={() => setSelectedPriest(null)}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto flex-1">
              {/* Priest Image Banner / Placeholder */}
              <div className="h-64 sm:h-72 w-full bg-stone-100 overflow-hidden relative">
                {isPriestDeceased(selectedPriest) && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/95 text-amber-300 border border-amber-400/40 text-xs font-serif font-bold shadow-md backdrop-blur-xs">
                      <span className="text-amber-400 font-serif font-bold text-sm leading-none select-none">†</span> In Memoriam
                    </span>
                  </div>
                )}

                {selectedPriest.portraitImageUrl ? (
                  <img
                    src={resolveMediaUrl(selectedPriest.portraitImageUrl)}
                    alt={selectedPriest.fullName}
                    className={`w-full h-full object-cover object-top ${
                      isPriestDeceased(selectedPriest) ? 'filter grayscale-[20%] contrast-[1.05]' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#14110E] flex flex-col items-center justify-center p-6 text-white text-center">
                    <div className="w-20 h-20 rounded-full bg-[#C59B3F]/20 border-2 border-[#C59B3F]/40 flex items-center justify-center mb-3">
                      {isPriestDeceased(selectedPriest) ? (
                        <span className="text-3xl text-[#DFBE7B] font-serif font-bold select-none">†</span>
                      ) : (
                        <ParishChurchOutlineIcon className="w-12 h-auto text-[#DFBE7B]" />
                      )}
                    </div>
                    <span className="text-xs uppercase font-serif tracking-widest text-[#DFBE7B]">
                      {isPriestDeceased(selectedPriest) ? 'In Memoriam' : 'Clergy of the Parish'}
                    </span>
                  </div>
                )}

                {/* Role Badge in Banner */}
                <div className="absolute bottom-3 left-4">
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-xs ${
                      selectedPriest.title?.toLowerCase().includes('moderator')
                        ? 'bg-[#C59B3F] text-[#1C1814] border border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                        : 'bg-white/95 text-[#A81B2B] border border-[#C59B3F]/20'
                    }`}
                  >
                    {selectedPriest.title || (selectedPriest.priestStatus === 'CURRENT' ? 'Parish Priest' : 'Former Pastor')}
                  </span>
                </div>
              </div>

              {/* Details Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Name & Ministry Status */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        selectedPriest.priestStatus === 'CURRENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedPriest.priestStatus === 'CURRENT' ? 'bg-emerald-500' : 'bg-stone-400'
                        }`}
                      />
                      {selectedPriest.priestStatus === 'CURRENT' ? 'Current Active Set' : 'Former Parish Clergy'}
                    </span>
                  </div>

                  <h2
                    id="priest-modal-title"
                    className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C1814] leading-snug flex items-start gap-2"
                  >
                    {isPriestDeceased(selectedPriest) && (
                      <span className="text-stone-500 font-serif font-bold shrink-0" title="Deceased">†</span>
                    )}
                    <span>{selectedPriest.fullName}</span>
                  </h2>
                </div>

                {/* Service Dates */}
                {(selectedPriest.serviceStart || selectedPriest.serviceEnd) && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 bg-[#FAF7F0] border border-[#C59B3F]/20 rounded-xl px-4 py-2.5">
                    <Calendar className="w-4 h-4 text-[#C59B3F] shrink-0" />
                    <span className="font-semibold text-stone-800">
                      {selectedPriest.priestStatus === 'CURRENT' ? 'Service Term:' : 'Years in Ministry:'}
                    </span>
                    <span>
                      {selectedPriest.serviceStart || 'Start N/A'}
                      {selectedPriest.serviceEnd ? ` – ${selectedPriest.serviceEnd}` : ''}
                    </span>
                  </div>
                )}

                {/* Deceased Memorial Information */}
                {isPriestDeceased(selectedPriest) && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-stone-500 font-serif font-bold text-xl leading-none select-none mt-0.5">†</span>
                    <div className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      <p className="font-semibold text-stone-800">
                        Called to eternal rest {selectedPriest.dateOfDeath ? `(${selectedPriest.dateOfDeath})` : ''}
                      </p>
                      <p className="italic font-serif text-stone-500 mt-0.5">
                        Requiescat in pace. May eternal light shine upon him.
                      </p>
                    </div>
                  </div>
                )}

                {/* Biography */}
                <div className="border-t border-[#C59B3F]/20 pt-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8F6B1E] mb-3">
                    <BookOpen className="w-4 h-4 text-[#C59B3F]" />
                    <span>Pastoral Profile & Biography</span>
                  </div>
                  {selectedPriest.biography ? (
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line text-justify [text-align-last:left]">
                      {selectedPriest.biography}
                    </p>
                  ) : (
                    <p className="text-stone-400 italic text-sm">
                      No biography or background details recorded for this priest.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="px-6 py-4 bg-[#FAF7F0] border-t border-[#C59B3F]/20 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPriest(null)}
                className="px-5 py-2 rounded-xl bg-[#1C1814] hover:bg-[#A81B2B] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
