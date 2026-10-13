import React from 'react';
import { Calendar, Radio, MapPin, Clock } from 'lucide-react';

export const OFFICIAL_SCHEDULE = {
  weekday: {
    label: 'Monday – Friday',
    items: [
      { time: '6:00 AM', language: 'Cebuano', isLive: false },
      { time: '6:30 AM', language: 'English', isLive: false },
      { time: '12:15 PM', language: 'English', isLive: false },
      { time: '5:00 PM', language: 'Cebuano', isLive: false, note: 'Every Monday at the Columbary' },
      { time: '6:00 PM', language: 'English', isLive: true }
    ]
  },
  saturday: {
    label: 'Saturday',
    items: [
      { time: '6:00 AM', language: 'Cebuano', isLive: false },
      { time: '6:30 AM', language: 'English', isLive: false },
      { time: '5:30 PM', language: 'English', isLive: true, note: 'Anticipated Mass' }
    ]
  },
  sunday: {
    label: 'Sunday',
    items: [
      { time: '5:30 AM', language: 'Cebuano', isLive: false },
      { time: '7:00 AM', language: 'English', isLive: false },
      { time: '9:00 AM', language: 'English', isLive: true },
      { time: '11:00 AM', language: 'English', isLive: false },
      { time: '4:00 PM', language: 'English', isLive: false },
      { time: '5:30 PM', language: 'Cebuano', isLive: true },
      { time: '7:00 PM', language: 'English', isLive: false }
    ]
  }
};

export default function MassScheduleView({ variant = 'card' }) {
  return (
    <div className="w-full bg-[#FCFAF5] rounded-3xl border border-[#C59B3F]/35 shadow-xl overflow-hidden text-stone-900">

      {/* Liturgical Header Banner */}
      <div className="bg-gradient-to-b from-[#FAF6ED] to-[#F3EDE0] px-6 py-8 sm:px-10 text-center border-b border-[#C59B3F]/25 relative">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-white p-1 shadow-md ring-2 ring-[#C59B3F] flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo.png" alt="PATH Parish Seal" className="w-full h-full object-contain" />
          </div>
        </div>

        <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold tracking-wider text-stone-900 uppercase">
          Mass Schedule
        </h2>
      </div>

      {/* 3-Column Schedule Grid */}
      <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 bg-white/70">

        {/* Column 1: Monday - Friday */}
        <div className="rounded-2xl bg-[#FCFAF7] border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-[#C59B3F]/40 pb-2.5 mb-4 text-center">
              <h3 className="font-serif-heading text-lg font-bold text-stone-900">
                Monday – Friday
              </h3>
            </div>

            <div className="space-y-3">
              {OFFICIAL_SCHEDULE.weekday.items.map((slot, idx) => (
                <div key={idx} className="flex flex-col border-b border-stone-100 pb-2.5 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900">
                      {slot.time}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${slot.language === 'Cebuano'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                        [{slot.language}]
                      </span>
                      {slot.isLive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          <span>LIVE</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {slot.note && (
                    <span className="text-[11px] italic text-[#800020] font-medium mt-0.5">
                      {slot.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Saturday */}
        <div className="rounded-2xl bg-[#FCFAF7] border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-[#C59B3F]/40 pb-2.5 mb-4 text-center">
              <h3 className="font-serif-heading text-lg font-bold text-stone-900">
                Saturday
              </h3>
            </div>

            <div className="space-y-3">
              {OFFICIAL_SCHEDULE.saturday.items.map((slot, idx) => (
                <div key={idx} className="flex flex-col border-b border-stone-100 pb-2.5 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900">
                      {slot.time}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${slot.language === 'Cebuano'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                        [{slot.language}]
                      </span>
                      {slot.isLive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          <span>LIVE</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {slot.note && (
                    <span className="text-[11px] italic text-[#800020] font-medium mt-0.5">
                      {slot.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Sunday */}
        <div className="rounded-2xl bg-[#FCFAF7] border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between ring-1 ring-[#C59B3F]/30">
          <div>
            <div className="border-b border-[#C59B3F]/40 pb-2.5 mb-4 text-center bg-[#800020]/5 -mx-5 -mt-5 p-4 rounded-t-2xl">
              <h3 className="font-serif-heading text-lg font-bold text-[#800020]">
                Sunday
              </h3>
              <span className="text-[10px] font-bold text-[#C59B3F] uppercase tracking-wider block">
                The Lord's Day
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {OFFICIAL_SCHEDULE.sunday.items.map((slot, idx) => (
                <div key={idx} className="flex flex-col border-b border-stone-100 pb-2 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900">
                      {slot.time}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${slot.language === 'Cebuano'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                        [{slot.language}]
                      </span>
                      {slot.isLive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          <span>LIVE</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Sacrament of Confession & Livestream Notice Bar */}
      <div className="bg-[#191516] text-white px-6 py-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-[#C59B3F] shrink-0" />
          <div>
            <span className="font-bold text-[#C59B3F] uppercase tracking-wider">Confessions: </span>
            <span className="text-stone-300">Wednesday & Friday: 5:00 PM – 6:00 PM • Saturday: 4:30 PM – 5:30 PM</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-stone-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Masses marked <strong className="text-white">LIVE</strong> are streamed on official parish media.</span>
        </div>
      </div>

    </div>
  );
}
