import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getSectionById, isSectionUnderMaintenance } from '../../config/maintenanceConfig';
import { Phone, Wrench, AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { FacebookIcon } from './SocialIcons';

export default function PublicMaintenanceNotice({
  sectionKey,
  defaultBadge,
  defaultTitle,
  defaultDesc,
  variant = 'card',
  className = '',
}) {
  const { settings } = useTheme();
  const section = getSectionById(sectionKey);
  const isMaintenance = isSectionUnderMaintenance(sectionKey, settings);

  if (!isMaintenance) return null;

  // Resolved texts from settings overrides or config defaults
  const badge =
    settings?.[`maintenance_${sectionKey}_badge`] ||
    defaultBadge ||
    section?.defaultBadge ||
    'Section Under Preparation & Maintenance';

  const title =
    settings?.[`maintenance_${sectionKey}_title`] ||
    defaultTitle ||
    section?.defaultTitle ||
    'This Section is Currently Under Maintenance';

  const desc =
    settings?.[`maintenance_${sectionKey}_desc`] ||
    defaultDesc ||
    section?.defaultDesc ||
    'Our parish team is currently making updates to this section. Please check back shortly or contact the Parish Office.';

  const showPhone = settings?.[`maintenance_${sectionKey}_show_phone`] !== 'false';
  const showFb = settings?.[`maintenance_${sectionKey}_show_fb`] !== 'false';
  const phone = settings?.phone || '(032) 255 3241';
  const fbUrl = settings?.facebook_url || 'https://www.facebook.com/PATHBanawa';

  if (variant === 'banner') {
    return (
      <aside aria-label="Maintenance notice" className={`w-full bg-[#071838] text-white border-b border-amber-400/30 px-4 py-3 shadow-md relative z-40 ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 uppercase tracking-wider mr-2">[{badge}]</span>
              <span className="text-stone-200">{title} — {desc}</span>
            </div>
          </div>
          {showPhone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold shrink-0 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Office: {phone}</span>
            </a>
          )}
        </div>
      </aside>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto my-8 bg-gradient-to-br from-[#071838] via-[#0D2556] to-[#071838] rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-amber-400/35 relative overflow-hidden scroll-reveal-scale ${className}`}>
      {/* Decorative Gold Light Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 text-center space-y-5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
          <Wrench className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>

        <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-amber-300 leading-snug">
          {title}
        </h2>

        <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
          {desc}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium">
          {showPhone && (
            <a
              href={`tel:${phone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#071838] font-bold transition-all shadow-md cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call Parish Office: {phone}</span>
            </a>
          )}

          {showFb && fbUrl && (
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md cursor-pointer"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>Inquire via Facebook</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
