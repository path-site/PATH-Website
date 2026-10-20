import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../services/api';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import { getSectionById, getSectionByPath, getRawSectionMaintenance } from '../../config/maintenanceConfig';
import { 
  Wrench, ShieldCheck, Settings2, ExternalLink, X, Save, 
  CheckCircle2, AlertTriangle, Phone, Eye
} from 'lucide-react';

export default function SectionMaintenanceBar({
  sectionKey,
  className = '',
  compact = false,
  onToggle,
}) {
  const { settings, refreshSettings } = useTheme();
  const location = useLocation();

  // Resolve section from explicit prop or location path
  const section = sectionKey ? getSectionById(sectionKey) : getSectionByPath(location.pathname);

  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [noticeForm, setNoticeForm] = useState({
    badge: '',
    title: '',
    desc: '',
    showPhone: true,
    showFb: true,
  });

  if (!section) return null;

  const isMaintenanceActive = getRawSectionMaintenance(section, settings);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4500);
  };

  // Toggle Maintenance Switch
  const handleToggle = async (e) => {
    if (e) e.stopPropagation();
    const nextState = !isMaintenanceActive;
    setSaving(true);
    try {
      const payload = {
        [section.settingKey]: nextState ? 'true' : 'false',
      };
      // Keep ministries_banner_enabled synchronized for backward compatibility
      if (section.id === 'ministries') {
        payload.ministries_banner_enabled = nextState ? 'true' : 'false';
      }

      await adminApi.saveSettings(payload);
      await refreshSettings();
      if (onToggle) onToggle(nextState);

      if (nextState) {
        showToast(`Under Maintenance Mode is now ACTIVE for ${section.shortLabel}. Visitors will see an Under Maintenance notice while you make major changes.`);
      } else {
        showToast(`Under Maintenance Mode is now OFF for ${section.shortLabel}. Section is published live!`);
      }
    } catch (err) {
      console.error('Failed to toggle maintenance mode', err);
      showToast('Failed to update maintenance mode. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openNoticeModal = () => {
    setNoticeForm({
      badge: settings?.[`maintenance_${section.id}_badge`] || section.defaultBadge || '',
      title: settings?.[`maintenance_${section.id}_title`] || section.defaultTitle || '',
      desc: settings?.[`maintenance_${section.id}_desc`] || section.defaultDesc || '',
      showPhone: settings?.[`maintenance_${section.id}_show_phone`] !== 'false',
      showFb: settings?.[`maintenance_${section.id}_show_fb`] !== 'false',
    });
    setModalOpen(true);
  };

  const handleSaveNoticeSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        [`maintenance_${section.id}_badge`]: noticeForm.badge,
        [`maintenance_${section.id}_title`]: noticeForm.title,
        [`maintenance_${section.id}_desc`]: noticeForm.desc,
        [`maintenance_${section.id}_show_phone`]: noticeForm.showPhone ? 'true' : 'false',
        [`maintenance_${section.id}_show_fb`]: noticeForm.showFb ? 'true' : 'false',
      };
      // Also update ministries banner texts if applicable
      if (section.id === 'ministries') {
        payload.ministries_banner_badge = noticeForm.badge;
        payload.ministries_banner_title = noticeForm.title;
        payload.ministries_banner_desc = noticeForm.desc;
        payload.ministries_banner_show_phone = noticeForm.showPhone ? 'true' : 'false';
        payload.ministries_banner_show_fb = noticeForm.showFb ? 'true' : 'false';
      }

      await adminApi.saveSettings(payload);
      await refreshSettings();
      setModalOpen(false);
      showToast(`Maintenance notice details for ${section.shortLabel} updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to save notice settings.');
    } finally {
      setSaving(false);
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          title={isMaintenanceActive ? 'Click to turn OFF maintenance' : 'Click to turn ON maintenance mode'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
            isMaintenanceActive
              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isMaintenanceActive ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
            }`}
          />
          <span>{isMaintenanceActive ? 'Maintenance: ON' : 'Live Mode'}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl transition-all duration-300 border ${
        isMaintenanceActive
          ? 'bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-400/30'
          : 'bg-white border-stone-200/90 shadow-xs'
      } p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isMaintenanceActive
                ? 'bg-amber-500 text-stone-900 shadow-md animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isMaintenanceActive ? (
              <Wrench className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  isMaintenanceActive
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isMaintenanceActive ? 'bg-stone-950 animate-ping' : 'bg-emerald-600'
                  }`}
                />
                <span>
                  {isMaintenanceActive
                    ? 'Under Maintenance Mode: ACTIVE'
                    : 'Live Mode (Public Website Visible)'}
                </span>
              </span>

              <span className="text-xs font-semibold text-stone-500">
                • {section.label}
              </span>
            </div>

            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              {isMaintenanceActive ? (
                <>
                  <strong className="text-amber-950 font-bold">Public visitors currently see an Under Maintenance notice</strong> on the public website. You can now safely make major modifications, reorder items, or edit rosters without visitors seeing incomplete work.
                </>
              ) : (
                <>
                  This section is currently <strong className="text-emerald-900 font-semibold">live to visitors</strong> on the public website. Turn on <strong>Under Maintenance Mode</strong> when you want to safely change major stuff, update rosters, or test drafts without visitors seeing partial changes.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls & Tactile Switch */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-center">
          
          {/* Custom Notice Settings Button */}
          <button
            type="button"
            onClick={openNoticeModal}
            title="Customize the maintenance notice banner shown to public visitors"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Notice Settings</span>
          </button>

          {/* Admin Live Preview Link (Bypasses Maintenance) */}
          {section.publicPath && (
            <Link
              to={`${ADMIN_ROUTES.preview}?page=${encodeURIComponent(section.publicPath)}`}
              title={`Preview live ${section.label} page (bypasses maintenance mode so you can preview changes safely)`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-400/80 transition-all shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-800" />
              <span>Admin Preview</span>
            </Link>
          )}

          {/* View Public Page Link */}
          {section.publicPath && (
            <a
              href={section.publicPath}
              target="_blank"
              rel="noopener noreferrer"
              title="Open public page in new tab (shows public notice if in maintenance)"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <span className="hidden lg:inline">Public View</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          )}

          {/* Primary Tactile Toggle Switch */}
          <div className="flex items-center gap-2 pl-1 border-l border-stone-200/80">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMaintenanceActive}
                onChange={handleToggle}
                disabled={saving}
                className="sr-only peer"
              />
              <div
                className={`w-14 h-7 rounded-full peer transition-all duration-300 relative shadow-inner ${
                  isMaintenanceActive
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-stone-300 hover:bg-stone-400'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md flex items-center justify-center ${
                    isMaintenanceActive ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  {isMaintenanceActive ? (
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>
            </label>
            <span
              className={`text-xs font-bold whitespace-nowrap cursor-pointer ${
                isMaintenanceActive ? 'text-amber-900' : 'text-stone-600'
              }`}
              onClick={handleToggle}
            >
              {isMaintenanceActive ? 'Maintenance ON' : 'Turn ON to Edit Major Stuff'}
            </span>
          </div>
        </div>

      </div>

      {/* Toast Feedback */}
      {toast && (
        <div className="mt-3 text-xs font-semibold px-3 py-2 rounded-xl bg-stone-900 text-amber-300 shadow-md animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Notice Customizer Modal */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-scale-up">
              
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                      Public Maintenance Notice Settings
                    </h3>
                    <p className="text-xs text-stone-500">
                      Configure the message shown on the public site when {section.label} is under maintenance.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNoticeSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Notice Badge
                  </label>
                  <input
                    type="text"
                    value={noticeForm.badge}
                    onChange={(e) => setNoticeForm({ ...noticeForm, badge: e.target.value })}
                    placeholder="e.g. Roster Updates in Progress"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder="e.g. Clergy Directory is Currently Undergoing Maintenance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Detailed Message to Parishioners
                  </label>
                  <textarea
                    rows={3}
                    value={noticeForm.desc}
                    onChange={(e) => setNoticeForm({ ...noticeForm, desc: e.target.value })}
                    placeholder="Explain what is being updated and when it will be published..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={noticeForm.showPhone}
                      onChange={(e) => setNoticeForm({ ...noticeForm, showPhone: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Show Call Parish Office Button</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={noticeForm.showFb}
                      onChange={(e) => setNoticeForm({ ...noticeForm, showFb: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show Facebook Button</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Notice Settings</span>
                  </button>
                </div>
              </form>

            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
