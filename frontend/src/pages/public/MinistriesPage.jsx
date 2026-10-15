import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Users, Sparkles, Clock, Phone,
  MapPin, Heart, BookOpen, Music, Shield, ArrowRight,
  Church, Cross, HeartHandshake, Flame, Sun, Bell,
  Compass, Star, Award, Scroll, Feather, HandHeart, Search, X
} from 'lucide-react';
import { FacebookIcon } from '../../components/common/SocialIcons';
import { CANONICAL_INITIAL_MINISTRIES, MINISTRY_ICON_MAP, STATUS_PRESETS } from '../admin/MinistriesManager';

export default function MinistriesPage() {
  const { settings } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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
        {isBannerEnabled && (
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#071838] via-[#0D2556] to-[#071838] rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-amber-400/30 relative overflow-hidden scroll-reveal-scale">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300 block">
                {bannerBadge}
              </span>

              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-amber-300 leading-snug">
                {bannerTitle}
              </h2>

              <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
                {bannerDesc}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium">
                {showPhone && (
                  <a 
                    href={`tel:${settings?.phone || '(032) 255 3241'}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#071838] font-bold transition-all shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Parish Office: {settings?.phone || '(032) 255 3241'}</span>
                  </a>
                )}

                {showFb && settings?.facebook_url && (
                  <a 
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md"
                  >
                    <FacebookIcon className="w-4 h-4" />
                    <span>Inquire via Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

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
                const statusConfig = STATUS_PRESETS.find((s) => s.value === item.statusBadge) || {
                  color: 'bg-stone-100 text-stone-600 border-stone-200',
                };

                return (
                  <div 
                    key={item.id || idx}
                    className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs card-lift scroll-reveal flex flex-col justify-between space-y-4 relative group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-[#071838] group-hover:text-amber-300 transition-colors shadow-xs">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}>
                          {item.statusBadge || 'Active'}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h4 className="font-serif-heading font-bold text-stone-900 text-base mt-0.5">
                          {item.name}
                        </h4>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    {/* Coordinator and Schedule Metadata (if configured in CMS) */}
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

      </div>
    </div>
  );
}
