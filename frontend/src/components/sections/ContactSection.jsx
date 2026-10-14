import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Phone, Mail, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function ContactSection({ config = {} }) {
  const { settings } = useTheme();
  const {
    heading = "Visit Our Parish",
    subheading = "Find our location, mass schedules, and parish office hours.",
  } = config;

  return (
    <section className="py-20 bg-stone-100/50 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Connect & Worship</span>
          </div>
          <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-2 text-stone-600 text-sm sm:text-base">
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-stagger">
          
          {/* Card 1: Mass Schedules */}
          <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs card-lift scroll-reveal">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 ring-1 ring-amber-200">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-stone-900 mb-3">
              Mass Schedules
            </h3>
            <div className="text-xs sm:text-sm text-stone-600 whitespace-pre-line leading-relaxed space-y-2">
              {settings.mass_schedules}
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100">
              <span className="text-xs font-bold text-[#6B1D2F] block mb-1 uppercase tracking-wider">
                Confessions:
              </span>
              <p className="text-xs text-stone-500 whitespace-pre-line">
                {settings.confession_schedule}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link 
                to="/contact#mass-schedule"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] hover:text-[#C59B3F] transition-colors"
              >
                <span>View Full Liturgical Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Parish Office */}
          <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs card-lift scroll-reveal">
            <div className="w-12 h-12 rounded-xl bg-[#6B1D2F]/10 text-[#6B1D2F] flex items-center justify-center mb-5 ring-1 ring-[#6B1D2F]/20">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-stone-900 mb-3">
              Office Hours
            </h3>
            <div className="text-xs sm:text-sm text-stone-600 whitespace-pre-line leading-relaxed">
              {settings.office_hours}
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Location & Directions */}
          <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs card-lift scroll-reveal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-5 ring-1 ring-stone-200">
                <MapPin className="w-6 h-6 text-[#6B1D2F]" />
              </div>
              <h3 className="font-serif-heading text-xl font-bold text-stone-900 mb-3">
                Parish Address
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {settings.address}
              </p>
              <p className="mt-3 text-xs text-stone-500 leading-relaxed">
                Located in Banawa, Cebu City. Easily accessible via public transit or private vehicles with parish parking space.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#6B1D2F] hover:text-[#541624]"
              >
                <span>Send a Message / View Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
