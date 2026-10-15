import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import SectionMaintenanceBar from '../../components/admin/SectionMaintenanceBar';
import { 
  Upload, Search, Trash2, Copy, Check, Eye, X, 
  Image as ImageIcon, Loader2, AlertTriangle, AlertCircle 
} from 'lucide-react';

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [notice, setNotice] = useState('');

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchMedia = async (query = '') => {
    try {
      const res = await adminApi.getMedia(query);
      if (res.data) setMedia(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedia(search);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name);

    setUploading(true);
    try {
      await adminApi.uploadMedia(formData);
      setNotice('Photo saved directly to database successfully!');
      setTimeout(() => setNotice(''), 3500);
      fetchMedia(search);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyUrl = (url, id) => {
    const resolved = resolveMediaUrl(url);
    const fullUrl = resolved.startsWith('http') ? resolved : window.location.origin + resolved;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await adminApi.deleteMedia(itemToDelete.id);
      // Immediately remove from state
      setMedia((prev) => prev.filter((m) => m.id !== itemToDelete.id));
      // Close preview if it's the deleted item
      if (previewItem?.id === itemToDelete.id) {
        setPreviewItem(null);
      }
      setNotice(`"${itemToDelete.fileName}" was deleted successfully.`);
      setTimeout(() => setNotice(''), 3500);
      setItemToDelete(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete photo from the database.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Section Maintenance Control Switch */}
      <SectionMaintenanceBar sectionKey="media" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Upload and reuse photographs, posters, and church assets across all pages.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 border border-emerald-200 animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search files by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        </form>
        <span className="text-xs text-stone-500 font-medium">
          Total Files: {media.length}
        </span>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="aspect-square bg-white rounded-2xl animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 text-stone-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No media files found.</p>
          <p className="text-xs">Click "Upload Image" to add parish photographs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                <img
                  src={resolveMediaUrl(item.fileUrl)}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(item);
                    }}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white text-stone-800 hover:text-stone-900 backdrop-blur-xs transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4 text-white hover:text-stone-900" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(item.fileUrl, item.id);
                    }}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white text-stone-800 hover:text-stone-900 backdrop-blur-xs transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white hover:text-stone-900" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteError('');
                      setItemToDelete(item);
                    }}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white">
                <p className="text-xs font-bold text-stone-800 truncate" title={item.fileName}>
                  {item.fileName}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                  <span>{item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : ''}</span>
                  <span className="uppercase font-semibold">{item.storageProvider}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && createPortal(
        <div
          className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-sm font-bold text-stone-900 truncate pr-4">
                {previewItem.fileName}
              </h3>
              <button 
                type="button"
                onClick={() => setPreviewItem(null)} 
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-4/3 bg-stone-100 mb-4">
              <img
                src={resolveMediaUrl(previewItem.fileUrl)}
                alt={previewItem.fileName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-3 text-xs text-stone-600">
              <p>
                <span className="font-bold text-stone-800">Direct URL:</span>{' '}
                <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded break-all">{previewItem.fileUrl}</code>
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError('');
                    setItemToDelete(previewItem);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyUrl(previewItem.fileUrl, previewItem.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && createPortal(
        <div
          className="fixed inset-0 z-[110] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setItemToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif-heading text-lg font-bold text-stone-900">
                  Delete Photo?
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  This photo will be permanently removed from the database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setItemToDelete(null)}
                disabled={isDeleting}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Item Details */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                <img
                  src={resolveMediaUrl(itemToDelete.fileUrl)}
                  alt={itemToDelete.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-stone-800 truncate" title={itemToDelete.fileName}>
                  {itemToDelete.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                  <span>{itemToDelete.fileSize ? `${Math.round(itemToDelete.fileSize / 1024)} KB` : ''}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-stone-600">{itemToDelete.storageProvider}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 mb-6 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold mb-0.5">⚠️ Caution</p>
              <p>Any announcements, events, or pages currently using this photo URL will no longer be able to display it.</p>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
