import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { adminApi, publicApi } from '../../services/api';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import { 
  MAINTENANCE_SECTIONS, 
  isSectionUnderMaintenance,
  isOverallMaintenance 
} from '../../config/maintenanceConfig';
import { 
  Bell, Calendar, Users, Image as ImageIcon, LayoutTemplate, 
  ArrowRight, Plus, ExternalLink, Church, Bot, HeartHandshake,
  Wrench, ShieldCheck, Sparkles
} from 'lucide-react';

export default function DashboardOverview() {
  const { settings, refreshSettings } = useTheme();
  const [stats, setStats] = useState({
    announcements: 0,
    events: 0,
    priests: 0,
    ministries: 8,
    albums: 0,
    pages: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingSec, setTogglingSec] = useState(null);

  const handleToggleSection = async (sec) => {
    setTogglingSec(sec.id);
    try {
      const isCurrentlyMaint = isSectionUnderMaintenance(sec, settings);
      const nextState = !isCurrentlyMaint;
      const payload = {
        [sec.settingKey]: nextState ? 'true' : 'false',
      };
      if (sec.id === 'ministries') {
        payload.ministries_banner_enabled = nextState ? 'true' : 'false';
      }
      await adminApi.saveSettings(payload);
      await refreshSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingSec(null);
    }
  };

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#720B23] via-[#800020] to-[#450011] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        {/* Ambient background glows & ecclesiastical watermark */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <Church className="absolute right-6 -bottom-8 w-56 h-56 text-white/[0.04] pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-3 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Parish Administration Portal</span>
            </div>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Parish Content Management System
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-rose-100/85 leading-relaxed">
              Update announcements, curate photo albums, modify homepage sections, and manage mass schedules directly without redeploying code.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Quick Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full sm:w-[410px]">
              <Link
                to={ADMIN_ROUTES.homepageBuilder}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-300/40 text-white text-xs font-semibold tracking-wide backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <LayoutTemplate className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span className="whitespace-nowrap">Homepage Builder</span>
              </Link>

              <Link
                to={ADMIN_ROUTES.ministries}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-rose-300/40 text-white text-xs font-semibold tracking-wide backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-400/20 border border-rose-300/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />
                </div>
                <span className="whitespace-nowrap">Ministries</span>
              </Link>

              <Link
                to={ADMIN_ROUTES.aiResponses}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-sky-300/40 text-white text-xs font-semibold tracking-wide backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-400/20 border border-sky-300/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Bot className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <span className="whitespace-nowrap">AI Responses</span>
              </Link>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-emerald-300/40 text-white text-xs font-semibold tracking-wide backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span className="whitespace-nowrap">Live Website</span>
              </a>
            </div>
          </div>
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

      {/* Website Sections Maintenance Control Center */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-900 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="font-serif-heading text-lg font-bold text-stone-900 leading-tight">
                Section Maintenance Mode Control Center
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Enable Under Maintenance Mode on specific sections during major updates so visitors see an Under Maintenance notice instead of partial changes.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold self-start sm:self-auto">
            <span>
              {MAINTENANCE_SECTIONS.filter((s) => isSectionUnderMaintenance(s, settings)).length} of {MAINTENANCE_SECTIONS.length} Sections in Maintenance
            </span>
          </div>
        </div>

        {/* Master Overall Maintenance Status Banner */}
        <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
          isOverallMaintenance(settings)
            ? 'bg-amber-500/15 border-amber-400 text-amber-950 ring-2 ring-amber-400/40'
            : 'bg-stone-50 border-stone-200 text-stone-700'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isOverallMaintenance(settings) ? 'bg-amber-600 animate-ping' : 'bg-emerald-500'}`} />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                {isOverallMaintenance(settings) ? 'Master System-Wide Maintenance Mode is ACTIVE' : 'System-Wide Status: Public Portal is LIVE'}
              </span>
              <p className="text-xs text-stone-600 mt-0.5">
                {isOverallMaintenance(settings)
                  ? 'All public pages and modules are currently shielded. Configure or disengage in General Settings.'
                  : 'Sections are individually controlled below. To put the entire website into maintenance at once, use General Settings.'}
              </p>
            </div>
          </div>
          <Link
            to={ADMIN_ROUTES.settings}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#68001a] text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>Manage Master Switch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Section Grid with switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {MAINTENANCE_SECTIONS.map((sec) => {
            const isMaint = isSectionUnderMaintenance(sec, settings);
            const isToggling = togglingSec === sec.id;

            return (
              <div
                key={sec.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isMaint
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40 shadow-xs'
                    : 'bg-stone-50/70 border-stone-200/80 hover:bg-stone-50'
                }`}
              >
                <Link
                  to={sec.adminPath}
                  className="min-w-0 flex-1 group"
                  title={`Open ${sec.label} manager`}
                >
                  <span className="font-bold text-xs text-stone-800 block truncate group-hover:text-[#800020] transition-colors">
                    {sec.label}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isMaint ? 'bg-amber-600 animate-ping' : 'bg-emerald-500'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-semibold ${
                        isMaint ? 'text-amber-800' : 'text-stone-500'
                      }`}
                    >
                      {isMaint ? 'Under Maintenance' : 'Live Mode'}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggleSection(sec)}
                  disabled={isToggling}
                  title={isMaint ? 'Click to publish section live' : 'Click to enable maintenance mode'}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shadow-2xs shrink-0 cursor-pointer ${
                    isMaint
                      ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 ring-1 ring-amber-500/40'
                      : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {isToggling ? '...' : isMaint ? 'ON' : 'OFF'}
                </button>
              </div>
            );
          })}
        </div>
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
