import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { PhoneCall, Check, Save, RefreshCw } from 'lucide-react';

export default function ContactSettings() {
  const { settings, refreshSettings } = useTheme();
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveSettings(formData);
      await refreshSettings();
      setNotice('Contact details and schedules updated successfully!');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1.5 border border-amber-200">
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span>Parish Inquiries</span>
          </div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Contact & Liturgical Schedules Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Update parish physical address, telephone lines, office hours, mass times, and social links.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-60"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Office & Contact Lines */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
          <h2 className="font-serif-heading text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
            Parish Office Details
          </h2>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Complete Parish Church Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Telephone & Mobile Numbers
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Parish Office Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Parish Office Hours
            </label>
            <textarea
              rows="3"
              name="office_hours"
              value={formData.office_hours || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Facebook Page URL
            </label>
            <input
              type="url"
              name="facebook_url"
              value={formData.facebook_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
            />
          </div>
        </div>

        {/* Mass & Sacrament Schedules */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
          <h2 className="font-serif-heading text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
            Sacramental & Mass Schedules
          </h2>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Holy Mass Schedules (One line per schedule)
            </label>
            <textarea
              rows="6"
              name="mass_schedules"
              value={formData.mass_schedules || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Sacrament of Reconciliation (Confessions Schedule)
            </label>
            <textarea
              rows="3"
              name="confession_schedule"
              value={formData.confession_schedule || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm leading-relaxed"
            />
          </div>
        </div>

      </form>

    </div>
  );
}
