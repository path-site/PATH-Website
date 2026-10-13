import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import ImageUploadInput from '../../components/admin/ImageUploadInput';
import { 
  Bell, Plus, Edit, Trash2, Eye, EyeOff, Archive, Check, X, 
  Send, Clock, CheckCircle2, AlertCircle, Filter, Inbox 
} from 'lucide-react';

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gathered'); // Default to 'gathered' to emphasize the gathering workflow
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [isPublishingBatch, setIsPublishingBatch] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Liturgy',
    summary: '',
    content: '',
    featuredImageUrl: '',
    status: 'DRAFT', // GATHER FIRST WORKFLOW: Default to DRAFT (Gathered pool)
  });

  const categories = ['Liturgy', 'Parish Life', 'Youth', 'Sacraments', 'Community', 'General'];

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnnouncements();
      if (res.data) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Compute counts
  const gatheredItems = announcements.filter((a) => a.status === 'DRAFT');
  const publishedItems = announcements.filter((a) => a.status === 'PUBLISHED');
  const archivedItems = announcements.filter((a) => a.status === 'ARCHIVED');

  // Filtered list based on active tab
  const displayedItems = announcements.filter((a) => {
    if (activeTab === 'gathered') return a.status === 'DRAFT';
    if (activeTab === 'published') return a.status === 'PUBLISHED';
    if (activeTab === 'archived') return a.status === 'ARCHIVED';
    return true; // 'all'
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Liturgy',
      summary: '',
      content: '',
      featuredImageUrl: '',
      status: 'DRAFT', // Default is Gathered / Pending
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category || 'General',
      summary: item.summary || '',
      content: item.content || '',
      featuredImageUrl: item.featuredImageUrl || '',
      status: item.status || 'DRAFT',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateAnnouncement(editingItem.id, formData);
        setNotice('Announcement updated successfully.');
      } else {
        await adminApi.createAnnouncement(formData);
        setNotice(
          formData.status === 'DRAFT'
            ? 'Announcement added to Gathered pool. Ready for review and publication.'
            : 'Announcement published successfully.'
        );
      }
      setModalOpen(false);
      fetchAnnouncements();
      setTimeout(() => setNotice(''), 3500);
    } catch (err) {
      alert(err.message);
    }
  };

  // Publish a single announcement
  const handlePublishSingle = async (item) => {
    try {
      await adminApi.publishAnnouncement(item.id);
      setNotice(`"${item.title}" is now published on the website.`);
      setTimeout(() => setNotice(''), 3500);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  // Unpublish / revert back to gathered draft
  const handleUnpublishSingle = async (item) => {
    try {
      await adminApi.unpublishAnnouncement(item.id);
      setNotice(`"${item.title}" reverted to Gathered draft pool.`);
      setTimeout(() => setNotice(''), 3500);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  // Publish all gathered announcements
  const handlePublishAllGathered = async () => {
    if (gatheredItems.length === 0) return;
    const confirmMessage = `Publish all ${gatheredItems.length} gathered announcement(s) to the public website?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setIsPublishingBatch(true);
      const idsToPublish = gatheredItems.map((a) => a.id);
      await adminApi.publishBatchAnnouncements(idsToPublish);
      setSelectedIds([]);
      setNotice(`Successfully published all ${idsToPublish.length} gathered announcements!`);
      setTimeout(() => setNotice(''), 4000);
      fetchAnnouncements();
      setActiveTab('published');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsPublishingBatch(false);
    }
  };

  // Publish selected announcements
  const handlePublishSelected = async () => {
    if (selectedIds.length === 0) return;
    const confirmMessage = `Publish ${selectedIds.length} selected announcement(s) to the website?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setIsPublishingBatch(true);
      await adminApi.publishBatchAnnouncements(selectedIds);
      setSelectedIds([]);
      setNotice(`Successfully published ${selectedIds.length} announcements.`);
      setTimeout(() => setNotice(''), 4000);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsPublishingBatch(false);
    }
  };

  const handleArchive = async (item) => {
    try {
      await adminApi.archiveAnnouncement(item.id);
      setNotice(`"${item.title}" archived.`);
      setTimeout(() => setNotice(''), 3000);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete announcement "${item.title}"?`)) return;
    try {
      await adminApi.deleteAnnouncement(item.id);
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      setNotice('Announcement deleted.');
      setTimeout(() => setNotice(''), 3000);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  // Selection toggle
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = displayedItems.map((a) => a.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#800020]/10 text-[#800020]">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
              Announcements & Advisories
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 pl-1">
            Gather and curate weekly notices, liturgy schedules, and pastoral advisories before publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {gatheredItems.length > 0 && (
            <button
              onClick={handlePublishAllGathered}
              disabled={isPublishingBatch}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish All Gathered ({gatheredItems.length})</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Gather New Announcement</span>
          </button>
        </div>
      </div>

      {/* Workflow Guidance Card */}
      <div className="bg-gradient-to-r from-stone-50 via-amber-50/40 to-stone-50 rounded-3xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#800020] text-white text-xs font-bold">
                i
              </span>
              <h2 className="text-sm font-bold text-stone-800">
                Parish Announcement Gathering Workflow
              </h2>
            </div>
            <p className="text-xs text-stone-600">
              New notices start in the <strong>Gathered Pool (Draft)</strong> so your team can compile all weekly items first. Once approved, publish them all at once or individually to the public parish website.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>1. Gather First ({gatheredItems.length})</span>
            </div>
            <span className="text-stone-300">➔</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>2. Publish ({publishedItems.length})</span>
            </div>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200 shadow-xs">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Workflow Tabs & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('gathered')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'gathered'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Gathered Pool</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === 'gathered' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'
            }`}>
              {gatheredItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'published'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Published</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === 'published' ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {publishedItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'archived'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === 'archived' ? 'bg-stone-900 text-stone-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {archivedItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'all'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            <span>All</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === 'all' ? 'bg-[#550015] text-rose-100' : 'bg-stone-100 text-stone-700'
            }`}>
              {announcements.length}
            </span>
          </button>
        </div>

        {/* Batch Action Toolbar when items are selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-300">
            <span className="text-xs font-bold text-stone-700">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handlePublishSelected}
              disabled={isPublishingBatch}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Publish Selected</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-stone-500 hover:text-stone-800 underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      displayedItems.length > 0 &&
                      displayedItems.every((a) => selectedIds.includes(a.id))
                    }
                    onChange={toggleSelectAllVisible}
                    className="rounded border-stone-300 text-[#800020] focus:ring-[#800020]"
                  />
                </th>
                <th className="px-6 py-4">Title & Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-stone-300" />
                      <p className="text-sm font-semibold text-stone-500">
                        {activeTab === 'gathered'
                          ? 'No announcements currently in the gathered pool.'
                          : 'No announcements found in this view.'}
                      </p>
                      {activeTab === 'gathered' && (
                        <button
                          onClick={openCreateModal}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold uppercase tracking-wider"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Gather First Announcement</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedItems.map((a) => {
                  const isSelected = selectedIds.includes(a.id);
                  const isDraft = a.status === 'DRAFT';
                  const isPublished = a.status === 'PUBLISHED';

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        isSelected ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(a.id)}
                          className="rounded border-stone-300 text-[#800020] focus:ring-[#800020]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-900 max-w-sm truncate">
                          {a.title}
                        </div>
                        {a.summary && (
                          <div className="text-xs text-stone-500 max-w-sm truncate mt-0.5">
                            {a.summary}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-semibold">
                          {a.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.status === 'ARCHIVED'
                              ? 'bg-stone-200 text-stone-700'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isPublished ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Published (Live)</span>
                            </>
                          ) : a.status === 'ARCHIVED' ? (
                            <span>Archived</span>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Gathered (Draft)</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500 whitespace-nowrap">
                        {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Quick Publish for Gathered items */}
                        {isDraft && (
                          <button
                            onClick={() => handlePublishSingle(a)}
                            title="Publish to Website"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish</span>
                          </button>
                        )}

                        {/* Revert to Draft if Published */}
                        {isPublished && (
                          <button
                            onClick={() => handleUnpublishSingle(a)}
                            title="Revert back to Gathered Pool"
                            className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleArchive(a)}
                          title="Archive"
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(a)}
                          title="Edit"
                          className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          title="Delete"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                  {editingItem ? 'Edit Announcement' : 'Gather New Announcement'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {editingItem
                    ? 'Update announcement contents and publication settings.'
                    : 'Draft and gather announcement into the weekly queue before publishing.'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: !editingItem
                        ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                        : formData.slug,
                    });
                  }}
                  placeholder="e.g. Solemnity Mass Schedule, Youth Ministry Assembly..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm font-mono text-stone-700"
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
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <ImageUploadInput
                  label="Featured Image (Optional)"
                  value={formData.featuredImageUrl}
                  onChange={(url) => setFormData({ ...formData, featuredImageUrl: url })}
                  placeholder="Upload photo or enter URL..."
                  helpText="Upload a poster or photo directly to the database."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Summary
                </label>
                <textarea
                  rows="2"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="A brief 1-2 sentence overview shown on homepage cards and list views..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Announcement Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="6"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed guidelines, date/time particulars, contacts, and instructions..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Workflow State / Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                >
                  <option value="DRAFT">
                    Gathered Pool (Draft - Gather first, publish when ready)
                  </option>
                  <option value="PUBLISHED">
                    Published (Live immediately on public parish website)
                  </option>
                  <option value="ARCHIVED">
                    Archived
                  </option>
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  {formData.status === 'DRAFT'
                    ? 'Notice will be safely gathered in the draft queue and not visible to parishioners until published.'
                    : 'Notice will be live immediately for public parish visitors.'}
                </p>
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
                  className="px-6 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
                >
                  {formData.status === 'DRAFT' ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Save to Gathered Pool</span>
                    </>
                  ) : formData.status === 'PUBLISHED' ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Save & Publish</span>
                    </>
                  ) : (
                    <span>Save Announcement</span>
                  )}
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
