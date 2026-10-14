import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function GalleryPreviewSection({ config = {} }) {
  const {
    heading = "Moments of Faith & Celebration",
    subheading = "Snapshots from liturgical solemnities, fiesta processions, and parish ministry gatherings.",
    maxItems = 4,
    showViewAll = true
  } = config;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await publicApi.getGallery();
        if (res.data) {
          const allImages = [];
          res.data.forEach(albumObj => {
            if (albumObj.images) {
              albumObj.images.forEach(img => {
                allImages.push({
                  ...img,
                  albumTitle: albumObj.album?.title
                });
              });
            }
          });
          setImages(allImages.slice(0, maxItems));
        }
      } catch (err) {
        console.error('Failed to load gallery preview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [maxItems]);

  return (
    <section className="py-20 bg-[#FCFBF9] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 scroll-reveal">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-200">
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Photo Gallery</span>
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-2xl">
                {subheading}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B1D2F] hover:text-[#541624] group whitespace-nowrap"
            >
              <span>View Gallery</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="aspect-square bg-white rounded-2xl animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-stone-200 text-stone-500">
            Gallery preview photographs will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 scroll-stagger">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-xs card-lift scroll-reveal-scale img-zoom-hover cursor-pointer"
              >
                <img
                  src={resolveMediaUrl(img.imageUrl)}
                  alt={img.caption || 'Parish photo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <span className="text-xs text-amber-300 font-semibold block uppercase tracking-wider">
                      {img.albumTitle}
                    </span>
                    <p className="text-sm font-medium text-white line-clamp-1">
                      {img.caption || 'Parish life'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
