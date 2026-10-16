import React, { useState, useEffect } from 'react';

/**
 * ParishChurchSplashScreen
 * Displays an enlarged, animated architectural line-drawing transition of the
 * Parish of the Alliance of the Two Hearts church facade.
 * 
 * Each vector architectural line materializes in sequence (roof, pediment, cross,
 * arches, sanctuary chapel, radiant sunburst rays, and the Two Hearts motif).
 */
export default function ParishChurchSplashScreen({
  onComplete,
  minDuration = 2800,
  isReady = true,
}) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Ensure the majestic line drawing has time to play its full animation
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    // When both minimum display duration has passed and background data is ready:
    if (minTimeElapsed && isReady && !isFadingOut) {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800); // matches duration-800
      return () => clearTimeout(exitTimer);
    }
  }, [minTimeElapsed, isReady, isFadingOut, onComplete]);

  return (
    <div
      aria-label="Loading Parish of the Alliance of the Two Hearts"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#020914] via-[#051329] to-[#0A2250] text-white selection:bg-[#D4AF37] selection:text-stone-900 overflow-hidden cursor-default select-none ${isFadingOut
        ? 'opacity-0 scale-[1.03] pointer-events-none transition-all duration-800 ease-in-out'
        : 'opacity-100 scale-100 pointer-events-auto'
        }`}
    >
      {/* Decorative Golden & Marian Ambient Atmospheric Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full bg-[#DFBE7B]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#A81B2B]/15 blur-3xl pointer-events-none" />

      {/* Liturgical Top Gold Ribbon */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFBE7B] to-transparent opacity-80" />

      {/* Main Splash Content Container */}
      <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 flex flex-col items-center text-center">

        {/* ENLARGED ARCHITECTURAL CHURCH OUTLINE WITH COOL STAGGERED LINE TRANSITIONS */}
        <div className="w-full max-w-[340px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[660px] mx-auto filter drop-shadow-[0_0_25px_rgba(223,190,123,0.35)] church-glow-filter">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 282 170"
            fill="none"
            stroke="#DFBE7B"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-auto"
          >
            {/* 1. Main Roof Pitched Gable Outline */}
            <path d="M 141 19 L 24 66" strokeWidth={2} className="church-stroke-roof" />
            <path d="M 141 19 L 258 66" strokeWidth={2} className="church-stroke-roof" />
            <path d="M 22 69 L 141 22 L 260 69" strokeWidth={2.2} className="church-stroke-roof" />
            <path d="M 24 69 L 258 69" strokeWidth={1.8} className="church-stroke-roof" />

            {/* 2. Louver Pediment Triangle & Vents */}
            <polygon points="141,24 109,39 173,39" strokeWidth={1.5} className="church-stroke-pediment" />
            <line x1="141" y1="24" x2="141" y2="39" strokeWidth={1.3} className="church-stroke-pediment" />
            <line x1="127" y1="31" x2="127" y2="39" strokeWidth={1.2} className="church-stroke-pediment" />
            <line x1="155" y1="31" x2="155" y2="39" strokeWidth={1.2} className="church-stroke-pediment" />
            <line x1="125" y1="29" x2="157" y2="29" strokeWidth={1} className="church-stroke-pediment" />
            <line x1="119" y1="33" x2="163" y2="33" strokeWidth={1} className="church-stroke-pediment" />
            <line x1="113" y1="37" x2="169" y2="37" strokeWidth={1} className="church-stroke-pediment" />

            {/* 3. Left Bay: Main Entrance Columns & Frieze */}
            <line x1="24" y1="69" x2="24" y2="133" strokeWidth={1.8} className="church-stroke-entrance" />
            <line x1="32" y1="78" x2="32" y2="133" strokeWidth={1.3} className="church-stroke-entrance" />
            <line x1="43" y1="78" x2="43" y2="133" strokeWidth={1.3} className="church-stroke-entrance" />
            <line x1="24" y1="96" x2="75" y2="96" strokeWidth={1.3} className="church-stroke-entrance" />

            {/* Cross Atop Main Entrance */}
            <line x1="92" y1="69" x2="92" y2="81" strokeWidth={2} stroke="#FFE29A" className="church-stroke-entrance" />
            <line x1="88" y1="73" x2="96" y2="73" strokeWidth={2} stroke="#FFE29A" className="church-stroke-entrance" />
            <line x1="89" y1="77" x2="95" y2="77" strokeWidth={1.3} stroke="#FFE29A" className="church-stroke-entrance" />

            {/* Entrance Arches */}
            <path d="M 74 98 A 18 18 0 0 1 110 98" strokeWidth={1.8} className="church-stroke-entrance" />
            <path d="M 77 98 A 15 15 0 0 1 107 98" strokeWidth={1.2} className="church-stroke-entrance" />
            <line x1="74" y1="98" x2="74" y2="132" strokeWidth={1.6} className="church-stroke-entrance" />
            <line x1="110" y1="98" x2="110" y2="132" strokeWidth={1.6} className="church-stroke-entrance" />

            {/* Entrance Door Panels & 4 Crosses */}
            <line x1="83" y1="98" x2="83" y2="132" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="92" y1="98" x2="92" y2="132" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="101" y1="98" x2="101" y2="132" strokeWidth={1.2} className="church-stroke-doors" />

            {/* Panel 1 Cross */}
            <line x1="78.5" y1="106" x2="78.5" y2="123" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="76" y1="111" x2="81" y2="111" strokeWidth={1.2} className="church-stroke-doors" />
            {/* Panel 2 Cross */}
            <line x1="87.5" y1="106" x2="87.5" y2="123" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="85" y1="111" x2="90" y2="111" strokeWidth={1.2} className="church-stroke-doors" />
            {/* Panel 3 Cross */}
            <line x1="96.5" y1="106" x2="96.5" y2="123" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="94" y1="111" x2="99" y2="111" strokeWidth={1.2} className="church-stroke-doors" />
            {/* Panel 4 Cross */}
            <line x1="105.5" y1="106" x2="105.5" y2="123" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="103" y1="111" x2="108" y2="111" strokeWidth={1.2} className="church-stroke-doors" />

            {/* Front Steps */}
            <line x1="35" y1="136" x2="111" y2="136" strokeWidth={1.4} className="church-stroke-steps" />
            <line x1="30" y1="142" x2="115" y2="142" strokeWidth={1.4} className="church-stroke-steps" />
            <line x1="25" y1="148" x2="119" y2="148" strokeWidth={1.4} className="church-stroke-steps" />
            <line x1="21" y1="154" x2="123" y2="154" strokeWidth={1.4} className="church-stroke-steps" />
            <line x1="35" y1="133" x2="21" y2="154" strokeWidth={1.4} className="church-stroke-steps" />
            <line x1="111" y1="133" x2="123" y2="154" strokeWidth={1.4} className="church-stroke-steps" />

            {/* 4. Center Bay & Glass Facade */}
            <line x1="110" y1="78" x2="180" y2="78" strokeWidth={1.5} className="church-stroke-entrance" />
            <rect x="120" y="84" width="7" height="6" rx="0.5" strokeWidth={1.2} className="church-stroke-entrance" />
            <rect x="131" y="84" width="7" height="6" rx="0.5" strokeWidth={1.2} className="church-stroke-entrance" />
            <rect x="142" y="84" width="7" height="6" rx="0.5" strokeWidth={1.2} className="church-stroke-entrance" />

            {/* Center Doors */}
            <rect x="111" y="104" width="20" height="28" strokeWidth={1.4} className="church-stroke-doors" />
            <line x1="121" y1="104" x2="121" y2="132" strokeWidth={1.2} className="church-stroke-doors" />
            {/* Center Door Crosses */}
            <line x1="116" y1="109" x2="116" y2="124" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="113.5" y1="114" x2="118.5" y2="114" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="126" y1="109" x2="126" y2="124" strokeWidth={1.2} className="church-stroke-doors" />
            <line x1="123.5" y1="114" x2="128.5" y2="114" strokeWidth={1.2} className="church-stroke-doors" />

            {/* Center Glass Facade Lines */}
            <line x1="131" y1="104" x2="180" y2="104" strokeWidth={1.3} className="church-stroke-entrance" />
            <line x1="131" y1="132" x2="180" y2="132" strokeWidth={1.3} className="church-stroke-entrance" />
            <line x1="148" y1="104" x2="148" y2="132" strokeWidth={1} className="church-stroke-doors" />
            <line x1="164" y1="104" x2="164" y2="132" strokeWidth={1} className="church-stroke-doors" />

            {/* 5. Right Bay (Sanctuary / Eucharistic Sunburst Chapel) */}
            <line x1="180" y1="68" x2="180" y2="132" strokeWidth={1.6} className="church-stroke-chapel" />
            <line x1="180" y1="68" x2="258" y2="68" strokeWidth={1.6} className="church-stroke-chapel" />
            <rect x="184" y="63" width="6" height="5" strokeWidth={1.2} className="church-stroke-chapel" />
            <rect x="225" y="63" width="6" height="5" strokeWidth={1.2} className="church-stroke-chapel" />
            <line x1="258" y1="68" x2="258" y2="132" strokeWidth={1.6} className="church-stroke-chapel" />
            <line x1="248" y1="100" x2="248" y2="132" strokeWidth={1.2} className="church-stroke-chapel" />

            {/* Decorative Frieze Band */}
            <line x1="180" y1="94" x2="258" y2="94" strokeWidth={1.2} className="church-stroke-chapel" />
            <line x1="180" y1="98" x2="258" y2="98" strokeWidth={1.2} className="church-stroke-chapel" />

            {/* Chapel Arch */}
            <path d="M 199 128 V 92 A 21 21 0 0 1 241 92 V 128" strokeWidth={2} stroke="#FFE29A" className="church-stroke-chapel" />
            <path d="M 203 128 V 92 A 17 17 0 0 1 237 92 V 128" strokeWidth={1.3} className="church-stroke-chapel" />

            {/* Holy Spirit Medallion & Dove */}
            <circle cx="220" cy="93" r="8" strokeWidth={1.8} stroke="#FFE29A" className="church-stroke-circle" />
            <path
              d="M 216 93.5 C 218 90.5 222 90.5 224 93.5 C 222 96 220 94.5 218 96 C 217 95 216 94 216 93.5 Z"
              fill="#FFE29A"
              stroke="none"
              className="animate-fade-in-scale"
              style={{ animationDelay: '1.1s' }}
            />

            {/* 6. Eucharistic Sunburst Rays Shooting Outward with Radiant Transitions */}
            <line x1="220" y1="85" x2="220" y2="77" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '0.95s' }} />
            <line x1="225" y1="86" x2="231" y2="79" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.0s' }} />
            <line x1="227.5" y1="89.5" x2="235" y2="85" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.05s' }} />
            <line x1="228" y1="93" x2="236.5" y2="93" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.1s' }} />
            <line x1="226.5" y1="98" x2="234" y2="116" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.15s' }} />
            <line x1="223.5" y1="100.5" x2="227" y2="121" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.2s' }} />
            <line x1="216.5" y1="100.5" x2="213" y2="121" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.25s' }} />
            <line x1="213.5" y1="98" x2="206" y2="116" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.3s' }} />
            <line x1="212" y1="93" x2="203.5" y2="93" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.35s' }} />
            <line x1="212.5" y1="89.5" x2="205" y2="85" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.4s' }} />
            <line x1="215" y1="86" x2="209" y2="79" strokeWidth={1.4} stroke="#FFF0C2" className="church-stroke-sunburst" style={{ animationDelay: '1.45s' }} />

            {/* 7. Foreground Figures & Sacred Alliance of the Two Hearts Motif */}
            <path
              d="M 142 133 C 142 127 143.5 124 144.5 123 C 145.5 124 147 127 147 133 Z"
              strokeWidth={1.4}
              stroke="#DFBE7B"
              fill="#DFBE7B"
              fillOpacity="0.25"
              className="church-stroke-doors"
            />
            <path
              d="M 147.5 133 C 147.5 127 149 124 150 123 C 151 124 152.5 127 152.5 133 Z"
              strokeWidth={1.4}
              stroke="#DFBE7B"
              fill="#DFBE7B"
              fillOpacity="0.25"
              className="church-stroke-doors"
            />

            {/* Sacred Heart of Jesus (Flame & Cross Motif) */}
            <path
              d="M 141 138 C 137.5 134 133.5 137.5 137.5 142.5 L 141 146 L 144.5 142.5 C 148.5 137.5 144.5 134 141 138 Z"
              strokeWidth={1.5}
              stroke="#E05263"
              fill="#A81B2B"
              fillOpacity="0.45"
              className="church-stroke-hearts"
            />
            {/* Immaculate Heart of Mary (Lilies / Radiance Motif) */}
            <path
              d="M 148 138 C 144.5 134 140.5 137.5 144.5 142.5 L 148 146 L 151.5 142.5 C 155.5 137.5 151.5 134 148 138 Z"
              strokeWidth={1.5}
              stroke="#4A90E2"
              fill="#0B3B95"
              fillOpacity="0.45"
              className="church-stroke-hearts"
            />

            {/* 8. Plaza Driveway Curves */}
            <line x1="180" y1="132" x2="258" y2="132" strokeWidth={1.4} className="church-stroke-steps" />
            <line x1="180" y1="145" x2="256" y2="145" strokeWidth={1.4} className="church-stroke-steps" />
            <path d="M 123 154 Q 185 137 256 151" strokeWidth={1.6} className="church-stroke-steps" />
            <path d="M 123 157 Q 185 141 256 155" strokeWidth={1.3} className="church-stroke-steps" />
          </svg>
        </div>

        {/* Golden Shimmering Loading Line Beam Underneath Church */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center animate-fade-in-up stagger-3">
          <div className="w-48 sm:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#DFBE7B] to-transparent"
              style={{
                animation: 'splashShimmerSweep 1.5s infinite ease-in-out'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
