import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import ImageUploadInput from '../../components/admin/ImageUploadInput';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { sortPriests, isPriestDeceased } from '../../utils/priestSorter';
import { Users, Plus, Edit, Trash2, ArrowUp, ArrowDown, Check, X, Search, Filter } from 'lucide-react';

export default function PriestManager() {
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CURRENT, FORMER, DECEASED
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    title: 'Parish Priest',
    biography: '',
    portraitImageUrl: '',
    serviceStart: '',
    serviceEnd: 'Present',
    priestStatus: 'CURRENT',
    isDeceased: false,
    dateOfDeath: '',
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
      isDeceased: false,
      dateOfDeath: '',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const deceased = isPriestDeceased(item);
    setFormData({
      fullName: item.fullName,
      title: item.title || '',
      biography: item.biography || '',
      portraitImageUrl: item.portraitImageUrl || '',
      serviceStart: item.serviceStart || '',
      serviceEnd: item.serviceEnd || '',
      priestStatus: item.priestStatus || (deceased ? 'DECEASED' : 'CURRENT'),
      isDeceased: deceased,
      dateOfDeath: item.dateOfDeath || '',
      isPublished: item.isPublished !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        title: formData.title,
        biography: formData.biography,
        portraitImageUrl: formData.portraitImageUrl,
        serviceStart: formData.serviceStart,
        serviceEnd: formData.serviceEnd,
        priestStatus: formData.isDeceased ? 'DECEASED' : (formData.priestStatus === 'DECEASED' ? 'FORMER' : formData.priestStatus),
        isDeceased: Boolean(formData.isDeceased || formData.priestStatus === 'DECEASED'),
        dateOfDeath: formData.dateOfDeath || '',
        isPublished: formData.isPublished,
      };

      if (editingItem) {
        await adminApi.updatePriest(editingItem.id, payload);
      } else {
        await adminApi.createPriest(payload);
      }
      setModalOpen(false);
      fetchPriests();
      setNotice(formData.isDeceased ? 'Priest profile saved with In Memoriam (Deceased) designation.' : 'Priest profile saved successfully.');
      setTimeout(() => setNotice(''), 3500);
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
  const formerCount = priests.filter(p => p.priestStatus === 'FORMER' && !isPriestDeceased(p)).length;
  const deceasedCount = priests.filter(p => isPriestDeceased(p)).length;

  const filteredPriests = priests.filter(p => {
    const isDec = isPriestDeceased(p);
    if (statusFilter === 'CURRENT' && p.priestStatus !== 'CURRENT') return false;
    if (statusFilter === 'FORMER' && (p.priestStatus !== 'FORMER' || isDec)) return false;
    if (statusFilter === 'DECEASED' && !isDec) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.fullName?.toLowerCase().includes(q);
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchBio = p.biography?.toLowerCase().includes(q);
      const matchYears = `${p.serviceStart || ''} ${p.serviceEnd || ''} ${p.dateOfDeath || ''}`.toLowerCase().includes(q);
      return matchName || matchTitle || matchBio || matchYears;
    }
    return true;
  });

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
            {deceasedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900 text-amber-300 border border-stone-700">
                <span>✝</span>
                <span>{deceasedCount} In Memoriam</span>
              </span>
            )}
          </div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Priests Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Maintain the active pastoral team, past sets, biographies, terms, and deceased clergy in memoriam.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A81B2B] hover:bg-[#8F1624] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all self-start sm:self-auto cursor-pointer"
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

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clergy by name, title, term, or biography..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/20 bg-stone-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Clergy ({priests.length})
          </button>
          <button
            onClick={() => setStatusFilter('CURRENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'CURRENT'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Current Set ({currentCount})
          </button>
          <button
            onClick={() => setStatusFilter('FORMER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'FORMER'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Past Clergy ({formerCount})
          </button>
          <button
            onClick={() => setStatusFilter('DECEASED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'DECEASED'
                ? 'bg-stone-900 text-amber-300 shadow-xs border border-amber-400/50'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>✝</span>
            <span>Deceased ({deceasedCount})</span>
          </button>
        </div>
      </div>

      {/* Priests Grid */}
      {filteredPriests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 shadow-xs space-y-3">
          <p className="text-sm font-semibold text-stone-600">No clergy profiles found matching your selection.</p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPriests.map((p, idx) => {
            const isDeceased = isPriestDeceased(p);
            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all ${
                  isDeceased
                    ? 'border-stone-800 bg-stone-50/70 ring-1 ring-stone-900/10'
                    : (p.title?.toLowerCase().includes('moderator')
                      ? 'border-[#C59B3F]/70 ring-2 ring-[#C59B3F]/25 shadow-amber-50'
                      : 'border-stone-200')
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {isDeceased ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-stone-900 text-amber-300 border border-stone-700 flex items-center gap-1 shadow-xs">
                        <span>✝</span>
                        <span>DECEASED / IN MEMORIAM</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        p.priestStatus === 'CURRENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {p.priestStatus === 'CURRENT' ? 'CURRENT SET' : 'PAST SET'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative shrink-0">
                      {p.portraitImageUrl ? (
                        <img
                          src={resolveMediaUrl(p.portraitImageUrl)}
                          alt={p.fullName}
                          className={`w-16 h-16 rounded-2xl object-cover ring-2 shrink-0 ${
                            isDeceased
                              ? 'ring-stone-800 filter grayscale-[25%]'
                              : 'ring-[#C59B3F]/30'
                          }`}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#C59B3F]/15 border border-[#C59B3F]/30 flex items-center justify-center shrink-0 text-[#8F6B1E]">
                          <Users className="w-7 h-7" />
                        </div>
                      )}
                      {isDeceased && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-900 text-amber-400 border border-amber-300/60 text-[10px] font-bold flex items-center justify-center shadow-xs" title="Deceased">
                          ✝
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-heading font-bold text-stone-900 text-base leading-tight truncate flex items-center gap-1">
                        {isDeceased && <span className="text-stone-500 font-serif font-bold">†</span>}
                        <span className="truncate">{p.fullName}</span>
                      </h3>
                      {p.title?.toLowerCase().includes('moderator') ? (
                        <span className="inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#C59B3F] text-[#1C1814] border border-amber-300 mt-1 shadow-2xs">
                          {p.title}
                        </span>
                      ) : (
                        <span className="text-xs text-[#A81B2B] font-bold block mt-0.5">
                          {p.title}
                        </span>
                      )}
                      <span className="text-xs text-stone-500 font-medium block mt-1">
                        {p.serviceStart} – {p.serviceEnd}
                        {p.dateOfDeath && ` • ✝ ${p.dateOfDeath}`}
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
                      className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === priests.length - 1}
                      title="Move Down"
                      className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-stone-600 hover:text-[#A81B2B] hover:bg-stone-100 rounded-lg cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                {editingItem ? 'Edit Priest Profile' : 'New Priest Profile'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer">
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
                    {['Team Moderator', 'Parish Priest', 'Parochial Vicar', 'Former Team Moderator', 'Former Parish Priest', 'Former Parochial Vicar'].map(t => {
                      const isGold = t.toLowerCase().includes('moderator');
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setFormData({ ...formData, title: t })}
                          className={`text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer ${
                            isGold
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold hover:bg-amber-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-[#C59B3F]/20 hover:text-[#8F6B1E]'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 italic">
                    Note: Priests with "Team Moderator" receive the distinctive gold status label effect and are placed first within their pastoral set.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Status Designation
                  </label>
                  <select
                    value={formData.isDeceased ? 'DECEASED' : formData.priestStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'DECEASED') {
                        setFormData({ ...formData, priestStatus: 'DECEASED', isDeceased: true });
                      } else {
                        setFormData({ ...formData, priestStatus: val, isDeceased: false });
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A81B2B]"
                  >
                    <option value="CURRENT">Current Set of Priests (Active)</option>
                    <option value="FORMER">Past Set / Former Parish Priest (Living)</option>
                    <option value="DECEASED">Deceased / In Memoriam (✝)</option>
                  </select>
                </div>
              </div>

              {/* Deceased Priest Toggle & Details */}
              <div className={`p-4 rounded-2xl border transition-all ${
                formData.isDeceased
                  ? 'bg-stone-900 text-white border-stone-800 shadow-md'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-base font-bold ${formData.isDeceased ? 'text-amber-400' : 'text-stone-400'}`}>
                      ✝
                    </span>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider block ${formData.isDeceased ? 'text-white' : 'text-stone-800'}`}>
                        Mark as Deceased (In Memoriam)
                      </span>
                      <span className={`text-[11px] block mt-0.5 ${formData.isDeceased ? 'text-stone-300' : 'text-stone-500'}`}>
                        Displays the priest with a reverent memorial ribbon, cross icon, and in memoriam badge.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isDeceased)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          isDeceased: checked,
                          priestStatus: checked ? 'DECEASED' : (formData.priestStatus === 'DECEASED' ? 'FORMER' : formData.priestStatus),
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {formData.isDeceased && (
                  <div className="mt-3 pt-3 border-t border-stone-700/80">
                    <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Year / Date of Passing (Called to Eternal Rest)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2021 or August 15, 2023"
                      value={formData.dateOfDeath || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-600 bg-stone-800 text-white text-xs placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                )}
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
