import React, { useState, useEffect, useRef } from 'react';
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
  const [modalVisible, setModalVisible] = useState(false);
  const closeTimeoutRef = useRef(null);

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

  const openModal = (priest) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSelectedPriest(priest);
    // Double requestAnimationFrame ensures initial render state is committed before triggering CSS transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalVisible(true);
      });
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      setSelectedPriest(null);
      closeTimeoutRef.current = null;
    }, 300);
  };

  // Lock background scroll when modal is open and handle Escape key
  useEffect(() => {
    if (selectedPriest) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedPriest]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
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
            By diocesan assignment, our parish is served by a team of three (3) priests headed by the Team Moderator. The clergy directory is arranged chronologically, with the current set on top, and the Team Moderator placed first within each year range. Click on any priest to view their complete pastoral profile and details.
          </p>
        </div>

        {/* STRICT MAINTENANCE MODE CHECK: If ON, strictly hide all priest cards and directories */}
        {isMaintenance ? (
          <PublicMaintenanceNotice sectionKey="priests" forceShow />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-3xl overflow-hidden border border-[#C59B3F]/20 animate-pulse flex flex-col">
                <div className="h-72 sm:h-80 w-full bg-stone-200" />
                <div className="p-6">
                  <div className="h-6 bg-stone-200 rounded-md w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current Set of Priests (3 Priests) */}
            <div className="mb-20">
              {/* Current Priests Header Container with Smooth Hover Animation */}
              <div className="bg-[#FAF7F0] hover:bg-[#F5EEDC]/50 p-6 sm:p-8 rounded-3xl border border-[#C59B3F]/30 hover:border-[#C59B3F]/60 mb-8 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] scroll-reveal">
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
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#C59B3F]/35 text-[#1C1814] text-xs font-semibold shadow-xs hover:border-[#C59B3F] transition-colors duration-300">
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
                  {currentPriests.map((p) => {
                    const isDeceased = isPriestDeceased(p);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openModal(p)}
                        className="bg-white rounded-3xl overflow-hidden border border-[#C59B3F]/25 hover:border-[#C59B3F] hover:ring-4 hover:ring-[#C59B3F]/15 shadow-xs hover:shadow-[0_22px_45px_-12px_rgba(197,155,63,0.3)] hover:-translate-y-2.5 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group cursor-pointer text-left flex flex-col focus:outline-none focus:ring-2 focus:ring-[#C59B3F]/50 scroll-reveal-scale active:scale-[0.98]"
                      >
                        {/* Priest Photo on Page */}
                        <div className="h-72 sm:h-80 w-full bg-stone-100 overflow-hidden relative">
                          {isDeceased && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/95 text-amber-300 border border-amber-400/40 text-xs font-serif font-bold shadow-md backdrop-blur-xs">
                                <span className="text-amber-400 font-serif font-bold text-sm leading-none select-none">†</span> In Memoriam
                              </span>
                            </div>
                          )}

                          {p.portraitImageUrl ? (
                            <img
                              src={resolveMediaUrl(p.portraitImageUrl)}
                              alt={p.fullName}
                              className={`w-full h-full object-cover object-top transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108 ${
                                isDeceased ? 'filter grayscale-[25%] contrast-[1.05] group-hover:grayscale-0' : ''
                              }`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#14110E] flex flex-col items-center justify-center p-6 text-white text-center">
                              <div className="w-20 h-20 rounded-full bg-[#C59B3F]/20 border-2 border-[#C59B3F]/40 flex items-center justify-center mb-3">
                                {isDeceased ? (
                                  <span className="text-3xl text-[#DFBE7B] font-serif font-bold select-none">†</span>
                                ) : (
                                  <ParishChurchOutlineIcon className="w-12 h-auto text-[#DFBE7B]" />
                                )}
                              </div>
                              <span className="text-xs uppercase font-serif tracking-widest text-[#DFBE7B]">
                                {isDeceased ? 'In Memoriam' : 'Clergy'}
                              </span>
                            </div>
                          )}

                          {/* Role Badge on Photo */}
                          <div className="absolute bottom-3 left-3">
                            <span className={`px-3 py-1 rounded-full backdrop-blur-xs text-xs font-bold shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${
                              p.title?.toLowerCase().includes('moderator')
                                ? 'bg-[#C59B3F] text-[#1C1814] border border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                                : 'bg-white/95 text-[#A81B2B] border border-[#C59B3F]/20'
                            }`}>
                              {p.title || 'Parish Priest'}
                            </span>
                          </div>
                        </div>

                        {/* Priest Name and Click Affordance with Smooth Hover */}
                        <div className="p-5 sm:p-6 flex items-center justify-between gap-3 bg-white group-hover:bg-[#FAF7F0] transition-colors duration-500 flex-1">
                          <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#1C1814] group-hover:text-[#A81B2B] transition-colors duration-300 leading-snug">
                            {isDeceased && <span className="text-stone-500 font-serif font-bold mr-1.5" title="Deceased">†</span>}
                            <span>{p.fullName}</span>
                          </h3>
                          <span className="w-9 h-9 rounded-full bg-[#FAF7F0] group-hover:bg-[#A81B2B] border border-[#C59B3F]/25 group-hover:border-[#A81B2B] flex items-center justify-center shrink-0 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] shadow-xs group-hover:shadow-md group-hover:scale-110">
                            <ChevronRight className="w-4 h-4 text-[#8F6B1E] group-hover:text-white transition-all duration-300 ease-out group-hover:translate-x-1" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Sets & Former Clergy */}
            {formerPriests.length > 0 && (
              <div className="pt-8 border-t border-[#C59B3F]/25 scroll-reveal">
                {/* Former Priests Header Container with Smooth Hover Animation */}
                <div className="bg-[#FAF7F0]/60 hover:bg-[#FAF7F0] p-6 sm:p-7 rounded-3xl border border-[#C59B3F]/25 hover:border-[#C59B3F]/60 mb-8 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3">
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
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openModal(p)}
                        className="bg-white rounded-3xl overflow-hidden border border-[#C59B3F]/25 hover:border-[#C59B3F] hover:ring-4 hover:ring-[#C59B3F]/15 shadow-xs hover:shadow-[0_22px_45px_-12px_rgba(197,155,63,0.3)] hover:-translate-y-2.5 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group cursor-pointer text-left flex flex-col focus:outline-none focus:ring-2 focus:ring-[#C59B3F]/50 scroll-reveal-scale active:scale-[0.98]"
                      >
                        {/* Former Priest Photo on Page */}
                        <div className="h-72 sm:h-80 w-full bg-stone-100 overflow-hidden relative">
                          {isDeceased && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/95 text-amber-300 border border-amber-400/40 text-xs font-serif font-bold shadow-md backdrop-blur-xs">
                                <span className="text-amber-400 font-serif font-bold text-sm leading-none select-none">†</span> In Memoriam
                              </span>
                            </div>
                          )}

                          {p.portraitImageUrl ? (
                            <img
                              src={resolveMediaUrl(p.portraitImageUrl)}
                              alt={p.fullName}
                              className={`w-full h-full object-cover object-top transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108 ${
                                isDeceased ? 'filter grayscale-[25%] contrast-[1.05] group-hover:grayscale-0' : ''
                              }`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#14110E] flex flex-col items-center justify-center p-6 text-white text-center">
                              <div className="w-20 h-20 rounded-full bg-[#C59B3F]/20 border-2 border-[#C59B3F]/40 flex items-center justify-center mb-3">
                                {isDeceased ? (
                                  <span className="text-3xl text-[#DFBE7B] font-serif font-bold select-none">†</span>
                                ) : (
                                  <ParishChurchOutlineIcon className="w-12 h-auto text-[#DFBE7B]" />
                                )}
                              </div>
                              <span className="text-xs uppercase font-serif tracking-widest text-[#DFBE7B]">
                                {isDeceased ? 'In Memoriam' : 'Former Clergy'}
                              </span>
                            </div>
                          )}

                          {/* Role Badge on Photo */}
                          <div className="absolute bottom-3 left-3">
                            <span className={`px-3 py-1 rounded-full backdrop-blur-xs text-xs font-bold shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${
                              p.title?.toLowerCase().includes('moderator')
                                ? 'bg-[#C59B3F] text-[#1C1814] border border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                                : 'bg-white/95 text-[#A81B2B] border border-[#C59B3F]/20'
                            }`}>
                              {p.title || 'Former Pastor'}
                            </span>
                          </div>
                        </div>

                        {/* Priest Name and Click Affordance with Smooth Hover */}
                        <div className="p-5 sm:p-6 flex items-center justify-between gap-3 bg-white group-hover:bg-[#FAF7F0] transition-colors duration-500 flex-1">
                          <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#1C1814] group-hover:text-[#A81B2B] transition-colors duration-300 leading-snug">
                            {isDeceased && <span className="text-stone-500 font-serif font-bold mr-1.5" title="Deceased">†</span>}
                            <span>{p.fullName}</span>
                          </h3>
                          <span className="w-9 h-9 rounded-full bg-[#FAF7F0] group-hover:bg-[#A81B2B] border border-[#C59B3F]/25 group-hover:border-[#A81B2B] flex items-center justify-center shrink-0 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] shadow-xs group-hover:shadow-md group-hover:scale-110">
                            <ChevronRight className="w-4 h-4 text-[#8F6B1E] group-hover:text-white transition-all duration-300 ease-out group-hover:translate-x-1" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Priest Details Modal with Smooth Transitions */}
      {!isMaintenance && selectedPriest && createPortal(
        <div
          className={`fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 sm:p-6 overflow-y-auto transition-all duration-300 ease-out ${
            modalVisible
              ? 'bg-black/60 backdrop-blur-md opacity-100'
              : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
          }`}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="priest-modal-title"
        >
          {/* Modal Container with Scale & Slide Animation */}
          <div
            className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#C59B3F]/30 overflow-hidden my-auto max-h-[90vh] flex flex-col transition-all duration-300 ${
              modalVisible
                ? 'opacity-100 scale-100 translate-y-0 ease-out'
                : 'opacity-0 scale-95 translate-y-6 ease-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button (Top-Right Floating with Hover Rotation) */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close details"
            >
              <X className="w-5 h-5 transition-transform duration-300" />
            </button>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto flex-1">
              {/* Priest Image Banner (Uncropped & Well-Proportioned) */}
              <div className="relative w-full bg-[#FAF7F0] border-b border-[#C59B3F]/20 flex items-center justify-center overflow-hidden min-h-[18rem] sm:min-h-[22rem]">
                {selectedPriest.portraitImageUrl ? (
                  <>
                    {/* Ambient Blurred Backdrop for Depth */}
                    <img
                      src={resolveMediaUrl(selectedPriest.portraitImageUrl)}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-125 pointer-events-none transition-opacity duration-700 ease-out"
                    />
                    {/* Sharp, Complete, Uncropped Portrait */}
                    <div className="relative z-10 h-72 sm:h-88 w-full flex items-center justify-center p-3">
                      <img
                        src={resolveMediaUrl(selectedPriest.portraitImageUrl)}
                        alt={selectedPriest.fullName}
                        className={`h-full w-auto max-w-full object-contain mx-auto drop-shadow-md rounded-xl transition-all duration-500 ease-out hover:scale-[1.02] ${
                          modalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
                        } ${
                          isPriestDeceased(selectedPriest) ? 'filter grayscale-[15%] contrast-[1.05]' : ''
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-64 sm:h-72 bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#14110E] flex flex-col items-center justify-center p-6 text-white text-center">
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

                {/* In Memoriam overlay badge if deceased */}
                {isPriestDeceased(selectedPriest) && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/95 text-amber-300 border border-amber-400/40 text-xs font-serif font-bold shadow-md backdrop-blur-xs">
                      <span className="text-amber-400 font-serif font-bold text-sm leading-none select-none">†</span> In Memoriam
                    </span>
                  </div>
                )}
              </div>

              {/* Details Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Badges & Name */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    {/* Role Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs transition-transform duration-200 hover:scale-105 ${
                        selectedPriest.title?.toLowerCase().includes('moderator')
                          ? 'bg-[#C59B3F] text-[#1C1814] border border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                          : 'bg-[#A81B2B]/10 text-[#A81B2B] border border-[#A81B2B]/20 font-semibold'
                      }`}
                    >
                      {selectedPriest.title || (selectedPriest.priestStatus === 'CURRENT' ? 'Parish Priest' : 'Former Pastor')}
                    </span>

                    {/* Ministry Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
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
                  <div className="flex items-center gap-2 text-sm text-stone-700 bg-[#FAF7F0] hover:bg-[#F5EEDC]/60 border border-[#C59B3F]/25 hover:border-[#C59B3F]/60 rounded-xl px-4 py-3 shadow-xs hover:shadow-sm transition-all duration-300">
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
                  <div className="bg-stone-50 hover:bg-stone-100/70 border border-stone-200 hover:border-stone-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs hover:shadow-sm transition-all duration-300">
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
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl bg-[#1C1814] hover:bg-[#A81B2B] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs hover:shadow-md cursor-pointer"
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
