import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import SectionMaintenanceBar from '../../components/admin/SectionMaintenanceBar';
import { 
  Phone, Smartphone, PhoneCall, Check, Save, RefreshCw, Mail, MessageSquare, 
  Trash2, Send, Clock, User, AlertCircle, CheckCircle2, RotateCw
} from 'lucide-react';
import { resolveContactNumbers } from '../../context/ThemeContext';

export default function ContactSettings() {
  const { settings, refreshSettings } = useTheme();
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'inquiries'
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  // Inquiries state
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  useEffect(() => {
    if (settings) {
      const { telephone, mobile } = resolveContactNumbers(settings);
      setFormData({
        ...settings,
        telephone: settings.telephone !== undefined ? settings.telephone : telephone,
        mobile_number: (settings.mobile_number || settings.mobile_phone || settings.mobile) !== undefined
          ? (settings.mobile_number || settings.mobile_phone || settings.mobile)
          : mobile,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchMessages();
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await adminApi.getContactMessages();
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        telephone: formData.telephone !== undefined ? formData.telephone : '',
        mobile_number: formData.mobile_number !== undefined ? formData.mobile_number : '',
        phone: [formData.telephone, formData.mobile_number].filter(Boolean).join(' | '),
      };
      await adminApi.saveSettings(payload);
      await refreshSettings();
      setNotice('Contact details and schedules updated successfully!');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminApi.markContactMessageRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleResend = async (id) => {
    setResendingId(id);
    try {
      const res = await adminApi.resendContactMessageEmail(id);
      alert(res.message || 'Email resend completed.');
      fetchMessages();
    } catch (err) {
      alert('Resend failed: ' + err.message);
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await adminApi.deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Failed to delete message: ' + err.message);
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      
      {/* Section Maintenance Control Switch */}
      <SectionMaintenanceBar sectionKey="contactSettings" />

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-1.5">
            Parish Communications & Office Directory
          </span>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Contact & Liturgical Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage contact channels, office schedules, and review inquiries sent to <strong className="text-stone-800">pathbanawa1988@gmail.com</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'settings' ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-60"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          ) : (
            <button
              onClick={fetchMessages}
              disabled={loadingMessages}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider transition-all"
            >
              <RotateCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
              <span>Refresh Inquiries</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'settings'
              ? 'bg-[#800020] text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact & Schedule Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'inquiries'
              ? 'bg-[#800020] text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Received Website Inquiries</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-stone-900 shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: SETTINGS FORM */}
      {activeTab === 'settings' && (
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
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#800020] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>Telephone (Landline)</span>
                </label>
                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone || ''}
                  onChange={handleChange}
                  placeholder="(032) 255 3241"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#800020] outline-none"
                />
                <p className="text-[11px] text-stone-500 mt-1">Official parish office landline.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                  <span>Mobile Number (Cellular)</span>
                </label>
                <input
                  type="text"
                  name="mobile_number"
                  value={formData.mobile_number || ''}
                  onChange={handleChange}
                  placeholder="0942 361 3174"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#800020] outline-none"
                />
                <p className="text-[11px] text-stone-500 mt-1">Official parish mobile / SMS line.</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Parish Office Email (Inquiry Destination)
                </label>
                <span className="text-[11px] font-semibold text-amber-800">
                  Default: pathbanawa1988@gmail.com
                </span>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="pathbanawa1988@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#800020] outline-none font-medium"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                All messages submitted through the public contact form are automatically delivered to this email address.
              </p>
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
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#800020] outline-none"
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
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#800020] outline-none"
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
                rows="7"
                name="mass_schedules"
                value={formData.mass_schedules || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm leading-relaxed focus:ring-2 focus:ring-[#800020] outline-none"
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
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm leading-relaxed focus:ring-2 focus:ring-[#800020] outline-none"
              />
            </div>
          </div>

        </form>
      )}

      {/* TAB 2: INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Mail className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold">Email Forwarding Status:</strong> Inquiries submitted on the website are dispatched directly to <strong className="font-bold underline">pathbanawa1988@gmail.com</strong>. Even if email services experience temporary connection drops, every message is safely stored here in your database.
            </div>
          </div>

          {loadingMessages ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <RefreshCw className="w-6 h-6 animate-spin text-[#800020] mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-600">Loading parish inquiries...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif-heading text-lg font-bold text-stone-800">No Inquiries Yet</h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
                When visitors or parishioners fill out the contact form on the website, their messages will appear here and be sent to pathbanawa1988@gmail.com.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 border transition-all ${
                    item.isRead ? 'border-stone-200' : 'border-[#800020]/40 shadow-xs bg-amber-50/15'
                  }`}
                  onClick={() => !item.isRead && handleMarkRead(item.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#800020]/10 text-[#800020] font-bold flex items-center justify-center shrink-0">
                        {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                            {item.name}
                          </h3>
                          {!item.isRead && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#800020] text-white">
                              NEW
                            </span>
                          )}
                        </div>
                        <a
                          href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || 'Parish Inquiry')}`}
                          className="text-xs font-semibold text-[#800020] hover:underline"
                        >
                          {item.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Email Status Indicator */}
                      {item.emailSent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered to pathbanawa1988@gmail.com</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title={item.sendError}>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Saved in Database</span>
                        </span>
                      )}

                      <span className="text-[11px] text-stone-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>

                  {item.subject && (
                    <div className="mb-2">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        Subject:
                      </span>
                      <p className="text-sm font-semibold text-stone-800">
                        {item.subject}
                      </p>
                    </div>
                  )}

                  <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/70 mb-4">
                    <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || 'Parish Inquiry')}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply via Email</span>
                      </a>

                      <button
                        onClick={() => handleResend(item.id)}
                        disabled={resendingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-all"
                        title="Resend email notification to parish office"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${resendingId === item.id ? 'animate-spin' : ''}`} />
                        <span>Resend Email</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
