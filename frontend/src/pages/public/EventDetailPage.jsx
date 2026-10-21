import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, Share2 } from 'lucide-react';
import ParishChurchOutlineIcon from '../../components/common/ParishChurchOutlineIcon';
import PublicMaintenanceNotice, { useSectionMaintenance } from '../../components/common/PublicMaintenanceNotice';

export default function EventDetailPage() {
  const isMaintenance = useSectionMaintenance('events');
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await publicApi.getEvent(slug);
        if (res.data) {
          setEvent(res.data);
        }
      } catch (err) {
        setError('Event details could not be found or have been archived.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  if (isMaintenance) {
    return (
      <div className="min-h-[70vh] bg-[#FCFBF9] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#6B1D2F] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Parish Events Calendar</span>
            </Link>
          </div>
          <PublicMaintenanceNotice sectionKey="events" forceShow />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] py-12 lg:py-16 animate-fadeIn select-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-36 bg-stone-200/80 rounded animate-pulse mb-8" />
          <div className="space-y-4 mb-8">
            <div className="h-4 w-28 bg-amber-200/60 rounded animate-pulse" />
            <div className="h-10 w-4/5 bg-stone-200/90 rounded-xl animate-pulse" />
            <div className="h-4 w-52 bg-stone-200/60 rounded animate-pulse" />
          </div>
          <div className="rounded-3xl bg-stone-200/70 aspect-16/9 w-full mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="h-24 bg-white rounded-2xl border border-stone-200/80 p-4 animate-pulse" />
            <div className="h-24 bg-white rounded-2xl border border-stone-200/80 p-4 animate-pulse" />
            <div className="h-24 bg-white rounded-2xl border border-stone-200/80 p-4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Event Not Found</h2>
        <p className="text-stone-600 mb-6">{error || 'This activity may have expired or been removed.'}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B1D2F] text-white text-sm font-semibold hover:bg-[#541624] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Calendar</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#FCFBF9] py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link & Share */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#6B1D2F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Parish Events</span>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-[#6B1D2F] hover:bg-stone-50 text-xs font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Title and Category */}
        <div className="space-y-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block">
            {event.category || 'Parish Activity'}
          </span>

          <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            {event.title}
          </h1>

          {/* Event Quick Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Date & Time</span>
                <span className="text-sm font-semibold text-stone-800 block">{formatFullDate(event.startDatetime)}</span>
                <span className="text-xs text-stone-500 font-medium">{formatTime(event.startDatetime)} {event.endDatetime ? `– ${formatTime(event.endDatetime)}` : ''}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Venue</span>
                <span className="text-sm font-semibold text-stone-800 block">{event.venue || 'Parish Church Sanctuary'}</span>
                <span className="text-xs text-stone-500">Parish of the Alliance of the Two Hearts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Poster / Featured Image */}
        {event.eventImageUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-100 aspect-16/9">
            <img
              src={resolveMediaUrl(event.eventImageUrl)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description Body */}
        <div className="prose prose-stone lg:prose-lg max-w-none text-stone-800 leading-relaxed font-normal space-y-4 mb-10">
          <p className="whitespace-pre-line">{event.description}</p>
        </div>

        {/* External Registration / Link Button */}
        {event.externalUrl && (
          <div className="mb-10 p-6 rounded-2xl bg-[#6B1D2F]/5 border border-[#6B1D2F]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Online Registration / Information</h4>
              <p className="text-xs text-stone-600">Access supplementary details or sign up for this parish activity.</p>
            </div>
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#6B1D2F] hover:bg-[#541624] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all whitespace-nowrap"
            >
              <span>Register / Visit Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-14 pt-8 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6B1D2F] text-amber-300 flex items-center justify-center">
              <ParishChurchOutlineIcon className="w-6 h-auto text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Parish of the Alliance of the Two Hearts
              </p>
              <p className="text-xs text-stone-500">
                Official Parish Activities
              </p>
            </div>
          </div>
          <Link
            to="/events"
            className="text-xs font-bold text-[#6B1D2F] hover:text-[#541624] uppercase tracking-wider"
          >
            ← Back to Calendar
          </Link>
        </div>

      </div>
    </article>
  );
}
