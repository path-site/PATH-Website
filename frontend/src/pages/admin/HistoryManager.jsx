import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { History, Plus, Edit, Trash2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

export default function HistoryManager() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    eventDate: '',
    description: '',
    imageUrl: '',
    isPublished: true,
  });

  const fetchHistory = async () => {
    try {
      const res = await adminApi.getHistory();
      if (res.data) setMilestones(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      eventDate: '',
      description: '',
      imageUrl: '',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      eventDate: item.eventDate,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      isPublished: item.isPublished !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateMilestone(editingItem.id, formData);
      } else {
        await adminApi.createMilestone(formData);
      }
      setModalOpen(false);
      fetchHistory();
      setNotice('History milestone saved successfully.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= milestones.length) return;

    const copy = [...milestones];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    const reordered = copy.map((m, idx) => ({ ...m, displayOrder: idx }));
    setMilestones(reordered);

    try {
      await adminApi.reorderHistory(reordered.map(m => ({ id: m.id, displayOrder: m.displayOrder })));
    } catch (err) {
      fetchHistory();
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete milestone "${item.title}"?`)) return;
    try {
      await adminApi.deleteMilestone(item.id);
      fetchHistory();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Church History Timeline Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Maintain historical milestones, founding records, dates, and historical photographs.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Milestone</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Milestones List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        {milestones.map((m, idx) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl border border-stone-200 hover:border-[#800020]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-[#800020] uppercase tracking-wider">
                  {m.eventDate}
                </span>
                <h3 className="font-serif-heading font-bold text-stone-900 text-base mt-1">
                  {m.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                  {m.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0}
                className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMove(idx, 1)}
                disabled={idx === milestones.length - 1}
                className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => openEditModal(m)}
                className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(m)}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                {editingItem ? 'Edit Milestone' : 'New Milestone'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Milestone Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Canonical Erection of the Parish"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Event Date / Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  placeholder="e.g. October 1996 or 2002"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Historical Photograph URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://... or upload in Media Library"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description of Milestone
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
