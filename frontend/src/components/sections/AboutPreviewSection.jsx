import React from 'react';
import { Link } from 'react-router-dom';
import { Church, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function AboutPreviewSection({ config = {} }) {
  const {
    heading = "Rooted in Faith, Growing in Fellowship",
    description = "Established with deep reverence to the Sacred Heart of Jesus and the Immaculate Heart of Mary, our parish stands as a spiritual home for countless families in the diocese.",
    buttonText = "Discover Our History",
    buttonLink = "/about/history",
    imageUrl = ""
  } = config;

  return (
    <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Images / Heritage Card */}
          <div className="relative">
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-4/3 img-zoom-hover card-lift">
                <img
                  src={imageUrl}
                  alt="About the Parish"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[#C59B3F]/30 aspect-4/3 flex flex-col items-center justify-center bg-gradient-to-br from-[#2D0A14] via-[#101E38] to-[#1C1814] p-8 text-center">
                <Church className="w-16 h-16 text-[#DFBE7B] mb-4 opacity-80" />
                <h3 className="font-serif-heading text-lg font-bold text-amber-200">Parish of the Alliance of the Two Hearts</h3>
                <p className="text-xs text-stone-300 mt-2 max-w-xs">Archdiocese of Cebu • Banawa, Cebu City</p>
              </div>
            )}
            {/* Overlay card */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#FAF7F0] text-stone-900 p-5 rounded-2xl shadow-2xl max-w-xs border-l-4 border-[#C59B3F] border border-[#C59B3F]/30 hidden sm:block animate-float-slow card-lift-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A81B2B] mb-1">
                <ShieldCheck className="w-4 h-4 text-[#C59B3F]" />
                <span>Our Heritage</span>
              </div>
              <p className="text-xs text-stone-700 font-medium leading-relaxed">
                Devoted to the Sacred Hearts of Jesus & Mary in Banawa, Cebu City since 1988.
              </p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C59B3F]/20 border border-[#C59B3F]/50 text-amber-200 text-xs font-bold uppercase tracking-wider animate-fade-in-up stagger-1">
              <Church className="w-3.5 h-3.5 text-[#DFBE7B]" />
              <span>About the Parish</span>
            </div>

            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight animate-fade-in-up stagger-2">
              {heading}
            </h2>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed font-light animate-fade-in-up stagger-3">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-800 text-sm animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2 text-stone-300">
                <HeartHandshake className="w-4 h-4 text-[#DFBE7B]" />
                <span>Active Ministries</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Church className="w-4 h-4 text-[#DFBE7B]" />
                <span>Daily Sacraments</span>
              </div>
            </div>

            {buttonText && buttonLink && (
              <div className="pt-4 animate-fade-in-up stagger-5">
                <Link
                  to={buttonLink}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#DFBE7B] via-[#C59B3F] to-[#A27B27] text-stone-900 text-sm font-extrabold btn-gold-glow shimmer-sweep transition-all shadow-xl"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-stone-900 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
