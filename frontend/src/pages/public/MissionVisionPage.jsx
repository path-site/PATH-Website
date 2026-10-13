import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import { Heart, Compass, Shield, BookOpen, Church, Leaf, Users, CheckCircle2 } from 'lucide-react';

const defaultMissionVisionData = {
  vision: "Katilingban sa parokya nga nagpuyo sa Ebanghelyo ug nagkahiusa sa panaw sa pagtoo paingon sa kapuno sa kinabuhi dinasig sa gugma ni Hesus ug Maria",
  missionPoints: [
    "Ang paghimo ug mga kalihukan alang sa lawas ug kalag aron pagtabang sa mga tao nga makakaplag sa Ginoo, sa pag-amuma sa ilang pagtuo, sa pagtugkad sa katuyuan sa kinabuhi, ug paghimo sa kabag-uhan.",
    "Ang pagpakiglambigit sa mga labing kabus aron pagtabang kanila sa pagkab-ot ug malambuong kinabuhi",
    "Ang paghatag ug kadasig sa katawhan nga magpuyo sa Kristohanong kinabuhi uban sa mga maayong buhat ni Maria",
    "Pagpahigmata ug pagpahinumdum sa atong kaakuhan sa pag-amoma sa kalikopan"
  ],
  pathways: [
    { letter: "P", title: "Persevering Commitment", cebuano: "Pagkamalahutayon nga mobuhat sa kaakohan" },
    { letter: "A", title: "Ardent Care for others", cebuano: "Anaa ang kadasig nga Moatiman sa uban" },
    { letter: "T", title: "Trustworthiness", cebuano: "Tinoud nga kasaligan" },
    { letter: "H", title: "Honesty", cebuano: "Hilom sa kamatinud-anon" },
    { letter: "W", title: "Wisdom", cebuano: "Walay hunong nagtamod sa Diosnong kaalam" },
    { letter: "A", title: "Achieving Cooperation and Fairness", cebuano: "Andam mopuyo diha sa pagtinabangay og kaangayan" },
    { letter: "Y", title: "Yearning Social Responsibility", cebuano: "Yanong nagtuman sa katilingbanong responsabilidad" },
    { letter: "S", title: "Servant Leadership", cebuano: "Sulogoon nga pangulo" }
  ],
  hearts: [
    { letter: "H", title: "Helping others", cebuano: "Tabang, Abag, Alagad" },
    { letter: "E", motive: "Ecological Awareness", title: "Ecological Awareness", cebuano: "Pagmangon sa kalikupan" },
    { letter: "A", title: "Accountability", cebuano: "Andam motubag sa kaakohan" },
    { letter: "R", title: "Respect", cebuano: "Pagtahod" },
    { letter: "T", title: "Truth", cebuano: "Tinoud" },
    { letter: "S", title: "Solidarity and Sustainability", cebuano: "Sa kanunay nagdasig sa panaghiusa og pagpadayon" }
  ]
};

