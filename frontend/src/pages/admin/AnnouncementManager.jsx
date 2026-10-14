import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import ImageUploadInput from '../../components/admin/ImageUploadInput';
import { 
  Bell, Plus, Edit, Trash2, Eye, EyeOff, Archive, Check, X, 
  Send, Clock, CheckCircle2, AlertCircle, Filter, Inbox, Search 
} from 'lucide-react';

const generateRandomSlug = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
};

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'published', 'draft', 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [isPublishingBatch, setIsPublishingBatch] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Liturgy',
    summary: '',
    content: '',
    featuredImageUrl: '',
    status: 'PUBLISHED',
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
  const publishedItems = announcements.filter((a) => a.status === 'PUBLISHED');
  const draftItems = announcements.filter((a) => a.status === 'DRAFT');
  const archivedItems = announcements.filter((a) => a.status === 'ARCHIVED');

  // Filtered and searched items
  const displayedItems = announcements.filter((a) => {
    // Tab filter
    if (activeTab === 'published' && a.status !== 'PUBLISHED') return false;
    if (activeTab === 'draft' && a.status !== 'DRAFT') return false;
    if (activeTab === 'archived' && a.status !== 'ARCHIVED') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchCategory = (a.category || '').toLowerCase().includes(q);
      const matchSummary = (a.summary || '').toLowerCase().includes(q);
      return matchTitle || matchCategory || matchSummary;
    }

    return true;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      slug: generateRandomSlug(),
      category: 'Liturgy',
      summary: '',
      content: '',
      featuredImageUrl: '',
      status: 'PUBLISHED',
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug || generateRandomSlug(),
      category: item.category || 'General',
      summary: item.summary || '',
      content: item.content || '',
      featuredImageUrl: item.featuredImageUrl || '',
      status: item.status || 'PUBLISHED',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalSlug = (formData.slug || '').trim() || generateRandomSlug();
      const payload = { ...formData, slug: finalSlug };
      if (editingItem) {
        await adminApi.updateAnnouncement(editingItem.id, payload);
        setNotice('Announcement updated successfully.');
      } else {
        await adminApi.createAnnouncement(payload);
        setNotice(
          formData.status === 'DRAFT'
            ? 'Announcement saved as draft.'
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
      setNotice(`"${item.title}" is now published.`);
      setTimeout(() => setNotice(''), 3500);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  // Unpublish / revert back to draft
  const handleUnpublishSingle = async (item) => {
    try {
      await adminApi.unpublishAnnouncement(item.id);
      setNotice(`"${item.title}" reverted to draft.`);
      setTimeout(() => setNotice(''), 3500);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  // Publish all drafts
  const handlePublishAllDrafts = async () => {
    if (draftItems.length === 0) return;
    const confirmMessage = `Publish all ${draftItems.length} draft announcement(s) to the website?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setIsPublishingBatch(true);
      const idsToPublish = draftItems.map((a) => a.id);
      await adminApi.publishBatchAnnouncements(idsToPublish);
      setSelectedIds([]);
      setNotice(`Successfully published all ${idsToPublish.length} drafts.`);
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
    try {
      setIsPublishingBatch(true);
      await adminApi.publishBatchAnnouncements(selectedIds);
      setSelectedIds([]);
      setNotice(`Successfully published ${selectedIds.length} announcement(s).`);
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
      setNotice(`"${item.title}" moved to archive.`);
      setTimeout(() => setNotice(''), 3000);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await adminApi.deleteAnnouncement(deleteItem.id);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteItem.id));
      setNotice(`"${deleteItem.title}" has been deleted.`);
      setTimeout(() => setNotice(''), 3000);
      setDeleteItem(null);
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
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const tabs = [
    { key: 'all', label: 'All', count: announcements.length },
    { key: 'published', label: 'Published', count: publishedItems.length },
    { key: 'draft', label: 'Drafts', count: draftItems.length },
    { key: 'archived', label: 'Archived', count: archivedItems.length },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="min-w-0">
          <h1 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
            Announcements & Advisories
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
            Create, schedule, and publish parish notices, advisories, and liturgical schedules.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
          {draftItems.length > 0 && (
            <button
              onClick={handlePublishAllDrafts}
              disabled={isPublishingBatch}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider shadow-2xs transition-all disabled:opacity-50 text-center"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Publish All Drafts ({draftItems.length})</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all text-center"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200 shadow-xs animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-stone-200/70 border border-stone-300/60 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-stone-100 text-stone-800 font-bold'
                      : 'bg-stone-300/60 text-stone-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real-time Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-lg border border-stone-800 animate-in fade-in slide-in-from-top-2">
          <span className="text-xs font-bold text-stone-200">
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePublishSelected}
              disabled={isPublishingBatch}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Selected</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl text-stone-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Announcements Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
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
                <th className="px-6 py-4">Title & Summary</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-400">
                    <div className="w-8 h-8 border-3 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-semibold">Loading announcements...</p>
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-9 h-9 text-stone-300" />
                      <p className="text-sm font-semibold text-stone-600">
                        {searchQuery
                          ? `No announcements matching "${searchQuery}".`
                          : activeTab === 'draft'
                          ? 'No draft announcements.'
                          : activeTab === 'published'
                          ? 'No published announcements.'
                          : activeTab === 'archived'
                          ? 'No archived announcements.'
                          : 'No announcements created yet.'}
                      </p>
                      <button
                        onClick={openCreateModal}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#66001a] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Announcement</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedItems.map((a) => {
                  const isSelected = selectedIds.includes(a.id);
                  const isDraft = a.status === 'DRAFT';
                  const isPublished = a.status === 'PUBLISHED';
                  const isArchived = a.status === 'ARCHIVED';

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        isSelected ? 'bg-amber-50/40' : ''
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
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold border border-stone-200/60">
                          {a.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Published</span>
                          </span>
                        ) : isDraft ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Draft</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                            <span>Archived</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500 whitespace-nowrap">
                        {new Date(a.publishedAt || a.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Quick Publish for Draft items */}
                        {isDraft && (
                          <button
                            onClick={() => handlePublishSingle(a)}
                            title="Publish announcement"
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
                            title="Revert to Draft"
                            className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}

                        {!isArchived && (
                          <button
                            onClick={() => handleArchive(a)}
                            title="Archive announcement"
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(a)}
                          title="Edit announcement"
                          className="p-1.5 text-stone-500 hover:text-[#800020] hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(a)}
                          title="Delete announcement"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* DELETE CONFIRMATION MODAL WITH CONTAINER BLUR */}
      {deleteItem && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-stone-900 text-center">
              Delete Announcement?
            </h3>
            <p className="text-sm text-stone-600 text-center mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-stone-900 font-semibold">"{deleteItem.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                  {editingItem ? 'Edit Announcement' : 'New Announcement'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {editingItem
                    ? 'Update announcement content, schedule, and visibility.'
                    : 'Compose and publish a parish advisory or notice.'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    });
                  }}
                  placeholder="e.g. Solemnity Mass Schedule, Youth Assembly Notice..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.slug}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100/80 text-sm font-mono text-stone-500 cursor-not-allowed select-all focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-stone-400">
                    Auto-generated unique identifier (read-only).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]"
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
                  placeholder="Upload photo or enter image URL..."
                  helpText="Upload a banner poster or photo."
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
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]"
                >
                  <option value="PUBLISHED">
                    Published (Live immediately on website)
                  </option>
                  <option value="DRAFT">
                    Draft (Saved privately, not visible to the public)
                  </option>
                  <option value="ARCHIVED">
                    Archived (Hidden from active listings)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
                >
                  {editingItem ? 'Save Changes' : formData.status === 'DRAFT' ? 'Save Draft' : 'Publish Announcement'}
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
