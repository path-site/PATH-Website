import React from 'react';

/**
 * Architectural vector outline of the Parish of the Alliance of the Two Hearts (Banawa, Cebu City).
 * Modeled after the parish church facade featuring the iconic pitched pediment roof,
 * louvered vent, cross-topped arched entrance, Eucharistic sunburst chapel with the Holy Spirit dove,
 * and the Alliance of the Two Hearts foreground motif.
 */
export default function ParishChurchOutlineIcon({
  className = "w-24 h-16 text-[#DFBE7B]",
  strokeWidth = 1.75,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 282 170"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Main Roof */}
      <path d="M 141 19 L 24 66" />
      <path d="M 141 19 L 258 66" />
      <path d="M 22 69 L 141 22 L 260 69" />
      <path d="M 24 69 L 258 69" />

      {/* Louver Pediment Triangle */}
      <polygon points="141,24 109,39 173,39" strokeWidth={1.5} />
      <line x1="141" y1="24" x2="141" y2="39" strokeWidth={1.2} />
      <line x1="127" y1="31" x2="127" y2="39" strokeWidth={1.2} />
      <line x1="155" y1="31" x2="155" y2="39" strokeWidth={1.2} />
      <line x1="125" y1="29" x2="157" y2="29" strokeWidth={1} />
      <line x1="119" y1="33" x2="163" y2="33" strokeWidth={1} />
      <line x1="113" y1="37" x2="169" y2="37" strokeWidth={1} />

      {/* Left Bay (Main Entrance) */}
      <line x1="24" y1="69" x2="24" y2="133" />
      <line x1="32" y1="78" x2="32" y2="133" strokeWidth={1.2} />
      <line x1="43" y1="78" x2="43" y2="133" strokeWidth={1.2} />
      <line x1="24" y1="96" x2="75" y2="96" />

      {/* Cross atop Entrance */}
      <line x1="92" y1="69" x2="92" y2="81" strokeWidth={1.75} />
      <line x1="88" y1="73" x2="96" y2="73" strokeWidth={1.75} />
      <line x1="89" y1="77" x2="95" y2="77" strokeWidth={1.2} />

      {/* Entrance Arch */}
      <path d="M 74 98 A 18 18 0 0 1 110 98" />
      <path d="M 77 98 A 15 15 0 0 1 107 98" strokeWidth={1.2} />
      <line x1="74" y1="98" x2="74" y2="132" />
      <line x1="110" y1="98" x2="110" y2="132" />

      {/* Entrance Door Panels & Crosses */}
      <line x1="83" y1="98" x2="83" y2="132" strokeWidth={1.2} />
      <line x1="92" y1="98" x2="92" y2="132" strokeWidth={1.2} />
      <line x1="101" y1="98" x2="101" y2="132" strokeWidth={1.2} />
      {/* Panel 1 Cross */}
      <line x1="78.5" y1="106" x2="78.5" y2="123" strokeWidth={1.2} />
      <line x1="76" y1="111" x2="81" y2="111" strokeWidth={1.2} />
      {/* Panel 2 Cross */}
      <line x1="87.5" y1="106" x2="87.5" y2="123" strokeWidth={1.2} />
      <line x1="85" y1="111" x2="90" y2="111" strokeWidth={1.2} />
      {/* Panel 3 Cross */}
      <line x1="96.5" y1="106" x2="96.5" y2="123" strokeWidth={1.2} />
      <line x1="94" y1="111" x2="99" y2="111" strokeWidth={1.2} />
      {/* Panel 4 Cross */}
      <line x1="105.5" y1="106" x2="105.5" y2="123" strokeWidth={1.2} />
      <line x1="103" y1="111" x2="108" y2="111" strokeWidth={1.2} />

      {/* Front Steps */}
      <line x1="35" y1="136" x2="111" y2="136" />
      <line x1="30" y1="142" x2="115" y2="142" />
      <line x1="25" y1="148" x2="119" y2="148" />
      <line x1="21" y1="154" x2="123" y2="154" />
      <line x1="35" y1="133" x2="21" y2="154" />
      <line x1="111" y1="133" x2="123" y2="154" />

      {/* Center Bay */}
      <line x1="110" y1="78" x2="180" y2="78" />
      <rect x="120" y="84" width="7" height="6" rx="0.5" strokeWidth={1.2} />
      <rect x="131" y="84" width="7" height="6" rx="0.5" strokeWidth={1.2} />
      <rect x="142" y="84" width="7" height="6" rx="0.5" strokeWidth={1.2} />

      {/* Center Doors */}
      <rect x="111" y="104" width="20" height="28" strokeWidth={1.2} />
      <line x1="121" y1="104" x2="121" y2="132" strokeWidth={1.2} />
      {/* Center Door Crosses */}
      <line x1="116" y1="109" x2="116" y2="124" strokeWidth={1.2} />
      <line x1="113.5" y1="114" x2="118.5" y2="114" strokeWidth={1.2} />
      <line x1="126" y1="109" x2="126" y2="124" strokeWidth={1.2} />
      <line x1="123.5" y1="114" x2="128.5" y2="114" strokeWidth={1.2} />

      {/* Center Glass Facade */}
      <line x1="131" y1="104" x2="180" y2="104" />
      <line x1="131" y1="132" x2="180" y2="132" />
      <line x1="148" y1="104" x2="148" y2="132" strokeWidth={1} />
      <line x1="164" y1="104" x2="164" y2="132" strokeWidth={1} />

      {/* Right Bay (Sanctuary / Chapel) */}
      <line x1="180" y1="68" x2="180" y2="132" />
      <line x1="180" y1="68" x2="258" y2="68" />
      <rect x="184" y="63" width="6" height="5" strokeWidth={1.2} />
      <rect x="225" y="63" width="6" height="5" strokeWidth={1.2} />
      <line x1="258" y1="68" x2="258" y2="132" />
      <line x1="248" y1="100" x2="248" y2="132" strokeWidth={1.2} />

      {/* Decorative Frieze Band */}
      <line x1="180" y1="94" x2="258" y2="94" />
      <line x1="180" y1="98" x2="258" y2="98" />

      {/* Chapel Arch */}
      <path d="M 199 128 V 92 A 21 21 0 0 1 241 92 V 128" strokeWidth={1.75} />
      <path d="M 203 128 V 92 A 17 17 0 0 1 237 92 V 128" strokeWidth={1.2} />

      {/* Holy Spirit Medallion & Dove */}
      <circle cx="220" cy="93" r="8" strokeWidth={1.5} />
      <path
        d="M 216 93.5 C 218 90.5 222 90.5 224 93.5 C 222 96 220 94.5 218 96 C 217 95 216 94 216 93.5 Z"
        fill="currentColor"
        stroke="none"
      />

      {/* Sunburst Rays */}
      <line x1="220" y1="85" x2="220" y2="77" strokeWidth={1} />
      <line x1="225" y1="86" x2="231" y2="79" strokeWidth={1} />
      <line x1="227.5" y1="89.5" x2="235" y2="85" strokeWidth={1} />
      <line x1="228" y1="93" x2="236.5" y2="93" strokeWidth={1} />
      <line x1="226.5" y1="98" x2="234" y2="116" strokeWidth={1} />
      <line x1="223.5" y1="100.5" x2="227" y2="121" strokeWidth={1} />
      <line x1="216.5" y1="100.5" x2="213" y2="121" strokeWidth={1} />
      <line x1="213.5" y1="98" x2="206" y2="116" strokeWidth={1} />
      <line x1="212" y1="93" x2="203.5" y2="93" strokeWidth={1} />
      <line x1="212.5" y1="89.5" x2="205" y2="85" strokeWidth={1} />
      <line x1="215" y1="86" x2="209" y2="79" strokeWidth={1} />

      {/* Foreground Figures & Alliance of the Two Hearts */}
      <path
        d="M 142 133 C 142 127 143.5 124 144.5 123 C 145.5 124 147 127 147 133 Z"
        strokeWidth={1.2}
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M 147.5 133 C 147.5 127 149 124 150 123 C 151 124 152.5 127 152.5 133 Z"
        strokeWidth={1.2}
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Two Hearts */}
      <path
        d="M 141 138 C 137.5 134 133.5 137.5 137.5 142.5 L 141 146 L 144.5 142.5 C 148.5 137.5 144.5 134 141 138 Z"
        strokeWidth={1.2}
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M 148 138 C 144.5 134 140.5 137.5 144.5 142.5 L 148 146 L 151.5 142.5 C 155.5 137.5 151.5 134 148 138 Z"
        strokeWidth={1.2}
        fill="currentColor"
        fillOpacity="0.3"
      />

      {/* Plaza / Driveway */}
      <line x1="180" y1="132" x2="258" y2="132" />
      <line x1="180" y1="145" x2="256" y2="145" />
      <path d="M 123 154 Q 185 137 256 151" />
      <path d="M 123 157 Q 185 141 256 155" strokeWidth={1.2} />
    </svg>
  );
}
