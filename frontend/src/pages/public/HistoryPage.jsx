import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Clock, Calendar, Church, ArrowDown } from 'lucide-react';

export default function HistoryPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await publicApi.getHistory();
        if (res.data) {
          setMilestones(res.data);
        }
      } catch (err) {
        console.error('Failed to load history milestones', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-3">
            Our Journey of Faith
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            History of the Church
          </h1>
          <p className="mt-4 text-stone-600 text-base sm:text-lg leading-relaxed">
            From modest pioneer gatherings to a flourishing diocesan parish dedicated to the Sacred Hearts of Jesus and Mary.
          </p>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-12 max-w-3xl mx-auto">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-2xl h-56 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500">
            Parish church history milestones will appear here.
          </div>
        ) : (
          <div className="relative border-l-2 border-[#C5A059]/40 ml-4 sm:ml-32 md:ml-40 space-y-12">
            {milestones.map((item, idx) => (
              <div key={item.id} className="relative pl-8 sm:pl-10 group scroll-reveal">
                
                {/* Milestone Node */}
                <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-white border-4 border-[#A81B2B] shadow-md flex items-center justify-center group-hover:scale-125 transition-transform animate-pulse-ruby" />

                {/* Left Date Label on Desktop */}
                <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right pr-4">
                  <span className="font-serif-heading font-black text-lg text-[#A81B2B] tracking-tight block">
                    {item.eventDate}
                  </span>
                </div>

                {/* Card Container */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs card-lift shimmer-sweep">
                  {/* Mobile Date Badge */}
                  <div className="sm:hidden mb-2">
                    <span className="inline-block text-amber-900 text-xs font-bold uppercase tracking-wider">
                      {item.eventDate}
                    </span>
                  </div>

                  <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-900 mb-3 group-hover:text-[#A81B2B] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-stone-600 text-base leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>

                  {item.imageUrl && (
                    <div className="rounded-2xl overflow-hidden aspect-16/9 bg-stone-100 border border-stone-100 shadow-xs img-zoom-hover">
                      <img
                        src={resolveMediaUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Bottom Epilogue */}
        <div className="mt-20 p-8 rounded-3xl bg-amber-50/70 border border-amber-200/80 text-center max-w-2xl mx-auto shadow-xs scroll-reveal-scale">
          <Church className="w-10 h-10 text-[#6B1D2F] mx-auto mb-3" />
          <h4 className="font-serif-heading text-lg font-bold text-stone-800">
            Continuing the Grace of God
          </h4>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
            As the Parish of the Alliance of the Two Hearts moves forward, our gratitude remains steadfast to all bishops, parish priests, benefactors, and parishioners whose prayers and dedication built this sanctuary.
          </p>
        </div>

      </div>
    </div>
  );
}
