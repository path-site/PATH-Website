import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import ImageUploadInput from '../../components/admin/ImageUploadInput';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { sortPriests } from '../../utils/priestSorter';
import { Users, Plus, Edit, Trash2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

export default function PriestManager() {
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    title: 'Parish Priest',
    biography: '',
    portraitImageUrl: '',
    serviceStart: '',
    serviceEnd: 'Present',
    priestStatus: 'CURRENT',
    isPublished: true,
  });

  const fetchPriests = async () => {
    try {
      const res = await adminApi.getPriests();
      if (res.data) setPriests(sortPriests(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriests();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      fullName: '',
      title: 'Parish Priest',
      biography: '',
      portraitImageUrl: '',
      serviceStart: new Date().getFullYear().toString(),
      serviceEnd: 'Present',
      priestStatus: 'CURRENT',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      fullName: item.fullName,
      title: item.title || '',
      biography: item.biography || '',
      portraitImageUrl: item.portraitImageUrl || '',
      serviceStart: item.serviceStart || '',
      serviceEnd: item.serviceEnd || '',
      priestStatus: item.priestStatus || 'CURRENT',
      isPublished: item.isPublished !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updatePriest(editingItem.id, formData);
      } else {
        await adminApi.createPriest(formData);
      }
      setModalOpen(false);
      fetchPriests();
      setNotice('Priest profile saved successfully.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= priests.length) return;

    const copy = [...priests];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    const reordered = copy.map((p, idx) => ({ ...p, displayOrder: idx }));
    setPriests(reordered);

    try {
      await adminApi.reorderPriests(reordered.map(p => ({ id: p.id, displayOrder: p.displayOrder })));
    } catch (err) {
      fetchPriests();
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete profile for "${item.fullName}"?`)) return;
    try {
      await adminApi.deletePriest(item.id);
      fetchPriests();
    } catch (err) {
      alert(err.message);
    }
  };

  const currentCount = priests.filter(p => p.priestStatus === 'CURRENT').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentCount === 3
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {currentCount === 3 ? '✓ 3 Priests (Current Set)' : `${currentCount}/3 Priests in Current Set`}
            </span>
          </div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Priests Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Maintain the 3 priests assigned per set, past sets, biographies, and terms. Within each year range, the Team Moderator is listed first.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A81B2B] hover:bg-[#8F1624] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Priest Profile</span>
        </button>
      </div>

      {/* Pastoral Set Explanatory Callout */}
      <div className="bg-[#FAF7F0] border border-[#C59B3F]/35 rounded-2xl p-4 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="font-bold text-[#8F6B1E] uppercase tracking-wider text-[11px] shrink-0 px-2 py-0.5 bg-[#C59B3F]/15 rounded-md border border-[#C59B3F]/30">
            Auto-Sorted by Year
          </span>
          <span>
            The directory is automatically sorted with the <strong>Current Set</strong> on top, followed by <strong>Past Sets</strong> in descending order by year. Within each year range, the <strong>Team Moderator is placed first</strong>.
          </span>
        </div>
        <div className="shrink-0 font-semibold text-stone-600">
          Total in Registry: {priests.length}
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Priests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {priests.map((p, idx) => (
          <div
            key={p.id}
            className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all ${
              p.priestStatus === 'CURRENT' && idx < 3
                ? 'border-[#C59B3F]/50 ring-1 ring-[#C59B3F]/20'
                : 'border-stone-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    p.priestStatus === 'CURRENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {p.priestStatus === 'CURRENT' ? 'CURRENT SET' : 'PAST SET'}
                  </span>
                  {p.title?.toLowerCase().includes('moderator') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-100 text-[#8F6B1E] border border-[#C59B3F]/40 flex items-center gap-1">
                      <span>★</span> Moderator (1st in Set)
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-400 font-mono">Order: #{idx + 1}</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {p.portraitImageUrl ? (
                  <img
                    src={resolveMediaUrl(p.portraitImageUrl)}
                    alt={p.fullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#C59B3F]/30 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#C59B3F]/15 border border-[#C59B3F]/30 flex items-center justify-center shrink-0 text-[#8F6B1E]">
                    <Users className="w-7 h-7" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif-heading font-bold text-stone-900 text-base leading-tight truncate">
                    {p.fullName}
                  </h3>
                  <span className="text-xs text-[#A81B2B] font-bold block mt-0.5">
                    {p.title}
                  </span>
                  <span className="text-xs text-stone-500 font-medium block mt-0.5">
                    {p.serviceStart} – {p.serviceEnd}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                {p.biography}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  title="Move Up"
                  className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === priests.length - 1}
                  title="Move Down"
                  className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1.5 text-stone-600 hover:text-[#A81B2B] hover:bg-stone-100 rounded-lg"
                  title="Edit Profile"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                {editingItem ? 'Edit Priest Profile' : 'New Priest Profile'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rev. Fr. Emmanuel Santos"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Title / Office
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Parish Priest / Team Moderator"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A81B2B]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Team Moderator', 'Parish Priest', 'Parochial Vicar', 'Former Team Moderator', 'Former Parish Priest'].map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFormData({ ...formData, title: t })}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 hover:bg-[#C59B3F]/20 hover:text-[#8F6B1E] transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 italic">
                    Note: Priests with "Team Moderator" in their title are automatically placed 1st within their year range.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Status Designation
                  </label>
                  <select
                    value={formData.priestStatus}
                    onChange={(e) => setFormData({ ...formData, priestStatus: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A81B2B]"
                  >
                    <option value="CURRENT">Current Set of Priests (Active)</option>
                    <option value="FORMER">Past Set / Former Parish Priest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Service Start Year
                  </label>
                  <input
                    type="text"
                    value={formData.serviceStart}
                    onChange={(e) => setFormData({ ...formData, serviceStart: e.target.value })}
                    placeholder="2021"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A81B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Service End Year
                  </label>
                  <input
                    type="text"
                    value={formData.serviceEnd}
                    onChange={(e) => setFormData({ ...formData, serviceEnd: e.target.value })}
                    placeholder="Present"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A81B2B]"
                  />
                </div>
              </div>

              <div>
                <ImageUploadInput
                  label="Portrait Photo"
                  value={formData.portraitImageUrl}
                  onChange={(url) => setFormData({ ...formData, portraitImageUrl: url })}
                  placeholder="Upload priest portrait or enter URL..."
                  helpText="Upload a clergy portrait directly to the database."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Biography & Ministry Details
                </label>
                <textarea
                  rows="3"
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Describe pastoral focus, ministries overseen, or canonical assignments..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A81B2B]"
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
                  className="px-6 py-2 rounded-xl bg-[#A81B2B] hover:bg-[#8F1624] text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Profile
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
