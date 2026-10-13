import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Settings, CheckCircle2, AlertCircle, Save, ShieldCheck } from 'lucide-react';

export default function GeneralSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

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
      if (res.data?.success) {
        setSettings(res.data.data || {});
      }
    } catch (err) {
      notify('error', 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveSettings(settings);
      notify('success', 'General system settings saved successfully.');
    } catch (err) {
      notify('error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

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
    </div>
  );
}
