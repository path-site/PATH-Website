import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { publicApi } from '../../services/api';
import { 
  MapPin, Phone, Mail, Clock, Calendar, Send, 
  CheckCircle, AlertCircle 
} from 'lucide-react';
import { FacebookIcon } from '../../components/common/SocialIcons';
import MassScheduleView from '../../components/common/MassScheduleView';

export default function ContactPage() {
  const { settings } = useTheme();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    if (location.hash === '#mass-schedule') {
      const el = document.getElementById('mass-schedule');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await publicApi.submitContact(formData);
      setStatus({ type: 'success', message: res.message || 'Thank you! Your message has been sent to the parish office.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to send message. Please try again or call the parish directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-3">
            Get in Touch
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            Contact & Mass Schedules
          </h1>
          <p className="mt-4 text-stone-600 text-base sm:text-lg leading-relaxed">
            Reach out to our parish office for mass intentions, sacramental certificates, wedding or baptism inquiries, or pastoral counseling appointments.
          </p>
        </div>

        {/* Official Parish Mass Schedules Display */}
        <section id="mass-schedule" className="mb-14 scroll-mt-28 scroll-reveal">
          <MassScheduleView />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Parish Information (5 cols) */}
          <div className="lg:col-span-5 space-y-8 scroll-reveal-left">
            
            {/* Contact Card */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-md space-y-6">
              <h2 className="font-serif-heading text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                Parish Office Details
              </h2>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Parish Address</span>
                  <p className="text-sm font-medium text-stone-800 leading-snug mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Telephone & Mobile</span>
                  <p className="text-sm font-medium text-stone-800 leading-snug mt-0.5">{settings.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Email Address</span>
                  <p className="text-sm font-medium text-stone-800 leading-snug mt-0.5">{settings.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Office Hours</span>
                  <p className="text-xs sm:text-sm font-medium text-stone-800 whitespace-pre-line leading-relaxed mt-0.5">
                    {settings.office_hours}
                  </p>
                </div>
              </div>

              {/* Social Media links */}
              <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Connect:</span>
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-stone-100 hover:bg-[#1877F2] text-stone-700 hover:text-white transition-colors"
                    aria-label="Facebook Page"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Liturgical Schedules Card */}
            <div className="bg-[#191516] text-white rounded-3xl p-8 shadow-xl border-t-4 border-[#C5A059] space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Calendar className="w-5 h-5" />
                <h3 className="font-serif-heading text-lg font-bold uppercase tracking-wider">
                  Liturgical Schedules
                </h3>
              </div>
              <div className="text-xs sm:text-sm text-stone-300 whitespace-pre-line leading-relaxed bg-stone-900/80 p-4 rounded-xl border border-stone-800">
                {settings.mass_schedules}
              </div>
              <div className="text-xs text-stone-400 pt-2">
                <span className="text-amber-400 font-bold block mb-1">Confessions:</span>
                <p className="whitespace-pre-line">{settings.confession_schedule}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8 scroll-reveal-right">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-md">
              <h2 className="font-serif-heading text-2xl font-bold text-stone-900 mb-2">
                Send a Message to the Parish Office
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                Have a question or sacramental inquiry? Send us a message and our parish staff will respond promptly.
              </p>

              {status && (
                <div
                  className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm font-medium ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Maria Santos"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D2F] bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="maria@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D2F] bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Subject / Purpose
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Mass Intention / Baptism Inquiry / General Question"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D2F] bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please type your message or inquiry here..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D2F] bg-stone-50/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#6B1D2F] hover:bg-[#541624] text-white text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Embedded Location Map Representation */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md overflow-hidden">
              <h3 className="font-serif-heading text-lg font-bold text-stone-900 mb-3">
                Parish Church Location Map
              </h3>
              <div className="w-full h-64 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden relative flex items-center justify-center">
                <iframe
                  title="Parish Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src="https://maps.google.com/maps?q=Alliance+of+the+Two+Hearts+Church+Banawa+Cebu+City&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
