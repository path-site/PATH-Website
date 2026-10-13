import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import { Menu, Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, X, Check } from 'lucide-react';

export default function NavigationManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    destinationType: 'INTERNAL',
    targetPath: '/',
    externalUrl: '',
    parentId: null,
    isVisible: true,
    openInNewTab: false,
  });

  const fetchNav = async () => {
    try {
      const res = await adminApi.getNavigation();
      if (res.data) setItems(res.data);
    } catch (err) {
      console.error(err);
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
      externalUrl: item.externalUrl || '',
      parentId: item.parentId || null,
      isVisible: item.isVisible !== false,
      openInNewTab: item.openInNewTab || false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      };

      if (editItem) {
        await adminApi.updateNavigationItem(editItem.id, payload);
      } else {
        await adminApi.createNavigationItem(payload);
      }
      setModalOpen(false);
      fetchNav();
      setNotice('Menu item saved successfully.');
      setTimeout(() => setNotice(''), 3000);
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
      await adminApi.reorderNavigation(reordered.map(i => ({ id: i.id, displayOrder: i.displayOrder })));
    } catch (err) {
      fetchNav();
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete menu item "${item.label}"?`)) return;
    try {
      await adminApi.deleteNavigationItem(item.id);
      fetchNav();
    } catch (err) {
      alert(err.message);
    }
  };

  const rootItems = items.filter(i => !i.parentId);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Navigation Menu Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure header navigation items, About dropdown submenu links, ordering, and destinations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Menu Item</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Menu Tree List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6">
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isChild = !!item.parentId;
            const parentName = isChild ? items.find(i => i.id === item.parentId)?.label : null;

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
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm sm:text-base">
                        {item.label}
                      </span>
                      {isChild && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                          Submenu of: {parentName}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                        {item.destinationType}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      Destination: {item.destinationType === 'EXTERNAL' ? item.externalUrl : item.targetPath}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(item)}
                    title={item.isVisible ? "Visible (Click to hide)" : "Hidden (Click to show)"}
                    className={`p-1.5 rounded-lg ${item.isVisible ? 'text-emerald-700 hover:bg-emerald-50' : 'text-stone-300 hover:bg-stone-100'}`}
                  >
                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                {editItem ? 'Edit Navigation Item' : 'New Navigation Item'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
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
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                >
                  <option value="INTERNAL">Internal Page Link</option>
                  <option value="DROPDOWN_PARENT">Dropdown Parent (Trigger)</option>
                  <option value="EXTERNAL">External Web Address (URL)</option>
                </select>
              </div>

              {formData.destinationType === 'INTERNAL' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Target Path (Internal)
                  </label>
                  <input
                    type="text"
                    value={formData.targetPath}
                    onChange={(e) => setFormData({ ...formData, targetPath: e.target.value })}
                    placeholder="e.g. /about/priests"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  />
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
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
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
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                >
                  <option value="">None (Top-Level Menu Bar)</option>
                  {rootItems.filter(i => editItem ? i.id !== editItem.id : true).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="openTab"
                  checked={formData.openInNewTab}
                  onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                  className="rounded text-[#800020] focus:ring-[#800020]"
                />
                <label htmlFor="openTab" className="text-xs text-stone-700 font-medium cursor-pointer">
                  Open link in new browser tab
                </label>
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
