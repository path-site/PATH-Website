import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, publicApi } from '../../services/api';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import { 
  Bell, Calendar, Users, Image as ImageIcon, LayoutTemplate, 
  ArrowRight, Plus, ExternalLink, Church, Bot, HeartHandshake 
} from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    announcements: 0,
    events: 0,
    priests: 0,
    ministries: 6,
    albums: 0,
    pages: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [annRes, evtRes, priestRes, galleryRes, pagesRes, settingsRes] = await Promise.all([
          adminApi.getAnnouncements(),
          adminApi.getEvents(),
          adminApi.getPriests(),
          adminApi.getAlbums(),
          adminApi.getPages(),
          adminApi.getSettings().catch(() => ({ data: {} })),
        ]);

        const annList = annRes.data || [];
        const evtList = evtRes.data || [];

        let ministriesCount = 6;
        if (settingsRes?.data?.ministries_list) {
          try {
            const parsed = JSON.parse(settingsRes.data.ministries_list);
            if (Array.isArray(parsed)) ministriesCount = parsed.length;
          } catch (e) {}
        }

        setStats({
          announcements: annList.length,
          events: evtList.length,
          priests: (priestRes.data || []).length,
          ministries: ministriesCount,
          albums: (galleryRes.data || []).length,
          pages: (pagesRes.data || []).length,
        });

        setRecentAnnouncements(annList.slice(0, 4));
        setUpcomingEvents(evtList.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#800020] to-[#541624] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300 block mb-2">
            Welcome to Parish Administration
          </span>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            Parish Content Management System
          </h1>
          <p className="mt-1 text-sm text-stone-200 max-w-xl">
            Update announcements, curate photo albums, modify homepage sections, and manage mass schedules directly without redeploying code.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={ADMIN_ROUTES.homepageBuilder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold uppercase tracking-wider shadow-md transition-all"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Homepage Builder</span>
          </Link>
          <Link
            to={ADMIN_ROUTES.ministries}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all"
          >
            <HeartHandshake className="w-4 h-4 text-amber-300" />
            <span>Ministries</span>
          </Link>
          <Link
            to={ADMIN_ROUTES.aiResponses}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>AI Responses</span>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to={ADMIN_ROUTES.announcements} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Bell className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">{stats.announcements}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Announcements</span>
        </Link>

        <Link to={ADMIN_ROUTES.events} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">{stats.events}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Events</span>
        </Link>

        <Link to={ADMIN_ROUTES.priests} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">{stats.priests}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Priests</span>
        </Link>

        <Link to={ADMIN_ROUTES.ministries} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">{stats.ministries}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Ministries</span>
        </Link>

        <Link to={ADMIN_ROUTES.gallery} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">{stats.albums}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Photo Albums</span>
        </Link>

        <Link to={ADMIN_ROUTES.pages} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">{stats.pages}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">CMS Pages</span>
        </Link>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Announcements */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-serif-heading text-lg font-bold text-stone-900">
                Recent Announcements
              </h2>
              <p className="text-xs text-stone-500">Latest notices and published updates</p>
            </div>
            <Link
              to={ADMIN_ROUTES.announcements}
              className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAnnouncements.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl border border-stone-100 hover:border-stone-200 hover:bg-stone-50/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-stone-800 truncate">
                    {a.title}
                  </h4>
                  <span className="text-xs text-stone-400">
                    Category: {a.category}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    a.status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-serif-heading text-lg font-bold text-stone-900">
                Parish Activities
              </h2>
              <p className="text-xs text-stone-500">Upcoming calendar entries</p>
            </div>
            <Link
              to={ADMIN_ROUTES.events}
              className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl border border-stone-100 hover:border-stone-200 hover:bg-stone-50/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-stone-800 truncate">
                    {evt.title}
                  </h4>
                  <span className="text-xs text-stone-400">
                    Venue: {evt.venue || 'Sanctuary'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    evt.status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {evt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
