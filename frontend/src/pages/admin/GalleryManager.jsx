import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import ImageUploadInput from '../../components/admin/ImageUploadInput';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Image as ImageIcon, Plus, Edit, Trash2, Check, X, Folder, Eye, Upload, Loader2 } from 'lucide-react';

export default function GalleryManager() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumImages, setAlbumImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkUploading, setBulkUploading] = useState(false);

  // Modals
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editAlbumItem, setEditAlbumItem] = useState(null);
  const [albumFormData, setAlbumFormData] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    status: 'PUBLISHED',
  });

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageFormData, setImageFormData] = useState({
    imageUrl: '',
    caption: '',
  });

  const fetchAlbums = async () => {
    try {
      const res = await adminApi.getAlbums();
      if (res.data) {
        setAlbums(res.data);
        if (res.data.length > 0 && !selectedAlbum) {
          selectAlbum(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectAlbum = async (album) => {
    setSelectedAlbum(album);
    try {
      const res = await adminApi.getAlbumImages(album.id);
      if (res.data) setAlbumImages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const openCreateAlbum = () => {
    setEditAlbumItem(null);
    setAlbumFormData({
      title: '',
      description: '',
      coverImageUrl: '',
      status: 'PUBLISHED',
    });
    setAlbumModalOpen(true);
  };

  const openEditAlbum = (album) => {
    setEditAlbumItem(album);
    setAlbumFormData({
      title: album.title,
      description: album.description || '',
      coverImageUrl: album.coverImageUrl || '',
      status: album.status || 'PUBLISHED',
    });
    setAlbumModalOpen(true);
  };

  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    try {
      if (editAlbumItem) {
        await adminApi.updateAlbum(editAlbumItem.id, albumFormData);
      } else {
        await adminApi.createAlbum(albumFormData);
      }
      setAlbumModalOpen(false);
      fetchAlbums();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAlbum = async (album) => {
    if (!window.confirm(`Delete album "${album.title}" and all its photos?`)) return;
    try {
      await adminApi.deleteAlbum(album.id);
      setSelectedAlbum(null);
      fetchAlbums();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!selectedAlbum) return;
    try {
      await adminApi.addAlbumImage(selectedAlbum.id, imageFormData);
      setImageModalOpen(false);
      setImageFormData({ imageUrl: '', caption: '' });
      selectAlbum(selectedAlbum);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteImage = async (imgId) => {
    if (!window.confirm('Remove this photo from the album?')) return;
    try {
      await adminApi.deleteAlbumImage(imgId);
      selectAlbum(selectedAlbum);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkUploadPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selectedAlbum) return;

    setBulkUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', file.name);
        const res = await adminApi.uploadMedia(formData);
        const mediaData = res?.data || res;
        const url = mediaData?.fileUrl || (typeof mediaData === 'string' ? mediaData : '');
        if (url) {
          const caption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          await adminApi.addAlbumImage(selectedAlbum.id, { imageUrl: url, caption });
        }
      }
      selectAlbum(selectedAlbum);
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900">
            Photo Gallery & Albums Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Organize parish photographs into albums, manage cover images, captions, and displays.
          </p>
        </div>
        <button
          onClick={openCreateAlbum}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Album</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Albums List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
          <h2 className="font-serif-heading text-lg font-bold text-stone-900 mb-2">
            Parish Albums
          </h2>
          {albums.map((album) => {
            const isSelected = selectedAlbum?.id === album.id;
            return (
              <div
                key={album.id}
                onClick={() => selectAlbum(album)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#800020] bg-[#800020]/5 ring-1 ring-[#800020]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-stone-900 truncate">
                      {album.title}
                    </h3>
                    <span className="text-[10px] text-stone-400 block truncate">
                      {album.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditAlbum(album)}
                    className="p-1.5 text-stone-500 hover:text-[#800020] rounded-lg"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Album Photos (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          {selectedAlbum ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 mb-6">
                <div>
                  <h2 className="font-serif-heading text-xl font-bold text-stone-900">
                    {selectedAlbum.title}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {selectedAlbum.description || 'Album photographs and captions'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer transition-all">
                    {bulkUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{bulkUploading ? 'Uploading...' : 'Upload Photos'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={bulkUploading}
                      onChange={handleBulkUploadPhotos}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setImageModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add by URL</span>
                  </button>
                </div>
              </div>

              {albumImages.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No photos in this album yet.</p>
                  <p className="text-xs">Click "Upload Photos" to add church pictures from your device.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {albumImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs"
                    >
                      <img
                        src={resolveMediaUrl(img.imageUrl)}
                        alt={img.caption || 'Album image'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-medium line-clamp-2">
                          {img.caption || 'No caption'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400">
              Select an album to manage its photos.
            </div>
          )}
        </div>

      </div>

      {/* CREATE / EDIT ALBUM MODAL */}
      {albumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                {editAlbumItem ? 'Edit Album' : 'New Photo Album'}
              </h3>
              <button onClick={() => setAlbumModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Album Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={albumFormData.title}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
                  placeholder="e.g. Fiesta Procession 2026"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <ImageUploadInput
                  label="Album Cover Photo"
                  value={albumFormData.coverImageUrl}
                  onChange={(url) => setAlbumFormData({ ...albumFormData, coverImageUrl: url })}
                  placeholder="Upload cover photo or enter URL..."
                  helpText="Cover image saved directly to the database."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={albumFormData.description}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setAlbumModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                Add Photo to Album
              </h3>
              <button onClick={() => setImageModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <ImageUploadInput
                  label="Photo"
                  required
                  value={imageFormData.imageUrl}
                  onChange={(url) => setImageFormData({ ...imageFormData, imageUrl: url })}
                  placeholder="Upload photo or enter URL..."
                  helpText="Photo saved directly to the database."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Caption / Description
                </label>
                <input
                  type="text"
                  value={imageFormData.caption}
                  onChange={(e) => setImageFormData({ ...imageFormData, caption: e.target.value })}
                  placeholder="e.g. Solemn blessing of the floral carriages"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Insert Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
