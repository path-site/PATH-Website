import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlideshow({ config = {} }) {
  const slides = config.slides && config.slides.length > 0 ? config.slides : [
    {
      imageUrl: "",
      title: "Welcome to the Parish of the Alliance of the Two Hearts",
      description: "A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary.",
      buttonText: "Learn More",
      buttonLink: "/about/mission-vision",
      overlayOpacity: 0.45
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplay = config.autoplay !== false;
  const intervalSeconds = config.intervalSeconds || 6;
  const timerRef = useRef(null);

  useEffect(() => {
    if (autoplay && slides.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, intervalSeconds * 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, intervalSeconds, slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section className="relative w-full h-[75vh] min-h-[500px] max-h-[750px] overflow-hidden bg-stone-900 text-white select-none">
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title || 'Parish slide'}
              className="w-full h-full object-cover object-center scale-105 transform transition-transform duration-[8000ms] ease-out motion-safe:scale-100"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2D0A14] via-[#101E38] to-[#0A0D14]" />
          )}
          {/* Overlay with customizable opacity */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25"
            style={{ opacity: slide.overlayOpacity !== undefined ? slide.overlayOpacity + 0.3 : 0.65 }}
          />
        </div>
      ))}

      {/* Slide Content Overlay with smooth staggered entrance on slide change */}
      <div 
        key={currentIndex} 
        className="relative z-20 max-w-5xl mx-auto h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8"
      >
        <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl drop-shadow-md animate-fade-in-up stagger-1">
          {currentSlide.title}
        </h1>
        {currentSlide.description && (
          <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-stone-100 max-w-2xl font-normal leading-relaxed drop-shadow-xs animate-fade-in-up stagger-2">
            {currentSlide.description}
          </p>
        )}
        {currentSlide.buttonText && currentSlide.buttonLink && (
          <div className="mt-8 flex items-center justify-center animate-fade-in-up stagger-3">
            <Link
              to={currentSlide.buttonLink}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm sm:text-base font-extrabold bg-gradient-to-r from-[#DFBE7B] via-[#C59B3F] to-[#A27B27] text-stone-900 shadow-xl border border-amber-200/50 btn-gold-glow shimmer-sweep transition-all"
            >
              {currentSlide.buttonText}
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-xs border border-white/20 transition-all hover:scale-105"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-xs border border-white/20 transition-all hover:scale-105"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-8 bg-amber-400 shadow-sm'
                  : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
