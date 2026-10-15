import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FacebookIcon } from '../common/SocialIcons';

export default function Footer() {
  const { settings } = useTheme();

  return (
    <footer className="bg-[#071838] text-stone-200 border-t-4 border-[#D4AF37] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* Column 1: Parish Identity (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg ring-2 ring-[#D4AF37] flex items-center justify-center shrink-0 animate-float-slow">
                <img
                  src="/logo.png"
                  alt="PATH Parish Official Seal"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif-heading font-bold text-white text-lg block leading-tight">
                  {settings.site_name || 'Parish of the Alliance of the Two Hearts'}
                </span>
                <span className="text-xs text-amber-300 font-semibold tracking-wide">
                  J. Fortich St., Banawa, Cebu City • Founded 1988
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed italic max-w-md">
              "{settings.tagline || 'A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary.'}"
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-900/60 hover:bg-[#1877F2] text-amber-300 hover:text-white border border-amber-400/30 flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Contact & Location (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif-heading text-white text-base font-semibold mb-4 tracking-wide uppercase text-amber-400/90">
              Parish Office
            </h4>
            <div className="flex items-start gap-3 text-sm text-stone-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <span>{settings.address || 'J. Fortich St., Banawa, Cebu City, Philippines'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-300">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.phone || '(032) 255 3241 | 0942 361 3174'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-300">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.email || 'pathbanawa1988@gmail.com'}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-stone-300 pt-1">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <div className="whitespace-pre-line text-xs leading-relaxed">
                {settings.office_hours || 'Monday – Sunday: 8:00 AM – 12:00 NN, 1:00 PM – 5:00 PM'}
              </div>
            </div>
          </div>

          {/* Column 3: Confessions & Sacramental Guidance (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div>
              <span className="font-semibold text-amber-300 block text-xs tracking-wider uppercase mb-2">
                Confessions:
              </span>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                {settings.confession_schedule || 'Approach the Parish Priest at the sacristy after the mass or inform any mass servers immediately.'}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>{settings.footer_copyright || '© 2026 Parish of the Alliance of the Two Hearts. All Rights Reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
