import React from 'react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { ArrowRight, Church, Calendar } from 'lucide-react';

export default function WelcomeSection({ config = {} }) {
  const {
    heading = "A Sanctuary of Faith, Hope, and Love",
    welcomeMessage = "Welcome to our parish family! We are honored to accompany you on your spiritual journey.",
    supportingDescription = "The Parish of the Alliance of the Two Hearts is dedicated to fostering deep prayer life, reverent sacramental worship, and compassionate outreach to all parishioners and seekers.",
    imageUrl = "",
    buttonText = "About Our Parish",
    buttonLink = "/about/mission-vision",
    layout = "image-right"
  } = config;

  if (layout === 'centered' || !imageUrl) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-[#FCFBF9] border-b border-stone-200/60 relative overflow-hidden">
        {/* Subtle liturgical background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center scroll-reveal-scale">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C59B3F]/15 border border-[#C59B3F]/30 text-amber-900 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
            <Church className="w-3.5 h-3.5 text-[#C59B3F]" />
            <span>Welcome to Our Parish Family</span>
          </div>

          <h2 className="font-serif-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            {heading}
          </h2>

          {/* Liturgical Quote Card */}
          <div className="mt-6 mb-5 max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#FAF7F0] border-l-4 border-[#800020] text-stone-900 shadow-xs border border-stone-200/50">
            <p className="font-serif-heading text-sm sm:text-lg lg:text-xl font-medium italic text-[#800020] leading-relaxed">
              "{welcomeMessage}"
            </p>
          </div>

          <p className="text-xs sm:text-sm lg:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
            {supportingDescription}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {buttonText && buttonLink && (
              <Link
                to={buttonLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#800020] hover:bg-[#68001a] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>
            )}
            <Link
              to="/contact#mass-schedule"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-all border border-stone-300/80 shadow-xs active:scale-95"
            >
              <Calendar className="w-4 h-4 text-[#C59B3F]" />
              <span>Mass Schedules</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const isImageLeft = layout === 'image-left';

  return (
    <section className="py-20 lg:py-24 bg-[#FCFBF9] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isImageLeft ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Content Column */}
          <div className={`space-y-6 ${isImageLeft ? 'lg:order-2' : 'lg:order-1'} scroll-reveal-left`}>
            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
              {heading}
            </h2>

            <div className="p-5 rounded-2xl bg-amber-50/70 border-l-4 border-[#C41E3A] text-stone-800 text-base sm:text-lg font-medium leading-relaxed card-lift-sm">
              "{welcomeMessage}"
            </div>

            <p className="text-stone-600 text-base leading-relaxed">
              {supportingDescription}
            </p>

            {buttonText && buttonLink && (
              <div className="pt-2">
                <Link
                  to={buttonLink}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0B3B95] hover:bg-[#072766] text-white text-sm font-bold shadow-md ring-2 ring-[#D4AF37] hover:ring-amber-300 btn-glow transition-all"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>

          {/* Image Column */}
          {imageUrl && (
            <div className={`relative ${isImageLeft ? 'lg:order-1' : 'lg:order-2'} scroll-reveal-right`}>
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 aspect-4/3 lg:aspect-5/4 img-zoom-hover card-lift">
                <img
                  src={resolveMediaUrl(imageUrl)}
                  alt={heading}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 rounded-2xl pointer-events-none" />
              </div>
              {/* Decorative accent element */}
              <div className="absolute -bottom-4 -right-4 -z-10 w-48 h-48 bg-amber-200/50 rounded-full blur-2xl opacity-70 animate-float-slow" />
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