export default function MissionVisionPage() {
  const [data, setData] = useState(defaultMissionVisionData);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await publicApi.getPage('mission-vision');
        const pageData = res?.data || res;
        if (pageData && pageData.sections && pageData.sections.length > 0) {
          const sec = pageData.sections[0];
          if (sec.contentJson) {
            const parsed = typeof sec.contentJson === 'string' ? JSON.parse(sec.contentJson) : sec.contentJson;
            if (parsed.vision) {
              setData(prev => ({ ...prev, ...parsed }));
            }
          }
        }
      } catch (err) {
        // Fallback to official default
      }
    };
    fetchPage();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EB] py-14 lg:py-20 text-[#1C1814]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ribbon / Identification */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F0] text-amber-900 text-xs font-bold uppercase tracking-wider mb-4 border border-[#C59B3F]/50 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#A81B2B] inline-block ring-1 ring-[#C59B3F]"></span>
            <span>Spiritual Identity & Purpose</span>
          </div>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-extrabold text-[#1C1814] tracking-tight leading-tight uppercase">
            Vision, Mission & Core Values
          </h1>
          <p className="mt-3 text-stone-600 text-sm sm:text-base font-semibold tracking-wide uppercase text-amber-800">
            Parish of the Alliance of the Two Hearts • Banawa, Cebu City
          </p>
        </div>

        {/* Section 1: Official Parish VISION Card */}
        <div className="mb-16 animate-fade-in-up stagger-1">
          <div className="relative bg-[#FAF7F0] rounded-3xl p-8 sm:p-12 border-2 border-[#C59B3F]/40 shadow-md overflow-hidden card-lift shimmer-sweep">
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#DFBE7B] via-[#C59B3F] to-[#A81B2B]" />
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DFBE7B] to-[#C59B3F] text-stone-900 flex items-center justify-center shrink-0 shadow-md animate-float-slow">
                <Heart className="w-8 h-8 text-[#A81B2B] fill-[#A81B2B]/20" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest text-amber-800 uppercase block mb-1">
                  Panlantaw sa Parokya
                </span>
                <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#1C1814] tracking-tight uppercase">
                  VISION
                </h2>
              </div>
            </div>

            <blockquote className="p-6 sm:p-8 rounded-2xl bg-[#F4EEDB] border-l-4 border-[#C59B3F] shadow-xs">
              <p className="font-serif-heading text-xl sm:text-2xl lg:text-3xl font-bold text-[#1C1814] leading-relaxed italic text-center sm:text-left">
                "{data.vision}"
              </p>
            </blockquote>

            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-widest border-t border-[#C59B3F]/20 pt-4">
              <span>Alliance of the Two Hearts</span>
              <span className="text-amber-800">Archdiocese of Cebu</span>
            </div>
          </div>
        </div>

        {/* Section 2: Official Parish MISSION (4 Action Pillars) */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8 animate-fade-in-up stagger-2">
            <div className="w-14 h-14 rounded-2xl bg-[#A81B2B] text-white flex items-center justify-center shrink-0 shadow-md animate-pulse-ruby">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-800 uppercase block">
                Tahus ug Katuyuan sa Parokya
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#1C1814] tracking-tight uppercase">
                MISSION
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.missionPoints.map((point, index) => (
              <div
                key={index}
                className={`bg-[#FAF7F0] rounded-3xl p-6 sm:p-7 border border-[#C59B3F]/35 shadow-xs card-lift animate-fade-in-up stagger-${index + 1} flex items-start gap-4 group shimmer-sweep`}
              >
                {/* Golden Circle Numeral Badge matching bulletin style */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E2C384] to-[#C59B3F] text-stone-900 font-extrabold flex items-center justify-center shrink-0 shadow-sm text-lg transition-transform group-hover:scale-110">
                  {index + 1}
                </div>

                {/* Content with vertical gold border */}
                <div className="border-l-3 border-[#C59B3F] pl-4 flex-1">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 font-mono">
                    Mission Pillar {index + 1}
                  </h3>
                  <p className="text-[#1C1814] text-base leading-relaxed font-medium">
                    {point}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Official Parish CORE VALUES */}
        <div className="bg-[#FAF7F0] rounded-3xl p-8 sm:p-12 border-2 border-[#C59B3F]/40 shadow-lg relative overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C59B3F]/15 border border-[#C59B3F]/40 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4 text-amber-800" />
              <span>Giya sa Kinabuhi ug Pag-alagad</span>
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#1C1814] tracking-tight uppercase">
              CORE VALUES
            </h2>
            <div className="mt-3 inline-block px-5 py-2 rounded-2xl bg-[#A81B2B] text-white font-serif-heading font-bold text-base sm:text-lg shadow-sm">
              "PATHWAYS towards the HEARTS of Jesus and Mary"
            </div>
          </div>

          {/* Part A: PATHWAYS */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-[#C59B3F]/30 pb-3">
              <span className="w-3 h-3 rounded-full bg-[#0B3B95] inline-block"></span>
              <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#1C1814] tracking-wider uppercase">
                P • A • T • H • W • A • Y • S
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.pathways.map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-5 border border-[#C59B3F]/30 shadow-xs card-lift animate-fade-in-up stagger-${(idx % 4) + 1} flex flex-col justify-between group shimmer-sweep`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DFBE7B] to-[#C59B3F] text-stone-900 font-black text-lg flex items-center justify-center shadow-xs transition-transform group-hover:scale-115">
                        {item.letter}
                      </div>
                      <h4 className="font-serif-heading text-sm font-bold text-[#1C1814] leading-tight group-hover:text-[#A81B2B] transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <div className="border-l-2 border-[#C59B3F] pl-2.5 mt-2">
                      <p className="text-xs text-stone-700 italic leading-relaxed">
                        ({item.cebuano})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider between PATHWAYS and HEARTS */}
          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#C59B3F]/40" />
            </div>
            <span className="relative bg-[#FAF7F0] px-4 text-xs font-bold uppercase tracking-widest text-amber-800">
              Towards The
            </span>
          </div>

          {/* Part B: HEARTS */}
          <div>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-[#C59B3F]/30 pb-3">
              <span className="w-3 h-3 rounded-full bg-[#A81B2B] inline-block animate-pulse-ruby"></span>
              <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#1C1814] tracking-wider uppercase">
                H • E • A • R • T • S
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.hearts.map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-5 border border-[#C59B3F]/30 shadow-xs card-lift animate-fade-in-up stagger-${(idx % 3) + 1} flex flex-col justify-between group shimmer-sweep`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A81B2B] to-[#7D121E] text-white font-black text-lg flex items-center justify-center shadow-xs ring-2 ring-[#C59B3F]/50 transition-transform group-hover:scale-115">
                        {item.letter}
                      </div>
                      <h4 className="font-serif-heading text-sm font-bold text-[#1C1814] leading-tight group-hover:text-[#A81B2B] transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <div className="border-l-2 border-[#A81B2B] pl-2.5 mt-2">
                      <p className="text-xs text-stone-700 italic leading-relaxed">
                        ({item.cebuano})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Devotional Footer Tag */}
          <div className="mt-12 text-center border-t border-[#C59B3F]/30 pt-6">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-100/60 text-amber-900 text-xs font-mono font-bold tracking-tight">
              #PATHwaystowardstheHEARTSofJesusandMary
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
