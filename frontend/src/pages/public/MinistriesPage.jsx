import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Users, Sparkles, Clock, Phone,
  MapPin, Heart, BookOpen, Music, Shield, ArrowRight,
  Church, Cross, HeartHandshake, Flame, Sun, Bell,
  Compass, Star, Award, Scroll, Feather, HandHeart, Search, X,
  Camera, ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon
} from 'lucide-react';
import { FacebookIcon } from '../../components/common/SocialIcons';
import PublicMaintenanceNotice from '../../components/common/PublicMaintenanceNotice';
import {
  CANONICAL_INITIAL_MINISTRIES,
  MINISTRY_ICON_MAP,
  STATUS_PRESETS,
  normalizeMinistryPhotos,
} from '../admin/MinistriesManager';
import { resolveMediaUrl } from '../../utils/mediaUrl';

export default function MinistriesPage() {
  const { settings } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State for viewing ministry photos & details (with smooth open & close animations)
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Fullscreen Lightbox State (with smooth open & close animations)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);

  // Open ministry modal with smooth entrance
  const openMinistryModal = (item) => {
    setSelectedMinistry(item);
    setActivePhotoIdx(0);
    setIsModalOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  // Close ministry modal with smooth exit
  const closeMinistryModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedMinistry(null);
    }, 280);
  };

  // Open fullscreen lightbox with smooth entrance
  const openLightbox = () => {
    setIsLightboxOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsLightboxVisible(true);
      });
    });
  };

  // Close fullscreen lightbox with smooth exit
  const closeLightbox = () => {
    setIsLightboxVisible(false);
    setTimeout(() => {
      setIsLightboxOpen(false);
    }, 260);
  };

  // Normalized photos for the currently opened modal ministry
  const modalPhotos = useMemo(() => {
    if (!selectedMinistry) return [];
    return normalizeMinistryPhotos(selectedMinistry.photos);
  }, [selectedMinistry]);

  // Lock body scroll and enable keyboard shortcuts (Esc, Left/Right arrows)
  useEffect(() => {
    if (!isModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          closeLightbox();
        } else {
          closeMinistryModal();
        }
      } else if (e.key === 'ArrowLeft' && modalPhotos.length > 1) {
        setActivePhotoIdx((prev) => (prev === 0 ? modalPhotos.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight' && modalPhotos.length > 1) {
        setActivePhotoIdx((prev) => (prev + 1) % modalPhotos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, isLightboxOpen, modalPhotos.length]);

  // Resolve ministries list from dynamic CMS settings or fallback to initial defaults
  const ministries = useMemo(() => {
    if (settings?.ministries_list) {
      try {
        const parsed = typeof settings.ministries_list === 'string'
          ? JSON.parse(settings.ministries_list)
          : settings.ministries_list;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isLegacyDefault =
            parsed.length === 6 &&
            parsed.some((m) => m.id === 'min-liturgical' || m.id === 'min-caritas');
          if (!isLegacyDefault) {
            return parsed
              .filter((m) => m.isPublished !== false)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          }
        }
      } catch (e) {
        console.error('Failed to parse dynamic ministries_list', e);
      }
    }
    return CANONICAL_INITIAL_MINISTRIES;
  }, [settings?.ministries_list]);

  // Extract unique categories for public filter pills
  const categories = useMemo(() => {
    return Array.from(new Set(ministries.map((m) => m.category).filter(Boolean)));
  }, [ministries]);

  // Filtered ministries based on search query and category
  const filteredMinistries = useMemo(() => {
    return ministries.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.name?.toLowerCase().includes(q) ||
        item.desc?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.coordinator?.toLowerCase().includes(q) ||
        item.schedule?.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [ministries, searchQuery, selectedCategory]);

  // Dynamic Page Configurations
  const eyebrow = settings?.ministries_eyebrow || 'Pastoral Apostolates & Organizations';
  const title = settings?.ministries_title || 'Parish Ministries';
  const subtitle = settings?.ministries_subtitle || 'United in the Sacred Hearts of Jesus and Mary to serve the Lord, the Church, and our community.';

  // Notice Banner Configuration (synced with Maintenance Mode)
  const isBannerEnabled =
    settings?.maintenance_ministries !== undefined
      ? String(settings.maintenance_ministries) === 'true'
      : (settings?.ministries_banner_enabled === undefined || String(settings.ministries_banner_enabled) === 'true');
  const bannerBadge = settings?.maintenance_ministries_badge || settings?.ministries_banner_badge || 'Section Under Preparation';
  const bannerTitle = settings?.maintenance_ministries_title || settings?.ministries_banner_title || 'Ministries Directory is Currently in the Making';
  const bannerDesc = settings?.maintenance_ministries_desc || settings?.ministries_banner_desc || 'We are currently compiling and updating the complete directory of parish ministries, apostolic movements, coordinators, and schedules. The finalized directory and online sign-up details will be published here soon.';
  const showPhone = (settings?.maintenance_ministries_show_phone ?? settings?.ministries_banner_show_phone) !== 'false';
  const showFb = (settings?.maintenance_ministries_show_fb ?? settings?.ministries_banner_show_fb) !== 'false';

  // Bottom CTA Configuration
  const ctaTitle = settings?.ministries_cta_title || 'Interested in joining a ministry or serving as a volunteer?';
  const ctaDesc = settings?.ministries_cta_desc || 'Visit our parish office at J. Fortich St., Banawa, Cebu City during regular office hours.';
  const ctaBtnText = settings?.ministries_cta_btn_text || 'View Office Details';
  const ctaBtnLink = settings?.ministries_cta_btn_link || '/contact';

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Dynamic Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block">
            {eyebrow}
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-extrabold text-[#071838] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
        </div>

        {/* Dynamic Dignified Notice Announcement Card (Controllable from Admin) */}
        {isBannerEnabled ? (
          <PublicMaintenanceNotice sectionKey="ministries" forceShow />
        ) : (
          <>
            {/* Dynamic Ministries Section */}
            <div className="space-y-8 scroll-reveal">
              
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900">
                  Areas of Service & Apostolates
                </h3>
                <p className="text-stone-500 text-sm">
                  Explore the active ministries at PATH Banawa serving our liturgy, faith formation, youth, and charity missions.
                </p>
              </div>

              {/* Search & Category Filter Pills */}
              <div className="max-w-4xl mx-auto space-y-3">
                <div className="relative max-w-md mx-auto">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ministries or apostolates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-full border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/20 bg-white shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                {categories.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 text-xs">
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                        selectedCategory === 'ALL'
                          ? 'bg-[#071838] text-amber-300 shadow-xs'
                          : 'bg-stone-200/70 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      All ({ministries.length})
                    </button>
                    {categories.map((cat) => {
                      const count = ministries.filter((m) => m.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-[#071838] text-amber-300 shadow-xs'
                              : 'bg-stone-200/70 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ministries Grid */}
              {filteredMinistries.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 shadow-xs max-w-lg mx-auto">
                  <p className="text-stone-600 text-sm">
                    No ministries matched your search. Try resetting your search filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#071838] text-amber-300 text-xs font-bold"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-stagger">
                  {filteredMinistries.map((item, idx) => {
                    const IconComponent = MINISTRY_ICON_MAP[item.icon] || Shield;
                    const itemPhotos = normalizeMinistryPhotos(item.photos);
                    const statusConfig = STATUS_PRESETS.find((s) => s.value === item.statusBadge) || {
                      color: 'bg-stone-100 text-stone-600 border-stone-200',
                    };

                    return (
                      <div 
                        key={item.id || idx}
                        onClick={() => openMinistryModal(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openMinistryModal(item);
                          }
                        }}
                        className="ministry-card-interactive bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4 relative group cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30 select-none"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:bg-[#071838] group-hover:text-amber-300 group-hover:scale-110 group-hover:rotate-1 group-hover:shadow-md shrink-0 shadow-xs">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-transform duration-300 group-hover:scale-105 ${statusConfig.color}`}>
                              {item.statusBadge || 'Active'}
                            </span>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block transition-colors duration-300 group-hover:text-amber-800">
                              {item.category}
                            </span>
                            <h4 className="font-serif-heading font-bold text-stone-900 text-base mt-0.5 transition-colors duration-300 group-hover:text-[#800020]">
                              {item.name}
                            </h4>
                          </div>
                        </div>

                        {/* Coordinator and Schedule Metadata (if configured in CMS) */}
                        <div className="space-y-2.5">
                          {(item.coordinator || item.schedule) && (
                            <div className="pt-3 border-t border-stone-100 space-y-1.5 text-[11px] text-stone-500">
                              {item.coordinator && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-stone-700">Lead:</span>
                                  <span className="truncate">{item.coordinator}</span>
                                </div>
                              )}
                              {item.schedule && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span className="truncate">{item.schedule}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Photos & Click indicator */}
                          <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                            {itemPhotos.length > 0 ? (
                              <div className="flex items-center gap-1.5 font-bold text-amber-800 transition-transform duration-300 group-hover:translate-x-0.5">
                                <Camera className="w-3.5 h-3.5 text-amber-700" />
                                <span>{itemPhotos.length} {itemPhotos.length === 1 ? 'Photo' : 'Photos'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] text-stone-500 transition-transform duration-300 group-hover:translate-x-0.5">
                                <Camera className="w-3.5 h-3.5 text-stone-400" />
                                <span>View Details & Photos</span>
                              </div>
                            )}
                            <span className="text-[11px] font-bold text-[#800020] group-hover:text-amber-800 transition-colors duration-300 flex items-center gap-1">
                              <span>Open</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Bottom CTA / Information Box */}
            <div className="bg-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <h4 className="font-serif-heading text-base font-bold text-stone-900">
                  {ctaTitle}
                </h4>
                <p className="text-stone-600 text-xs sm:text-sm">
                  {ctaDesc}
                </p>
              </div>
              <Link 
                to={ctaBtnLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071838] text-amber-300 hover:text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
              >
                <span>{ctaBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}

      </div>

      {/* Ministry Popup Modal Dialog with Smooth Enter & Exit Animations */}
      {isModalOpen && selectedMinistry && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-3 sm:p-6 modal-overlay-base ${
            isModalVisible ? 'modal-overlay-enter' : ''
          }`}
          onClick={closeMinistryModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] modal-content-base ${
              isModalVisible ? 'modal-content-enter' : ''
            }`}
          >
            {/* Modal Top Bar */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0 shadow-xs">
                  {React.createElement(MINISTRY_ICON_MAP[selectedMinistry.icon] || Shield, { className: 'w-5 h-5' })}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold tracking-widest text-amber-800 uppercase block truncate">
                    {selectedMinistry.category}
                  </span>
                  <h2 className="font-serif-heading font-bold text-lg sm:text-xl text-stone-900 leading-tight truncate">
                    {selectedMinistry.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  (STATUS_PRESETS.find((s) => s.value === selectedMinistry.statusBadge) || {}).color || 'bg-stone-100 text-stone-600 border-stone-200'
                }`}>
                  {selectedMinistry.statusBadge || 'Active'}
                </span>
                <button
                  type="button"
                  onClick={closeMinistryModal}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
                  title="Close popup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Description Banner (Displayed inside popup window) */}
              {selectedMinistry.desc && (
                <div className="bg-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-100/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Ministry Mission & Apostolate
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {selectedMinistry.desc}
                  </p>
                </div>
              )}

              {/* Lead and Schedule info */}
              {(selectedMinistry.coordinator || selectedMinistry.schedule) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-600">
                  {selectedMinistry.coordinator && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong className="text-stone-800">Lead:</strong> {selectedMinistry.coordinator}
                      </span>
                    </div>
                  )}
                  {selectedMinistry.schedule && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong className="text-stone-800">Schedule:</strong> {selectedMinistry.schedule}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Gallery Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-700" />
                    <h3 className="font-serif-heading font-bold text-stone-900 text-base">
                      Ministry Photo Gallery
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-stone-500">
                    {modalPhotos.length} {modalPhotos.length === 1 ? 'Photograph' : 'Photographs'}
                  </span>
                </div>

                {modalPhotos.length === 0 ? (
                  <div className="bg-stone-50 rounded-2xl p-8 text-center border border-dashed border-stone-300 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif-heading font-bold text-stone-800 text-sm">
                      No Photos Uploaded Yet
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Photographs of this ministry&apos;s apostolates, liturgical rites, and community activities will appear here once updated.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Main Featured Photo Display */}
                    <div className="relative aspect-video sm:aspect-[16/10] w-full bg-stone-900 rounded-2xl overflow-hidden shadow-md flex items-center justify-center group">
                      <img
                        src={resolveMediaUrl(modalPhotos[activePhotoIdx]?.url)}
                        alt={modalPhotos[activePhotoIdx]?.caption || selectedMinistry.name}
                        className="w-full h-full object-contain cursor-pointer transition-transform duration-500 group-hover:scale-102"
                        onClick={openLightbox}
                      />

                      {/* Counter Tag */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                        {activePhotoIdx + 1} / {modalPhotos.length}
                      </div>

                      {/* Expand / Lightbox Button */}
                      <button
                        type="button"
                        onClick={openLightbox}
                        className="absolute top-3 left-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                        title="Expand full screen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      {/* Nav Arrows (if > 1 photo) */}
                      {modalPhotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIdx((prev) => (prev === 0 ? modalPhotos.length - 1 : prev - 1));
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer hover:scale-110"
                            title="Previous photo"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIdx((prev) => (prev + 1) % modalPhotos.length);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer hover:scale-110"
                            title="Next photo"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Caption Bar Overlay */}
                      {modalPhotos[activePhotoIdx]?.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 text-white text-xs sm:text-sm font-medium">
                          {modalPhotos[activePhotoIdx].caption}
                        </div>
                      )}
                    </div>

                    {/* Thumbnails Strip */}
                    {modalPhotos.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                        {modalPhotos.map((p, idx) => (
                          <button
                            key={p.id || idx}
                            type="button"
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-pointer ${
                              activePhotoIdx === idx
                                ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-md scale-104'
                                : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'
                            }`}
                          >
                            <img
                              src={resolveMediaUrl(p.url)}
                              alt={p.caption || `Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <Link
                to="/contact"
                className="text-xs font-bold text-[#800020] hover:text-[#66001a] inline-flex items-center gap-1.5"
                onClick={closeMinistryModal}
              >
                <span>Volunteer or Inquire at Office</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={closeMinistryModal}
                className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen Lightbox Portal with Smooth Enter & Exit Animations */}
      {isLightboxOpen && modalPhotos.length > 0 && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 modal-overlay-base ${
            isLightboxVisible ? 'modal-overlay-enter' : ''
          }`}
          onClick={closeLightbox}
        >
          <div className={`relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center modal-content-base ${
            isLightboxVisible ? 'modal-content-enter' : ''
          }`} onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close full screen"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Lightbox Image */}
            <div className="relative w-full flex items-center justify-center">
              <img
                src={resolveMediaUrl(modalPhotos[activePhotoIdx]?.url)}
                alt={modalPhotos[activePhotoIdx]?.caption || 'Full screen photo'}
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />

              {modalPhotos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx((prev) => (prev === 0 ? modalPhotos.length - 1 : prev - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx((prev) => (prev + 1) % modalPhotos.length);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Caption & Counter */}
            <div className="mt-3 text-center text-white space-y-1">
              {modalPhotos[activePhotoIdx]?.caption && (
                <p className="text-sm font-medium">{modalPhotos[activePhotoIdx].caption}</p>
              )}
              <span className="text-xs text-stone-400">
                {activePhotoIdx + 1} of {modalPhotos.length}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
