import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { ADMIN_ROUTES } from '../../config/adminConfig';
import { OVERALL_MAINTENANCE_DEFAULTS, isOverallMaintenance } from '../../config/maintenanceConfig';
import { 
  Settings, CheckCircle2, AlertCircle, Save, 
  ShieldCheck, Power, ExternalLink, Wrench, ShieldAlert,
  KeyRound, Lock, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function GeneralSettings() {
  const { refreshSettings } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      let settingsMap = {};
      if (res) {
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          if (res.data.data && typeof res.data.data === 'object') {
            settingsMap = res.data.data;
          } else {
            settingsMap = res.data;
          }
        } else if (typeof res === 'object') {
          settingsMap = res;
        }
      }

      setSettings({
        site_name: settingsMap.site_name || 'Parish of the Alliance of the Two Hearts',
        site_tagline: settingsMap.site_tagline || settingsMap.tagline || 'A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary',
        tagline: settingsMap.tagline || settingsMap.site_tagline || 'A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary',
        seo_default_title: settingsMap.seo_default_title || 'Parish of the Alliance of the Two Hearts — Official Website',
        seo_default_description: settingsMap.seo_default_description || 'Official online home of the Parish of the Alliance of the Two Hearts (PATH) in Banawa, Cebu City. Mass schedules, sacraments, announcements, and parish ministries.',
        notification_email: settingsMap.notification_email || settingsMap.email || 'office@pathparish.org',
        session_timeout: settingsMap.session_timeout || '24h',
        maintenance_overall: settingsMap.maintenance_overall || 'false',
        maintenance_overall_badge: settingsMap.maintenance_overall_badge || OVERALL_MAINTENANCE_DEFAULTS.defaultBadge,
        maintenance_overall_title: settingsMap.maintenance_overall_title || OVERALL_MAINTENANCE_DEFAULTS.defaultTitle,
        maintenance_overall_desc: settingsMap.maintenance_overall_desc || OVERALL_MAINTENANCE_DEFAULTS.defaultDesc,
        maintenance_overall_advisory: settingsMap.maintenance_overall_advisory || OVERALL_MAINTENANCE_DEFAULTS.defaultAdvisory,
        maintenance_overall_show_phone: settingsMap.maintenance_overall_show_phone !== 'false' ? 'true' : 'false',
        maintenance_overall_show_fb: settingsMap.maintenance_overall_show_fb !== 'false' ? 'true' : 'false',
        ...settingsMap,
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
      notify('error', 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, val) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'site_tagline') next.tagline = val;
      if (key === 'tagline') next.site_tagline = val;
      return next;
    });
  };

  const handleInstantOverallToggle = async () => {
    const currentState = isOverallMaintenance(settings);
    const nextState = !currentState;
    const nextVal = nextState ? 'true' : 'false';
    const updated = { 
      ...settings, 
      maintenance_overall: nextVal,
      // Persist the current notice text and options even when turning off or on
      maintenance_overall_badge: settings.maintenance_overall_badge || OVERALL_MAINTENANCE_DEFAULTS.defaultBadge,
      maintenance_overall_title: settings.maintenance_overall_title || OVERALL_MAINTENANCE_DEFAULTS.defaultTitle,
      maintenance_overall_desc: settings.maintenance_overall_desc || OVERALL_MAINTENANCE_DEFAULTS.defaultDesc,
      maintenance_overall_advisory: settings.maintenance_overall_advisory || OVERALL_MAINTENANCE_DEFAULTS.defaultAdvisory,
      maintenance_overall_show_phone: settings.maintenance_overall_show_phone !== 'false' ? 'true' : 'false',
      maintenance_overall_show_fb: settings.maintenance_overall_show_fb !== 'false' ? 'true' : 'false',
    };
    setSettings(updated);
    try {
      localStorage.setItem('path_site_settings_cache', JSON.stringify(updated));
      localStorage.setItem('path_maintenance_overall', nextVal);
      window.dispatchEvent(new CustomEvent('path_settings_updated', { detail: updated }));
    } catch (e) {}
    setSaving(true);
    try {
      const payload = {};
      Object.entries(updated).forEach(([k, v]) => {
        if (v !== undefined && v !== null && typeof v !== 'object') {
          payload[k] = String(v);
        }
      });
      await adminApi.saveSettings(payload);
      try {
        localStorage.setItem('path_site_settings_cache', JSON.stringify(payload));
        localStorage.setItem('path_maintenance_overall', nextVal);
        window.dispatchEvent(new CustomEvent('path_settings_updated', { detail: payload }));
      } catch (e) {}
      if (refreshSettings) await refreshSettings();
      notify('success', nextState 
        ? 'System-Wide Maintenance Mode turned ON. Entire public website is now shielded.'
        : 'System-Wide Maintenance Mode turned OFF. Public website is now LIVE.'
      );
    } catch (err) {
      console.error('Failed to update overall maintenance mode:', err);
      notify('error', 'Failed to update overall maintenance mode.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      Object.entries(settings).forEach(([k, v]) => {
        if (v !== undefined && v !== null && typeof v !== 'object') {
          payload[k] = String(v);
        }
      });
      if (!payload.maintenance_overall_badge) payload.maintenance_overall_badge = OVERALL_MAINTENANCE_DEFAULTS.defaultBadge;
      if (!payload.maintenance_overall_title) payload.maintenance_overall_title = OVERALL_MAINTENANCE_DEFAULTS.defaultTitle;
      if (!payload.maintenance_overall_desc) payload.maintenance_overall_desc = OVERALL_MAINTENANCE_DEFAULTS.defaultDesc;
      if (!payload.maintenance_overall_advisory) payload.maintenance_overall_advisory = OVERALL_MAINTENANCE_DEFAULTS.defaultAdvisory;
      if (!payload.tagline && payload.site_tagline) payload.tagline = payload.site_tagline;

      await adminApi.saveSettings(payload);
      try {
        localStorage.setItem('path_site_settings_cache', JSON.stringify(payload));
        if (payload.maintenance_overall !== undefined) {
          localStorage.setItem('path_maintenance_overall', payload.maintenance_overall);
        }
        window.dispatchEvent(new CustomEvent('path_settings_updated', { detail: payload }));
      } catch (e) {}
      if (refreshSettings) await refreshSettings();
      notify('success', 'General system settings saved successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      notify('error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwStatus(null);

    if (!passwordForm.currentPassword) {
      setPwStatus({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPwStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwStatus({ type: 'error', message: 'New passwords do not match. Please verify.' });
      return;
    }

    setPwLoading(true);
    try {
      await adminApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPwStatus({ 
        type: 'success', 
        message: 'Password updated successfully! The change has been committed to the database.' 
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify('success', 'Admin password changed successfully.');
    } catch (err) {
      setPwStatus({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const isOverall = isOverallMaintenance(settings);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-stone-500">
        <div className="w-9 h-9 border-3 border-[#800020] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Loading System Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-serif-heading font-bold text-stone-900 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#A81B2B]" />
            General & System Settings
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Configure parish metadata, SEO defaults, and operational variables.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A81B2B] hover:bg-[#8F1624] text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Overall Maintenance Mode Master Control Card */}
      <div className={`p-6 sm:p-7 rounded-2xl border transition-all shadow-xs ${
        isOverall
          ? 'bg-gradient-to-br from-amber-50/95 via-amber-100/40 to-orange-50/80 border-amber-300 ring-2 ring-amber-400/40 shadow-md'
          : 'bg-white border-stone-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-200/80">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isOverall
                  ? 'bg-amber-600 text-white shadow-xs animate-pulse'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOverall ? 'bg-white animate-ping' : 'bg-emerald-600'}`} />
                {isOverall ? 'Master Maintenance ON (Site Shielded)' : 'Public Website is Live'}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                • Universal Switch for Entire Portal
              </span>
            </div>
            <h2 className="text-xl font-serif-heading font-bold text-stone-900 pt-1">
              Overall Website Maintenance Mode
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              When switched <strong>ON</strong>, the entire public site is shielded. Visitors see the dedicated Catholic maintenance notice with parish office contact details and sacramental reassurances. Church staff and administrators can still log in and manage the site.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {isOverall && (
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Preview the visitor maintenance notice"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:text-stone-950 hover:bg-stone-50 text-xs font-bold transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Notice</span>
              </a>
            )}
            <a
              href="/preview"
              target="_blank"
              rel="noopener noreferrer"
              title="Preview the whole live website in a new window as administrator (bypasses maintenance mode)"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#071838] to-[#112d66] text-amber-300 hover:text-white border border-amber-400/50 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Whole Site</span>
            </a>
            <button
              type="button"
              onClick={handleInstantOverallToggle}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                isOverall
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-amber-500/20'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOverall ? 'Turn OFF (Make Website Live)' : 'Turn ON Overall Maintenance'}</span>
            </button>
          </div>
        </div>

        {/* Master Maintenance Configuration Options */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Notice Appearance & Pastoral Message (Visitor Screen)
            </h4>
            <span className="text-[11px] text-stone-400 italic">
              Customizes the full-screen visitor portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Notice Badge Pill
              </label>
              <input
                type="text"
                value={settings.maintenance_overall_badge || ''}
                onChange={(e) => handleChange('maintenance_overall_badge', e.target.value)}
                placeholder={OVERALL_MAINTENANCE_DEFAULTS.defaultBadge}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Main Notice Headline
              </label>
              <input
                type="text"
                value={settings.maintenance_overall_title || ''}
                onChange={(e) => handleChange('maintenance_overall_title', e.target.value)}
                placeholder={OVERALL_MAINTENANCE_DEFAULTS.defaultTitle}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Detailed Announcement / Pastoral Explanation
            </label>
            <textarea
              rows={3}
              value={settings.maintenance_overall_desc || ''}
              onChange={(e) => handleChange('maintenance_overall_desc', e.target.value)}
              placeholder={OVERALL_MAINTENANCE_DEFAULTS.defaultDesc}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Sacramental & Mass Schedule Reassurance Note
            </label>
            <input
              type="text"
              value={settings.maintenance_overall_advisory || ''}
              onChange={(e) => handleChange('maintenance_overall_advisory', e.target.value)}
              placeholder={OVERALL_MAINTENANCE_DEFAULTS.defaultAdvisory}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
              <input
                type="checkbox"
                checked={settings.maintenance_overall_show_phone !== 'false'}
                onChange={(e) => handleChange('maintenance_overall_show_phone', e.target.checked ? 'true' : 'false')}
                className="rounded text-[#A81B2B] focus:ring-[#A81B2B]"
              />
              <span>Display Parish Office Telephone on Screen</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
              <input
                type="checkbox"
                checked={settings.maintenance_overall_show_fb !== 'false'}
                onChange={(e) => handleChange('maintenance_overall_show_fb', e.target.checked ? 'true' : 'false')}
                className="rounded text-[#A81B2B] focus:ring-[#A81B2B]"
              />
              <span>Display Official Facebook Link on Screen</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="font-serif-heading font-bold text-base text-stone-900 border-b border-stone-100 pb-3 mb-4">
            Parish Website Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Parish Legal Name</label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Official Tagline</label>
              <input
                type="text"
                value={settings.site_tagline || ''}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif-heading font-bold text-base text-stone-900 border-b border-stone-100 pb-3 mb-4">
            SEO & Search Visibility
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Default Meta Title</label>
              <input
                type="text"
                value={settings.seo_default_title || ''}
                onChange={(e) => handleChange('seo_default_title', e.target.value)}
                placeholder="Parish of the Alliance of the Two Hearts — Official Website"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Default Meta Description</label>
              <textarea
                rows={3}
                value={settings.seo_default_description || ''}
                onChange={(e) => handleChange('seo_default_description', e.target.value)}
                placeholder="Official online home of the Parish of the Alliance of the Two Hearts (PATH)..."
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif-heading font-bold text-base text-stone-900 border-b border-stone-100 pb-3 mb-4">
            Publishing & Maintenance Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Parish Office Notification Email</label>
              <input
                type="email"
                value={settings.notification_email || ''}
                onChange={(e) => handleChange('notification_email', e.target.value)}
                placeholder="office@path.org"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Admin Session Timeout</label>
              <select
                value={settings.session_timeout || '24h'}
                onChange={(e) => handleChange('session_timeout', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              >
                <option value="2h">2 Hours</option>
                <option value="8h">8 Hours</option>
                <option value="24h">24 Hours (Standard)</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-stone-200">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All modifications sync directly to the persistent database.</span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#68001a] text-white text-xs font-bold shadow-xs disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Admin Security & Password Change */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-xl bg-[#800020]/10 flex items-center justify-center text-[#800020]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-heading font-bold text-lg text-stone-900">
              Admin Account & Password Security
            </h2>
            <p className="text-xs text-stone-500">
              Update your administrator credentials. All changes are encrypted with BCrypt and committed directly to the database.
            </p>
          </div>
        </div>

        {/* Current Account Info Banner */}
        <div className="mb-6 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Authenticated Administrator</div>
            <div className="text-sm font-semibold text-stone-800 font-mono mt-0.5">
              {user?.email || 'pathsoccomit@gmail.com'}
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            Database-Managed Account
          </div>
        </div>

        {pwStatus && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              pwStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {pwStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{pwStatus.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                required
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-type new password"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              Minimum 6 characters. Use letters, numbers, and symbols for high security.
            </span>
            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#68001a] text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              {pwLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
