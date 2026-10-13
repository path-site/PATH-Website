import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { ArrowLeft, Calendar, User, Tag, Share2, Church } from 'lucide-react';

export default function AnnouncementDetailPage() {
  const { slug } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await publicApi.getAnnouncement(slug);
        if (res.data) {
          setAnnouncement(res.data);
        }
      } catch (err) {
        setError('Announcement could not be found or has not been published.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: announcement.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FCFBF9]">
        <div className="w-10 h-10 border-4 border-[#6B1D2F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Notice Not Found</h2>
        <p className="text-stone-600 mb-6">{error || 'This announcement may have been archived or removed.'}</p>
        <Link
          to="/announcements"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B1D2F] text-white text-sm font-semibold hover:bg-[#541624] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Announcements</span>
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
            to="/announcements"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#6B1D2F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Announcements</span>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-[#6B1D2F] hover:bg-stone-50 text-xs font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Title and Meta */}
        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Tag className="w-3 h-3 text-amber-600" />
            <span>{announcement.category || 'General'}</span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            {announcement.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-500 pt-2 border-t border-stone-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
            </span>
            {announcement.authorName && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-stone-400" />
                <span>Published by: {announcement.authorName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {announcement.featuredImageUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-100 aspect-16/9">
            <img
              src={announcement.featuredImageUrl}
              alt={announcement.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Summary callout */}
        {announcement.summary && (
          <div className="p-6 mb-8 rounded-2xl bg-amber-50/70 border-l-4 border-[#C5A059] text-stone-800 text-base sm:text-lg font-medium leading-relaxed italic">
            "{announcement.summary}"
          </div>
        )}

        {/* Content Body */}
        <div 
          className="prose prose-stone lg:prose-lg max-w-none text-stone-800 leading-relaxed font-normal space-y-4"
          dangerouslySetInnerHTML={{ __html: announcement.content }}
        />

        {/* Footer of Announcement */}
        <div className="mt-14 pt-8 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6B1D2F] text-amber-300 flex items-center justify-center">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Parish of the Alliance of the Two Hearts
              </p>
              <p className="text-xs text-stone-500">
                Official Parish Communication
              </p>
            </div>
          </div>
          <Link
            to="/announcements"
            className="text-xs font-bold text-[#6B1D2F] hover:text-[#541624] uppercase tracking-wider"
          >
            ← Back to Listing
          </Link>
        </div>

      </div>
    </article>
  );
}
