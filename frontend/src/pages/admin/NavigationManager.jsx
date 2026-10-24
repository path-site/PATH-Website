import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import SectionMaintenanceBar from '../../components/admin/SectionMaintenanceBar';
import { 
  Menu, Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, 
  X, Check, FileText, ExternalLink, Compass, Link2, Sparkles 
} from 'lucide-react';

export default function NavigationManager() {
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [quickPageModalOpen, setQuickPageModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [notice, setNotice] = useState('');

  // Main Form Data
  const [formData, setFormData] = useState({
    label: '',
    destinationType: 'INTERNAL',
    targetPath: '/',
    pageId: null,
    externalUrl: '',
    parentId: null,
    isVisible: true,
    openInNewTab: false,
  });

  // Quick Page Link Form Data
  const [quickPageId, setQuickPageId] = useState('');
  const [quickLabel, setQuickLabel] = useState('');
  const [quickParentId, setQuickParentId] = useState('');

  const fetchNav = async () => {
    try {
      const [navRes, pagesRes] = await Promise.all([
        adminApi.getNavigation(),
        adminApi.getPages()
      ]);
      if (navRes.data) setItems(navRes.data);
      if (pagesRes.data) setPages(pagesRes.data);
    } catch (err) {
      console.error('Failed to load navigation or pages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNav();
  }, []);

  const openCreateModal = () => {
    setEditItem(null);
    setFormData({
      label: '',
      destinationType: 'INTERNAL',
      targetPath: '/',
      pageId: null,
      externalUrl: '',
      parentId: null,
      isVisible: true,
      openInNewTab: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      label: item.label,
      destinationType: item.destinationType,
      targetPath: item.targetPath || '/',
      pageId: item.pageId || null,
      externalUrl: item.externalUrl || '',
      parentId: item.parentId || null,
      isVisible: item.isVisible !== false,
      openInNewTab: item.openInNewTab || false,
    });
    setModalOpen(true);
  };

  const openQuickAddPageModal = () => {
    const unlinked = pages.filter(
      (p) => !items.some((i) => i.pageId === p.id || i.targetPath === `/pages/${p.slug}`)
    );
    const initialPage = unlinked.length > 0 ? unlinked[0] : (pages[0] || null);
    if (initialPage) {
      setQuickPageId(String(initialPage.id));
      setQuickLabel(initialPage.title);
    } else {
      setQuickPageId('');
      setQuickLabel('');
    }
    setQuickParentId('');
    setQuickPageModalOpen(true);
  };

  const handleQuickAddPageSubmit = async (e) => {
    e.preventDefault();
    const selectedPage = pages.find((p) => String(p.id) === String(quickPageId));
    if (!selectedPage) return;

    try {
      const payload = {
        label: quickLabel.trim() || selectedPage.title,
        destinationType: 'INTERNAL',
        targetPath: selectedPage.slug === 'home' ? '/' : `/pages/${selectedPage.slug}`,
        pageId: selectedPage.id,
        parentId: quickParentId ? parseInt(quickParentId, 10) : null,
        isVisible: selectedPage.status === 'PUBLISHED',
        openInNewTab: false
      };

      await adminApi.createNavigationItem(payload);
      setQuickPageModalOpen(false);
      fetchNav();
      showNotice(`Page "${payload.label}" successfully added to navigation!`);
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
    try {
      let cleanTargetPath = (formData.targetPath || '/').trim();
      if (!cleanTargetPath.startsWith('/') && !cleanTargetPath.startsWith('#')) {
        cleanTargetPath = `/${cleanTargetPath}`;
      }

      const payload = {
        ...formData,
        targetPath: formData.destinationType === 'INTERNAL' ? cleanTargetPath : formData.targetPath,
        parentId: formData.parentId ? parseInt(formData.parentId, 10) : null,
        pageId: formData.pageId ? parseInt(formData.pageId, 10) : null
      };

      if (editItem) {
        await adminApi.updateNavigationItem(editItem.id, payload);
      } else {
        await adminApi.createNavigationItem(payload);
      }
      setModalOpen(false);
      fetchNav();
      showNotice('Menu item saved successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      const updated = { ...item, isVisible: !item.isVisible };
      await adminApi.updateNavigationItem(item.id, updated);
      fetchNav();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    const reordered = copy.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));

    setItems(reordered);
    try {
      await adminApi.reorderNavigation(reordered.map((i) => ({ id: i.id, displayOrder: i.displayOrder })));
    } catch (err) {
      fetchNav();
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete menu item "${item.label}"?`)) return;
    try {
      await adminApi.deleteNavigationItem(item.id);
      fetchNav();
      showNotice(`Menu item "${item.label}" removed.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const rootItems = items.filter((i) => !i.parentId);

  return (
    <div className="space-y-6">
      {/* Section Maintenance Control Switch */}
      <SectionMaintenanceBar sectionKey="navigation" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900 flex items-center gap-2">
            <span>Navigation Menu Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure header navigation items, link pages created in Page Management, order menus, and configure dropdowns.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/pages"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-[#800020] text-stone-700 hover:text-[#800020] text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-[#C59B3F]" />
            <span>Page Management</span>
          </Link>
          <button
            onClick={openQuickAddPageModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider shadow-2xs transition-all cursor-pointer"
          >
            <Link2 className="w-4 h-4 text-[#C59B3F]" />
            <span>Add Page to Menu</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Menu Item</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Menu Tree List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6">
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isChild = !!item.parentId;
            const parentName = isChild ? items.find((i) => i.id === item.parentId)?.label : null;
            const linkedPage = pages.find(
              (p) => p.id === item.pageId || (item.targetPath && item.targetPath === `/pages/${p.slug}`)
            );

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isChild ? 'ml-8 bg-stone-50/80 border-stone-200' : 'bg-white border-stone-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-900 text-sm sm:text-base">
                        {item.label}
                      </span>
                      {isChild && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          Submenu of: {parentName}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                        {item.destinationType}
                      </span>
                      {linkedPage && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-emerald-600" />
                          <span>Page: {linkedPage.title}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 font-mono truncate max-w-xs sm:max-w-md">
                        {item.destinationType === 'EXTERNAL' ? item.externalUrl : item.targetPath}
                      </span>
                      {item.destinationType !== 'DROPDOWN_PARENT' && (
                        <a
                          href={item.destinationType === 'EXTERNAL' ? item.externalUrl : item.targetPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-[#800020] transition-colors"
                          title="Preview Link in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(item)}
                    title={item.isVisible ? 'Visible (Click to hide)' : 'Hidden (Click to show)'}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      item.isVisible ? 'text-emerald-700 hover:bg-emerald-50' : 'text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK ADD PAGE TO MENU MODAL */}
      {quickPageModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-[#800020] flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-[#C59B3F]" />
                  </div>
                  <h3 className="font-serif-heading text-lg font-bold text-stone-900">
                    Add Page to Navigation
                  </h3>
                </div>
                <button
                  onClick={() => setQuickPageModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-500 mb-4">
                Select any page created in Page Management to add it to your website navigation bar.
              </p>

              <form onSubmit={handleQuickAddPageSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Select Page from Page Management <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={quickPageId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setQuickPageId(id);
                      const matched = pages.find((p) => String(p.id) === String(id));
                      if (matched) setQuickLabel(matched.title);
                    }}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    <option value="">-- Choose a Page --</option>
                    {pages.map((p) => {
                      const isAlreadyInNav = items.some(
                        (i) => i.pageId === p.id || i.targetPath === `/pages/${p.slug}`
                      );
                      return (
                        <option key={p.id} value={p.id}>
                          📄 {p.title} (/{p.slug}) {isAlreadyInNav ? '✓ In Menu' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Navigation Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quickLabel}
                    onChange={(e) => setQuickLabel(e.target.value)}
                    placeholder="e.g. Parish Youth"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Menu Placement
                  </label>
                  <select
                    value={quickParentId}
                    onChange={(e) => setQuickParentId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    <option value="">Top-Level Menu Bar (Header)</option>
                    {rootItems.map((r) => (
                      <option key={r.id} value={r.id}>
                        Inside Dropdown: {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setQuickPageModalOpen(false)}
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

      {/* CREATE / EDIT NAVIGATION ITEM MODAL */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                  {editItem ? 'Edit Navigation Item' : 'New Navigation Item'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Menu Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. Priests / Mass Times"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Destination Type
                  </label>
                  <select
                    value={formData.destinationType}
                    onChange={(e) => setFormData({ ...formData, destinationType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    <option value="INTERNAL">Internal Page Link</option>
                    <option value="DROPDOWN_PARENT">Dropdown Parent (Folder / Trigger)</option>
                    <option value="EXTERNAL">External Web Address (URL)</option>
                  </select>
                </div>

                {formData.destinationType === 'INTERNAL' && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/60 border border-[#C59B3F]/30">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                        Link to Page (from Page Management)
                      </label>
                      <select
                        value={formData.pageId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selected = pages.find((p) => String(p.id) === String(val));
                          if (selected) {
                            setFormData((prev) => ({
                              ...prev,
                              pageId: selected.id,
                              targetPath: selected.slug === 'home' ? '/' : `/pages/${selected.slug}`,
                              label: prev.label ? prev.label : selected.title
                            }));
                          } else {
                            setFormData((prev) => ({ ...prev, pageId: null }));
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                      >
                        <option value="">-- Choose from Created Pages --</option>
                        {pages.map((p) => (
                          <option key={p.id} value={p.id}>
                            📄 {p.title} (/{p.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Target Path (Internal URL)
                      </label>
                      <input
                        type="text"
                        value={formData.targetPath}
                        onChange={(e) =>
                          setFormData({ ...formData, targetPath: e.target.value, pageId: null })
                        }
                        placeholder="e.g. /about/priests or /pages/my-page"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#800020]"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        Select a page from the dropdown above to auto-link, or type any custom internal path.
                      </p>
                    </div>
                  </div>
                )}

                {formData.destinationType === 'EXTERNAL' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      External URL
                    </label>
                    <input
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                      placeholder="https://dioceseofcebu.ph"
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Parent Menu (Nest inside dropdown)
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    <option value="">None (Top-Level Menu Bar)</option>
                    {rootItems
                      .filter((i) => (editItem ? i.id !== editItem.id : true))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="openTab"
                    checked={formData.openInNewTab}
                    onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                    className="rounded text-[#800020] focus:ring-[#800020] cursor-pointer"
                  />
                  <label
                    htmlFor="openTab"
                    className="text-xs text-stone-700 font-medium cursor-pointer select-none"
                  >
                    Open link in new browser tab
                  </label>
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
                    Save Item
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
