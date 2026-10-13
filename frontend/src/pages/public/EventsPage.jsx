import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Calendar, Clock, MapPin, ArrowRight, Tag } from 'lucide-react';

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [eventsData, setEventsData] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await publicApi.getEvents();
        if (res.data) {
          setEventsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const currentEvents = activeTab === 'upcoming' ? eventsData.upcoming : eventsData.past;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { day: '', month: '', time: '' };
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { day, month, time };
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Liturgical & Pastoral Calendar</span>
          </div>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            Parish Events & Activities
          </h1>
          <p className="mt-4 text-stone-600 text-base sm:text-lg leading-relaxed">
            Participate in our sacramental celebrations, parish recollections, novenas, and community apostolates.
          </p>

          {/* Tab Selector */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-stone-200/80 border border-stone-300">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-[#6B1D2F] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Upcoming Activities ({eventsData.upcoming ? eventsData.upcoming.length : 0})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'past'
                  ? 'bg-[#6B1D2F] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Past Activities ({eventsData.past ? eventsData.past.length : 0})
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : !currentEvents || currentEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto shadow-xs">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-700">
              No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Events
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              Please check back soon for updates to our parish calendar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentEvents.map((evt, idx) => {
              const { day, month, time } = formatDateTime(evt.startDatetime);
              return (
                <div
                  key={evt.id}
                  className={`group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs card-lift animate-fade-in-up stagger-${(idx % 6) + 1} flex flex-col shimmer-sweep`}
                >
                  <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden img-zoom-hover">
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
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs rounded-xl px-3 py-1.5 shadow-md text-center border border-stone-100 transition-transform group-hover:scale-105">
                      <span className="block text-xs font-bold text-[#A81B2B] tracking-wider leading-none">
                        {month}
                      </span>
                      <span className="block text-xl font-black text-stone-900 leading-tight">
                        {day}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mb-2.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {time}
                        </span>
                        {evt.venue && (
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            {evt.venue}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif-heading text-xl font-bold text-stone-900 group-hover:text-[#6B1D2F] transition-colors line-clamp-2 leading-snug">
                        <Link to={`/events/${evt.slug}`}>
                          {evt.title}
                        </Link>
                      </h3>

                      <p className="mt-2.5 text-sm text-stone-600 line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 font-semibold text-stone-600">
                        {evt.category || 'Parish Activity'}
                      </span>
                      <Link
                        to={`/events/${evt.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B1D2F] group-hover:text-[#541624] uppercase tracking-wider"
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
    </div>
  );
}
