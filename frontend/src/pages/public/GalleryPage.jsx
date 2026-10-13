import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Layers, Maximize2 } from 'lucide-react';

export default function GalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activePhotos, setActivePhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await publicApi.getGallery();
        if (res.data) {
          setAlbums(res.data);
        }
      } catch (err) {
        console.error('Failed to load gallery', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Compute displayed photos based on selectedAlbumId
  useEffect(() => {
    const photos = [];
    albums.forEach(albumObj => {
      if (selectedAlbumId === 'all' || albumObj.album?.id.toString() === selectedAlbumId.toString()) {
        if (albumObj.images) {
          albumObj.images.forEach(img => {
            photos.push({
              ...img,
              albumTitle: albumObj.album?.title
            });
          });
        }
      }
    });
    setActivePhotos(photos);
  }, [albums, selectedAlbumId]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? activePhotos.length - 1 : prev - 1));
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % activePhotos.length);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200">
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Visual Memories & Sacred Art</span>
          </div>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            Parish Photo Gallery
          </h1>
          <p className="mt-4 text-stone-600 text-base sm:text-lg leading-relaxed">
            Photographs of church liturgical rites, parish fiesta celebrations, youth apostolates, and sacred architecture.
          </p>

          {/* Album Selector Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedAlbumId('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                selectedAlbumId === 'all'
                  ? 'bg-[#6B1D2F] text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              All Photographs
            </button>
            {albums.map((a) => (
              <button
                key={a.album.id}
                onClick={() => setSelectedAlbumId(a.album.id.toString())}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  selectedAlbumId === a.album.id.toString()
                    ? 'bg-[#6B1D2F] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {a.album.title}
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="aspect-square bg-white rounded-2xl animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : activePhotos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-700">No Photographs</h3>
            <p className="text-sm text-stone-500 mt-1">
              Select another album to view photos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {activePhotos.map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-xs hover:shadow-xl cursor-pointer transition-all duration-300 border border-stone-200/60"
              >
                <img
                  src={resolveMediaUrl(img.imageUrl)}
                  alt={img.caption || 'Parish photo'}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                  <div className="text-white pr-2">
                    <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
                      {img.albumTitle}
                    </span>
                    <p className="text-sm font-medium line-clamp-1">
                      {img.caption || 'View photo'}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-white/20 text-white backdrop-blur-xs">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activePhotos[lightboxIndex] && createPortal(
        <div
          className="fixed inset-0 z-[100] w-screen h-screen bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="Close photo"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image and Caption */}
          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveMediaUrl(activePhotos[lightboxIndex].imageUrl)}
              alt={activePhotos[lightboxIndex].caption || 'Full view'}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            {activePhotos[lightboxIndex].caption && (
              <div className="mt-4 text-center max-w-2xl px-4">
                <p className="text-white text-base font-medium">
                  {activePhotos[lightboxIndex].caption}
                </p>
                <span className="text-xs text-amber-400 mt-1 block">
                  {activePhotos[lightboxIndex].albumTitle}
                </span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
