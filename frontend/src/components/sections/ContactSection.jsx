import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme, resolveContactNumbers } from '../../context/ThemeContext';
import { MapPin, Phone, Smartphone, Mail, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function ContactSection({ config = {} }) {
  const { settings } = useTheme();
  const { telephone, mobile } = resolveContactNumbers(settings);
  const {
    heading = "Visit Our Parish",
    subheading = "Find our location, mass schedules, and parish office hours.",
  } = config;

  return (
    <section className="py-20 bg-stone-100/50 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
            Connect & Worship
          </span>
          <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-2 text-stone-600 text-sm sm:text-base">
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 scroll-stagger">
          
          {/* Card 1: Mass Schedules */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs card-lift scroll-reveal flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 sm:mb-5 ring-1 ring-amber-200">
                <Calendar className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-stone-900 mb-2.5">
                Mass Schedules
              </h3>
              <div className="text-xs sm:text-sm text-stone-600 whitespace-pre-line leading-relaxed space-y-2">
                {settings.mass_schedules}
              </div>
              <div className="mt-4 pt-3.5 border-t border-stone-100">
                <span className="text-[11px] font-bold text-[#800020] block mb-1 uppercase tracking-wider">
                  Confessions:
                </span>
                <p className="text-xs text-stone-500 whitespace-pre-line leading-relaxed">
                  {settings.confession_schedule || 'Approach the Parish Priest at the sacristy after the mass or inform any mass servers immediately.'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link 
                to="/contact#mass-schedule"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] hover:text-[#C59B3F] transition-colors"
              >
                <span>View Full Liturgical Schedule</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </Link>
            </div>
          </div>

          {/* Card 2: Parish Office */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs card-lift scroll-reveal flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center mb-4 sm:mb-5 ring-1 ring-[#800020]/20">
                <Clock className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-stone-900 mb-2.5">
                Office Hours
              </h3>
              <div className="text-xs sm:text-sm text-stone-600 whitespace-pre-line leading-relaxed">
                {settings.office_hours || 'Monday – Sunday:\n8:00 AM – 12:00 NN, 1:00 PM – 5:00 PM'}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 space-y-2.5">
              {telephone && (
                <a 
                  href={`tel:${telephone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-xs text-stone-700 hover:text-[#800020] font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Tel: {telephone}</span>
                </a>
              )}
              {mobile && (
                <a 
                  href={`tel:${mobile.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-xs text-stone-700 hover:text-[#800020] font-medium transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Mobile: {mobile}</span>
                </a>
              )}
              <a 
                href={`mailto:${settings.email || 'pathbanawa1988@gmail.com'}`}
                className="flex items-center gap-2 text-xs text-stone-700 hover:text-[#800020] font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{settings.email || 'pathbanawa1988@gmail.com'}</span>
              </a>
            </div>
          </div>

          {/* Card 3: Location & Directions */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs card-lift scroll-reveal flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-4 sm:mb-5 ring-1 ring-stone-200">
                <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-[#800020]" />
              </div>
              <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-stone-900 mb-2.5">
                Parish Address
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                {settings.address || 'J. Fortich St., Banawa, Cebu City, Philippines'}
              </p>
              <p className="mt-2.5 text-xs text-stone-500 leading-relaxed">
                Located in Banawa, Cebu City. Easily accessible via public transit or private vehicles with parish parking space.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Parish+of+the+Alliance+of+the+Two+Hearts+Banawa+Cebu+City"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] hover:text-[#C59B3F] transition-colors"
              >
                <span>Get Directions / View on Google Maps</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
