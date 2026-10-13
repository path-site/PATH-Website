import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Calendar, Plus, Edit, Trash2, Eye, EyeOff, Check, X, Clock, MapPin } from 'lucide-react';

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    eventImageUrl: '',
    startDatetime: '',
    endDatetime: '',
    venue: 'Sanctuary',
    category: 'Parish Activity',
    externalUrl: '',
    status: 'PUBLISHED',
  });

  const categories = ['Mass', 'Feast', 'Devotion', 'Formation', 'Youth', 'Parish Activity'];

  const fetchEvents = async () => {
    try {
      const res = await adminApi.getEvents();
      if (res.data) setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 86400000).toISOString().slice(0, 16);
    setFormData({
      title: '',
      slug: '',
      description: '',
      eventImageUrl: '',
      startDatetime: defaultStart,
      endDatetime: '',
      venue: 'Main Sanctuary',
      category: 'Parish Activity',
      externalUrl: '',
      status: 'PUBLISHED',
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description || '',
      eventImageUrl: item.eventImageUrl || '',
      startDatetime: item.startDatetime ? item.startDatetime.slice(0, 16) : '',
      endDatetime: item.endDatetime ? item.endDatetime.slice(0, 16) : '',
      venue: item.venue || '',
      category: item.category || 'Parish Activity',
      externalUrl: item.externalUrl || '',
      status: item.status || 'PUBLISHED',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateEvent(editingItem.id, formData);
      } else {
        await adminApi.createEvent(formData);
      }
      setModalOpen(false);
      fetchEvents();
      setNotice('Event saved successfully.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === 'PUBLISHED') {
        await adminApi.unpublishEvent(item.id);
      } else {
        await adminApi.publishEvent(item.id);
      }
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete activity "${item.title}"?`)) return;
    try {
      await adminApi.deleteEvent(item.id);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Parish Events & Liturgical Calendar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage upcoming feasts, recollection dates, masses, and parish activities.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Venue</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900 max-w-xs truncate">
                    {evt.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-semibold">
                      {evt.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-600 whitespace-nowrap">
                    {new Date(evt.startDatetime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-500">
                    {evt.venue}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      evt.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {evt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePublish(evt)}
                      title={evt.status === 'PUBLISHED' ? 'Revert to Draft' : 'Publish'}
                      className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg"
                    >
                      {evt.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(evt)}
                      className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(evt)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                {editingItem ? 'Edit Activity' : 'New Activity'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: !editingItem ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : formData.slug
                    });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Start Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDatetime}
                    onChange={(e) => setFormData({ ...formData, startDatetime: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDatetime}
                    onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Main Sanctuary"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Poster Image URL
                </label>
                <input
                  type="text"
                  value={formData.eventImageUrl}
                  onChange={(e) => setFormData({ ...formData, eventImageUrl: e.target.value })}
                  placeholder="https://... or upload in Media Library"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Event Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details regarding attendance, schedule, presiders..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  External Registration Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  placeholder="https://forms.gle/..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
