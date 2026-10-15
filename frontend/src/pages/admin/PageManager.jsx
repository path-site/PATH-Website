import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import SectionMaintenanceBar from '../../components/admin/SectionMaintenanceBar';
import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, ExternalLink, X } from 'lucide-react';

export default function PageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPage, setEditPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    template: 'DEFAULT',
    seoTitle: '',
    seoDescription: '',
    status: 'PUBLISHED'
  });
  const [error, setError] = useState('');

  const fetchPages = async () => {
    try {
      const res = await adminApi.getPages();
      if (res.data) setPages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateModal = () => {
    setEditPage(null);
    setFormData({
      title: '',
      slug: '',
      template: 'DEFAULT',
      seoTitle: '',
      seoDescription: '',
      status: 'PUBLISHED'
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (page) => {
    setEditPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      template: page.template || 'DEFAULT',
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      status: page.status || 'PUBLISHED'
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editPage) {
        await adminApi.updatePage(editPage.id, formData);
      } else {
        await adminApi.createPage(formData);
      }
      setModalOpen(false);
      fetchPages();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleTogglePublish = async (page) => {
    try {
      if (page.status === 'PUBLISHED') {
        await adminApi.unpublishPage(page.id);
      } else {
        await adminApi.publishPage(page.id);
      }
      fetchPages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (page) => {
    if (page.slug === 'home') {
      alert('The root home page cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete page "${page.title}" and its associated sections?`)) return;
    try {
      await adminApi.deletePage(page.id);
      fetchPages();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Section Maintenance Control Switch */}
      <SectionMaintenanceBar sectionKey="pages" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Page Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create and maintain website pages, URL slugs, and search engine metadata.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">URL Slug</th>
                <th className="px-6 py-4">Template</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900">
                    {p.title}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-stone-500">
                    /{p.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 font-semibold">
                      {p.template}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      p.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      title={p.status === 'PUBLISHED' ? 'Revert to draft' : 'Publish page'}
                      className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 font-semibold transition-colors"
                    >
                      {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-stone-600 hover:text-[#800020] rounded-lg hover:bg-stone-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {p.slug !== 'home' && (
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                {editPage ? 'Edit Page' : 'Create New Page'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold mb-4 border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Page Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: !editPage ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : formData.slug
                    });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. parish-outreach"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Page Template
                </label>
                <select
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                >
                  <option value="DEFAULT">Default Modular Template</option>
                  <option value="HOME">Homepage Template</option>
                  <option value="ABOUT">About Informational Template</option>
                  <option value="BLANK">Blank Page Template</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows="2"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
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
                  Save Page
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
