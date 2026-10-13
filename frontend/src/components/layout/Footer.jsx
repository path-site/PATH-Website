import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Church, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FacebookIcon } from '../common/SocialIcons';

export default function Footer() {
  const { settings } = useTheme();

  return (
    <footer className="bg-[#071838] text-stone-200 border-t-4 border-[#D4AF37] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Parish Identity */}
          <div className="space-y-4">
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
            <p className="text-sm text-stone-300 leading-relaxed italic">
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

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif-heading text-white text-base font-semibold mb-4 tracking-wide uppercase text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C41E3A]"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-300 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-amber-300 transition-colors">Parish Announcements</Link>
              </li>
              <li>
                <Link to="/about/mission-vision" className="hover:text-amber-300 transition-colors">Mission & Vision</Link>
              </li>
              <li>
                <Link to="/about/history" className="hover:text-amber-300 transition-colors">History of the Church</Link>
              </li>
              <li>
                <Link to="/about/priests" className="hover:text-amber-300 transition-colors">Pastoral Clergy</Link>
              </li>
              <li>
                <Link to="/ministries" className="hover:text-amber-300 transition-colors">Ministries</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-amber-300 transition-colors">Events & Activities</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-amber-300 transition-colors">Photo Gallery</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">Contact & Mass Schedules</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-serif-heading text-white text-base font-semibold mb-4 tracking-wide uppercase text-amber-400/90">
              Parish Office
            </h4>
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-400">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-400">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.email}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-stone-400 pt-1">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <div className="whitespace-pre-line text-xs leading-relaxed">
                {settings.office_hours}
              </div>
            </div>
          </div>

          {/* Column 4: Liturgical Schedules */}
          <div>
            <div className="mt-4 text-xs text-stone-400">
              <span className="font-semibold text-amber-300 block mb-1">Confessions:</span>
              <p className="whitespace-pre-line">{settings.confession_schedule}</p>
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
