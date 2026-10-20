import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { OVERALL_MAINTENANCE_DEFAULTS, isAdminPreviewAllowed } from '../../config/maintenanceConfig';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import {
  Wrench, Phone, MapPin, Clock, Calendar,
  ShieldCheck, Lock, ExternalLink, Eye
} from 'lucide-react';
import { FacebookIcon } from './SocialIcons';
import ParishChurchOutlineIcon from './ParishChurchOutlineIcon';

export default function OverallMaintenanceScreen() {
  const { settings } = useTheme();

  const badge = settings?.maintenance_overall_badge || OVERALL_MAINTENANCE_DEFAULTS.defaultBadge;
  const title = settings?.maintenance_overall_title || OVERALL_MAINTENANCE_DEFAULTS.defaultTitle;
  const desc = settings?.maintenance_overall_desc || OVERALL_MAINTENANCE_DEFAULTS.defaultDesc;
  const advisory = settings?.maintenance_overall_advisory || OVERALL_MAINTENANCE_DEFAULTS.defaultAdvisory;

  const showPhone = settings?.maintenance_overall_show_phone !== 'false';
  const showFb = settings?.maintenance_overall_show_fb !== 'false';
  const phone = settings?.phone || '(032) 255 3241 | 0942 361 3174';
  const email = settings?.email || 'pathbanawa1988@gmail.com';
  const address = settings?.address || 'J. Fortich St., Banawa, Cebu City, Philippines';
  const officeHours = settings?.office_hours || 'Monday – Sunday: 8:00 AM – 12:00 NN, 1:00 PM – 5:00 PM';
  const fbUrl = settings?.facebook_url || 'https://www.facebook.com/PATHBanawa';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051329] via-[#071838] to-[#0A2250] text-white flex flex-col justify-between selection:bg-[#D4AF37] selection:text-stone-900 relative overflow-hidden">

      {/* Decorative Gold & Blue Atmospheric Radial Glows */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Liturgical Top Gold Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#DFBE7B] via-[#C59B3F] to-[#A81B2B]" />

      {/* Administrator Session Detected Ribbon */}
      {isAdminPreviewAllowed() && (
        <aside aria-label="Administrator banner" className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-bold px-4 py-2.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-lg relative z-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-950 animate-ping shrink-0" />
            <span>Administrator Session Detected — Public Maintenance Shield is currently active for ordinary visitors.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={ADMIN_ROUTES.preview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-amber-300 font-bold text-xs transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Admin Live Preview</span>
            </Link>
            <Link
              to={ADMIN_ROUTES.base}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-stone-900 font-bold text-xs transition-colors shadow-sm"
            >
              CMS Portal
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex-1 flex flex-col items-center justify-center text-center relative z-10">

        {/* Parish Seal Logo */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-[#D4AF37]/80 flex items-center justify-center mx-auto animate-float-slow">
            <img
              src="/logo.png"
              alt="PATH Official Parish Seal"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-md ring-2 ring-[#071838]">
            <Wrench className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Parish Identification */}
        <div className="space-y-1.5 mb-8">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400 block font-serif">
            The Roman Catholic Archdiocese of Cebu
          </span>
          <h1 className="font-serif-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-snug">
            <span className="block">Parish of the Alliance</span>
            <span className="block">of the Two Hearts</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-medium tracking-wide">
            J. Fortich St., Banawa, Cebu City • Founded 1988
          </p>
        </div>

        {/* Central Dignified Catholic Maintenance Notice Card */}
        <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-amber-400/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400/0 via-amber-400/60 to-amber-400/0" />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{badge}</span>
          </div>

          {/* Notice Heading */}
          <h2 className="font-serif-heading text-xl sm:text-3xl font-bold text-amber-300 leading-snug">
            {title}
          </h2>

          {/* Notice Description */}
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {desc}
          </p>

          {/* Pastoral & Sacramental Reassurance Box */}
          {advisory && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-left flex items-start gap-3.5 max-w-xl mx-auto">
              <ParishChurchOutlineIcon className="w-6 h-auto text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 text-xs uppercase tracking-wider block mb-0.5">
                  Pastoral Notice
                </span>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal">
                  {advisory}
                </p>
              </div>
            </div>
          )}

          {/* Direct Communication Channels */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold">
            {showPhone && (
              <a
                href={`tel:${phone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg hover:scale-[1.02] active:scale-95"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white transition-all shadow-lg hover:scale-[1.02] active:scale-95"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Inquire via Facebook</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}
          </div>

          {/* Parish Office Operating Hours & Address Details */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs text-stone-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Parish Office:</span>
                <p>{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Office Hours:</span>
                <p className="whitespace-pre-line">{officeHours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
