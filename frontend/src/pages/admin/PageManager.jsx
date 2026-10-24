import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import SectionMaintenanceBar from '../../components/admin/SectionMaintenanceBar';
import { 
  FileText, Plus, Edit, Trash2, CheckCircle, XCircle, 
  ExternalLink, X, Compass, LayoutTemplate, Check, ArrowRight,
  Menu as MenuIcon
} from 'lucide-react';

export default function PageManager() {
  const [pages, setPages] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [quickNavModalOpen, setQuickNavModalOpen] = useState(false);
  const [selectedPageForNav, setSelectedPageForNav] = useState(null);
  const [editPage, setEditPage] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    template: 'DEFAULT',
    seoTitle: '',
    seoDescription: '',
    status: 'PUBLISHED'
  });

  // Navigation Integration Form State
  const [addToNav, setAddToNav] = useState(true);
  const [navLabel, setNavLabel] = useState('');
  const [navParentId, setNavParentId] = useState('');

  const fetchData = async () => {
    try {
      const [pagesRes, navRes] = await Promise.all([
        adminApi.getPages(),
        adminApi.getNavigation()
      ]);
      if (pagesRes.data) setPages(pagesRes.data);
      if (navRes.data) setNavItems(navRes.data);
    } catch (err) {
      console.error('Failed to load page management data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    setAddToNav(true);
    setNavLabel('');
    setNavParentId('');
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

    // Check if this page already has a linked navigation item
    const linked = navItems.find(
      (i) => i.pageId === page.id || i.targetPath === `/pages/${page.slug}` || i.targetPath === `/${page.slug}`
    );

    if (linked) {
      setAddToNav(true);
      setNavLabel(linked.label);
      setNavParentId(linked.parentId ? String(linked.parentId) : '');
    } else {
      setAddToNav(false);
      setNavLabel(page.title);
      setNavParentId('');
    }

    setError('');
    setModalOpen(true);
  };

  const openQuickAddNavModal = (page) => {
    setSelectedPageForNav(page);
    setNavLabel(page.title);
    setNavParentId('');
    setQuickNavModalOpen(true);
  };

  const handleQuickAddNavSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPageForNav) return;

    try {
      const payload = {
        label: navLabel.trim() || selectedPageForNav.title,
        destinationType: 'INTERNAL',
        targetPath: `/pages/${selectedPageForNav.slug}`,
        pageId: selectedPageForNav.id,
        parentId: navParentId ? parseInt(navParentId, 10) : null,
        isVisible: selectedPageForNav.status === 'PUBLISHED',
        openInNewTab: false
      };

      await adminApi.createNavigationItem(payload);
      setQuickNavModalOpen(false);
      fetchData();
      showNotice(`"${payload.label}" integrated into navigation menu successfully!`);
    } catch (err) {
      alert(err.message || 'Failed to add page to navigation');
    }
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editPage) {
        // 1. Update the Page
        await adminApi.updatePage(editPage.id, formData);

        // 2. Sync Navigation Menu
        const existingNav = navItems.find(
          (i) => i.pageId === editPage.id || i.targetPath === `/pages/${editPage.slug}` || i.targetPath === `/${editPage.slug}`
        );

        if (existingNav) {
          if (addToNav) {
            // Update the existing navigation item with new slug/label/parent
            await adminApi.updateNavigationItem(existingNav.id, {
              ...existingNav,
              label: navLabel.trim() || formData.title.trim(),
              targetPath: `/pages/${formData.slug}`,
              pageId: editPage.id,
              parentId: navParentId ? parseInt(navParentId, 10) : null,
              isVisible: formData.status === 'PUBLISHED'
            });
          } else {
            // Admin explicitly opted to remove it from navigation
            await adminApi.deleteNavigationItem(existingNav.id);
          }
        } else if (addToNav) {
          // Newly adding to navigation during edit
          await adminApi.createNavigationItem({
            label: navLabel.trim() || formData.title.trim(),
            destinationType: 'INTERNAL',
            targetPath: `/pages/${formData.slug}`,
            pageId: editPage.id,
            parentId: navParentId ? parseInt(navParentId, 10) : null,
            isVisible: formData.status === 'PUBLISHED',
            openInNewTab: false
          });
        }

        showNotice(`Page "${formData.title}" updated successfully.`);
      } else {
        // 1. Create the Page
        const res = await adminApi.createPage(formData);
        const createdPage = res?.data || res;

        // 2. If requested, automatically integrate into navigation menu
        if (addToNav && createdPage?.id) {
          await adminApi.createNavigationItem({
            label: navLabel.trim() || formData.title.trim(),
            destinationType: 'INTERNAL',
            targetPath: `/pages/${createdPage.slug}`,
            pageId: createdPage.id,
            parentId: navParentId ? parseInt(navParentId, 10) : null,
            isVisible: formData.status === 'PUBLISHED',
            openInNewTab: false
          });
        }

        // 3. Seed an initial welcome/content section so the page is ready to view
        if (createdPage?.id) {
          try {
            await adminApi.addSection(createdPage.id, {
              sectionType: 'WELCOME',
              title: formData.title,
              contentJson: JSON.stringify({
                badge: 'Parish of the Alliance of the Two Hearts',
                heading: formData.title,
                description: formData.seoDescription || `Welcome to ${formData.title}. This page is maintained by the Parish of the Alliance of the Two Hearts.`,
                imageUrl: '',
                ctaText: 'Return to Homepage',
                ctaUrl: '/'
              }),
              displayOrder: 0,
              isVisible: true
            });
          } catch (secErr) {
            console.warn('Initial section creation note:', secErr);
          }
        }

        showNotice(
          addToNav
            ? `Page "${formData.title}" created and integrated into the Navigation Menu!`
            : `Page "${formData.title}" created successfully.`
        );
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleTogglePublish = async (page) => {
    try {
      if (page.status === 'PUBLISHED') {
        await adminApi.unpublishPage(page.id);
        showNotice(`"${page.title}" reverted to draft.`);
      } else {
        await adminApi.publishPage(page.id);
        showNotice(`"${page.title}" published.`);
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (page) => {
    if (page.slug === 'home') {
      alert('The root home page cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete page "${page.title}" and its associated sections and menu link?`)) return;
    try {
      await adminApi.deletePage(page.id);
      fetchData();
      showNotice(`Page "${page.title}" deleted.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const rootNavItems = navItems.filter((i) => !i.parentId);

  return (
    <div className="space-y-6">
      {/* Section Maintenance Control Switch */}
      <SectionMaintenanceBar sectionKey="pages" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900 flex items-center gap-2.5">
            <span>Page Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create custom parish pages, configure content sections, and integrate them directly into the website navigation menu.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/navigation"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-[#800020] text-stone-700 hover:text-[#800020] text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Compass className="w-4 h-4 text-[#C59B3F]" />
            <span>Navigation Manager</span>
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Pages Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Page Title</th>
                <th className="px-6 py-4">URL Slug</th>
                <th className="px-6 py-4">Navigation Menu</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pages.map((p) => {
                const linkedNav = navItems.find(
                  (i) => i.pageId === p.id || i.targetPath === `/pages/${p.slug}` || i.targetPath === `/${p.slug}`
                );
                const parentNav = linkedNav?.parentId ? navItems.find((i) => i.id === linkedNav.parentId) : null;
                const publicUrl = p.slug === 'home' ? '/' : `/pages/${p.slug}`;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900 flex items-center gap-2">
                        <span>{p.title}</span>
                        {p.slug === 'home' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                            Home
                          </span>
                        )}
                      </div>
                      {p.seoDescription && (
                        <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-sm">
                          {p.seoDescription}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-500">
                      {publicUrl}
                    </td>
                    <td className="px-6 py-4">
                      {linkedNav ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                          <Compass className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {linkedNav.label}
                            <span className="text-emerald-600/80 font-normal ml-1">
                              {parentNav ? `(in ${parentNav.label})` : '(Header)'}
                            </span>
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openQuickAddNavModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 hover:bg-[#800020] text-stone-600 hover:text-white border border-stone-200 hover:border-[#800020] transition-colors cursor-pointer group shadow-2xs"
                          title="Add this page to the navigation menu"
                        >
                          <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-white" />
                          <span>Integrate to Nav</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                      {/* Design / Edit Sections Button */}
                      <Link
                        to={`/admin/homepage-builder?page=${p.slug}`}
                        title="Design & configure content sections for this page"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-semibold transition-colors shadow-2xs"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5 text-[#C59B3F]" />
                        <span className="hidden sm:inline">Design Sections</span>
                      </Link>

                      {/* View Live Page */}
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open page in public site"
                        className="p-1.5 inline-flex items-center text-stone-500 hover:text-[#800020] rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Publish / Unpublish Toggle */}
                      <button
                        onClick={() => handleTogglePublish(p)}
                        title={p.status === 'PUBLISHED' ? 'Revert to draft' : 'Publish page'}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 font-semibold transition-colors cursor-pointer"
                      >
                        {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>

                      {/* Edit Page Metadata */}
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Page Title, Slug, & SEO"
                        className="p-1.5 text-stone-600 hover:text-[#800020] rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Page */}
                      {p.slug !== 'home' && (
                        <button
                          onClick={() => handleDelete(p)}
                          title="Delete Page"
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PAGE MODAL */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                <div>
                  <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                    {editPage ? 'Edit Page Settings' : 'Create New Page'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Configure page details, URL slug, and navigation menu integration.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
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
                      const newTitle = e.target.value;
                      setFormData({
                        ...formData,
                        title: newTitle,
                        slug:
                          !editPage && (!formData.slug || formData.slug === formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                            ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                            : formData.slug
                      });
                      if (!editPage && (!navLabel || navLabel === formData.title)) {
                        setNavLabel(newTitle);
                      }
                    }}
                    placeholder="e.g. Parish Youth Ministry"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#800020] bg-stone-50">
                    <span className="px-3 text-xs text-stone-500 font-mono bg-stone-100 border-r border-stone-200 py-2">
                      /pages/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                      placeholder="parish-youth-ministry"
                      className="flex-1 px-3 py-2 text-sm font-mono bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* NAVIGATION MENU INTEGRATION BOX */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-[#C59B3F]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addToNav}
                        onChange={(e) => setAddToNav(e.target.checked)}
                        className="rounded text-[#800020] focus:ring-[#800020] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#C59B3F]" />
                        <span>Integrate into Navigation Menu</span>
                      </span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Auto-Link
                    </span>
                  </div>

                  {addToNav && (
                    <div className="space-y-3 pt-2.5 border-t border-[#C59B3F]/20 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Navigation Menu Label
                        </label>
                        <input
                          type="text"
                          value={navLabel}
                          onChange={(e) => setNavLabel(e.target.value)}
                          placeholder={formData.title || 'e.g. Youth Ministry'}
                          className="w-full px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Menu Placement (Parent Header Item)
                        </label>
                        <select
                          value={navParentId}
                          onChange={(e) => setNavParentId(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                        >
                          <option value="">Top-Level Menu Bar (Direct Header Link)</option>
                          {rootNavItems.map((r) => (
                            <option key={r.id} value={r.id}>
                              Inside Dropdown: {r.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-amber-800/80 mt-1">
                          The page will be instantly accessible through your chosen navigation position on both desktop & mobile.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Page Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    <option value="PUBLISHED">Published (Visible to public)</option>
                    <option value="DRAFT">Draft (Under construction)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    SEO Meta Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Brief description for search engines and social previews..."
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer transition-all"
                  >
                    Save Page
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* QUICK ADD TO NAVIGATION MODAL */}
      {quickNavModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-[#800020] flex items-center justify-center">
                    <Compass className="w-4 h-4 text-[#C59B3F]" />
                  </div>
                  <h3 className="font-serif-heading text-lg font-bold text-stone-900">
                    Add to Navigation Menu
                  </h3>
                </div>
                <button
                  onClick={() => setQuickNavModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-500 mb-4">
                Integrate <strong className="text-stone-800">"{selectedPageForNav?.title}"</strong> into your site's header navigation menu.
              </p>

              <form onSubmit={handleQuickAddNavSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Menu Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={navLabel}
                    onChange={(e) => setNavLabel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Placement
                  </label>
                  <select
                    value={navParentId}
                    onChange={(e) => setNavParentId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    <option value="">Top-Level Menu Bar (Header)</option>
                    {rootNavItems.map((r) => (
                      <option key={r.id} value={r.id}>
                        Inside Dropdown: {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-600">
                  Target Destination: /pages/{selectedPageForNav?.slug}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setQuickNavModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer transition-all"
                  >
                    Add to Navigation
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
