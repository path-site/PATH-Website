import React from 'react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import ParishChurchOutlineIcon from '../common/ParishChurchOutlineIcon';

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
          <div className="relative scroll-reveal-left">
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-4/3 img-zoom-hover card-lift">
                <img
                  src={resolveMediaUrl(imageUrl)}
                  alt="About the Parish"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[#C59B3F]/30 aspect-4/3 flex flex-col items-center justify-center bg-gradient-to-br from-[#2D0A14] via-[#101E38] to-[#1C1814] p-8 text-center group">
                <ParishChurchOutlineIcon className="w-32 sm:w-36 h-auto text-[#DFBE7B] mb-4 opacity-90 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 drop-shadow-[0_4px_16px_rgba(223,190,123,0.25)]" />
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
          <div className="space-y-6 scroll-reveal-right">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 block animate-fade-in-up stagger-1">
              About the Parish
            </span>

            <h2 className="font-serif-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight animate-fade-in-up stagger-2">
              {heading}
            </h2>

            <p className="text-stone-300 text-xs sm:text-base lg:text-lg leading-relaxed font-light animate-fade-in-up stagger-3">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-3 border-t border-stone-800 text-xs sm:text-sm animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-stone-200">
                <HeartHandshake className="w-4 h-4 text-[#DFBE7B] shrink-0" />
                <span className="font-semibold">Active Ministries</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-stone-200">
                <ParishChurchOutlineIcon className="w-4 h-auto text-[#DFBE7B] shrink-0" />
                <span className="font-semibold">Daily Sacraments</span>
              </div>
            </div>

            {buttonText && buttonLink && (
              <div className="pt-4 animate-fade-in-up stagger-5">
                <Link
                  to={buttonLink}
                  className="inline-flex items-center justify-center sm:justify-start gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#DFBE7B] via-[#C59B3F] to-[#A27B27] text-stone-900 text-xs sm:text-sm font-extrabold btn-gold-glow shimmer-sweep hover:scale-105 active:scale-95 transition-all shadow-xl w-full sm:w-auto"
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
