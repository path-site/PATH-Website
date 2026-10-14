import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function EventCardsSection({ config = {} }) {
  const {
    heading = "Upcoming Parish Activities",
    subheading = "Mark your calendar and participate in our communal devotions, seminars, and parish celebrations.",
    maxItems = 3,
    showViewAll = true
  } = config;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await publicApi.getEvents();
        if (res.data && res.data.upcoming) {
          setEvents(res.data.upcoming.slice(0, maxItems));
        }
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [maxItems]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { day: '', month: '', time: '' };
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { day, month, time };
  };

  return (
    <section className="py-20 bg-[#FCFBF9] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 scroll-reveal">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
              Events & Activities
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-2xl">
                {subheading}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B1D2F] hover:text-[#541624] group whitespace-nowrap"
            >
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-72 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500">
            No upcoming events scheduled at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-stagger">
            {events.map((evt, idx) => {
              const { day, month, time } = formatDateTime(evt.startDatetime);
              return (
                <div
                  key={evt.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs card-lift scroll-reveal flex flex-col shimmer-sweep"
                >
                  {/* Event Poster / Image */}
                  <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden img-zoom-hover">
                    {evt.eventImageUrl ? (
                      <img
                        src={resolveMediaUrl(evt.eventImageUrl)}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#101E38] via-[#1C2C4E] to-[#0A0D14] flex flex-col items-center justify-center p-6 text-white text-center">
                        <Calendar className="w-8 h-8 text-[#DFBE7B] mb-2 opacity-85" />
                        <span className="text-[11px] uppercase font-serif tracking-widest text-[#DFBE7B]">Parish Event</span>
                      </div>
                    )}
                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs rounded-xl px-3 py-1.5 shadow-md text-center border border-stone-100 transition-transform group-hover:scale-105">
                      <span className="block text-xs font-bold text-[#A81B2B] tracking-wider leading-none">
                        {month}
                      </span>
                      <span className="block text-lg font-black text-stone-900 leading-tight">
                        {day}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mb-2.5">
                        <span className="flex items-center gap-1 font-semibold text-amber-900">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          {time}
                        </span>
                        {evt.venue && (
                          <span className="flex items-center gap-1 font-medium text-stone-600">
                            <MapPin className="w-3.5 h-3.5 text-amber-700" />
                            {evt.venue}
                          </span>
                        )}
                      </div>

                      <div className="border-l-3 border-[#C59B3F] pl-3.5">
                        <h3 className="font-serif-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#A81B2B] transition-colors line-clamp-2 uppercase tracking-wide">
                          <Link to={`/events/${evt.slug}`}>
                            {evt.title}
                          </Link>
                        </h3>

                        <p className="mt-2 text-sm text-stone-600 line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#C59B3F]/20 flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C59B3F]/15 font-semibold text-amber-900 border border-[#C59B3F]/30">
                        {evt.category || 'Parish Activity'}
                      </span>
                      <Link
                        to={`/events/${evt.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A81B2B] group-hover:text-[#8E1227] tracking-wider uppercase"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
