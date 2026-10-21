import React from 'react';
import ParishChurchOutlineIcon from './ParishChurchOutlineIcon';
import { Church, Calendar, BookOpen, Heart, ArrowRight } from 'lucide-react';

/**
 * HomePageSkeleton
 * A magnificent, church-branded architectural skeleton displayed during cold/initial loads.
 * Replaces generic blank white pages and lone spinners with an authentic liturgical preview.
 */
export default function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FCFBF9] flex flex-col select-none animate-fadeIn">
      {/* 1. Hero Slideshow Skeleton */}
      <section className="relative w-full h-[75vh] min-h-[520px] max-h-[750px] overflow-hidden bg-gradient-to-br from-[#051124] via-[#091D3C] to-[#040C1A] text-white flex flex-col justify-center items-center text-center px-4 sm:px-6">
        {/* Ambient Liturgical Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[680px] h-[500px] sm:h-[680px] rounded-full bg-[#DFBE7B]/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#0B3B95]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#A81B2B]/15 blur-3xl pointer-events-none" />

        {/* Top Gold Horizon Ribbon */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#DFBE7B]/60 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Breathing Church Outline Icon */}
          <div className="relative mb-4 sm:mb-5">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
            <ParishChurchOutlineIcon className="w-20 sm:w-28 h-auto text-amber-300 drop-shadow-[0_0_18px_rgba(223,190,123,0.45)] relative transition-all duration-700" />
          </div>

          {/* Archdiocesan Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Archdiocese of Cebu • Banawa, Cebu City</span>
          </div>

          {/* Stately Parish Headline */}
          <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md leading-tight max-w-3xl">
            Parish of the Alliance of the Two Hearts
          </h1>

          {/* Tagline */}
          <p className="mt-3 text-stone-300 text-xs sm:text-base max-w-2xl leading-relaxed font-normal">
            A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary.
          </p>

          {/* Action Buttons Placeholders */}
          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-40 h-11 sm:h-12 rounded-full bg-gradient-to-r from-[#DFBE7B] via-[#C59B3F] to-[#A27B27] opacity-80 animate-pulse shadow-lg flex items-center justify-center text-stone-900 text-xs sm:text-sm font-bold">
              <span>Loading...</span>
            </div>
            <div className="w-full sm:w-40 h-11 sm:h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center text-white/70 text-xs sm:text-sm font-semibold">
              <span>Mass Schedules</span>
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="w-7 h-1.5 rounded-full bg-[#DFBE7B] shadow-sm animate-pulse" />
          <span className="w-2 h-1.5 rounded-full bg-white/30" />
          <span className="w-2 h-1.5 rounded-full bg-white/30" />
        </div>
      </section>

      {/* 2. Welcome Section Skeleton */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#FCFBF9] border-b border-stone-200/60 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C59B3F]/15 border border-[#C59B3F]/30 text-amber-900 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4">
            <Church className="w-3.5 h-3.5 text-[#C59B3F]" />
            <span>Welcome to Our Parish Family</span>
          </div>

          {/* Heading skeleton */}
          <div className="h-8 sm:h-10 w-3/4 max-w-md mx-auto bg-stone-200/80 rounded-xl animate-pulse mb-6" />

          {/* Liturgical Quote Card Skeleton */}
          <div className="mt-4 mb-5 max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl bg-[#FAF7F0] border-l-4 border-[#800020] text-stone-900 shadow-xs border border-stone-200/50">
            <div className="space-y-2">
              <div className="h-4 w-5/6 mx-auto bg-stone-200/80 rounded-lg animate-pulse" />
              <div className="h-4 w-4/6 mx-auto bg-stone-200/80 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto mt-4">
            <div className="h-3.5 w-full bg-stone-200/70 rounded-lg animate-pulse" />
            <div className="h-3.5 w-4/5 mx-auto bg-stone-200/70 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* 3. Three Sacred Feature Cards Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Announcements Card Skeleton */}
            <div className="bg-[#FAF7F0] rounded-3xl p-6 sm:p-7 border border-[#C59B3F]/25 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#6B1D2F]/10 text-[#6B1D2F] flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-[#6B1D2F]" />
                </div>
                <div className="h-5 w-3/4 bg-stone-200/90 rounded-lg animate-pulse mb-3" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-stone-200/70 rounded animate-pulse" />
                  <div className="h-3.5 w-5/6 bg-stone-200/70 rounded animate-pulse" />
                  <div className="h-3.5 w-2/3 bg-stone-200/70 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-28 bg-stone-200/80 rounded mt-6 animate-pulse" />
            </div>

            {/* Mass Schedules Card Skeleton */}
            <div className="bg-[#FAF7F0] rounded-3xl p-6 sm:p-7 border border-[#C59B3F]/25 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#C59B3F]/15 text-[#9E7722] flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-[#9E7722]" />
                </div>
                <div className="h-5 w-3/4 bg-stone-200/90 rounded-lg animate-pulse mb-3" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-stone-200/70 rounded animate-pulse" />
                  <div className="h-3.5 w-5/6 bg-stone-200/70 rounded animate-pulse" />
                  <div className="h-3.5 w-2/3 bg-stone-200/70 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-28 bg-stone-200/80 rounded mt-6 animate-pulse" />
            </div>

            {/* Parish Community Card Skeleton */}
            <div className="bg-[#FAF7F0] rounded-3xl p-6 sm:p-7 border border-[#C59B3F]/25 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#0B3B95]/10 text-[#0B3B95] flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-[#0B3B95]" />
                </div>
                <div className="h-5 w-3/4 bg-stone-200/90 rounded-lg animate-pulse mb-3" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-stone-200/70 rounded animate-pulse" />
                  <div className="h-3.5 w-5/6 bg-stone-200/70 rounded animate-pulse" />
                  <div className="h-3.5 w-2/3 bg-stone-200/70 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-28 bg-stone-200/80 rounded mt-6 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
