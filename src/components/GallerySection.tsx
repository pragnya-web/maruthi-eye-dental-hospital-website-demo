import React, { useState, useEffect } from 'react';
import { Image, X, ChevronLeft, ChevronRight, Eye, ZoomIn } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { GalleryImage } from '../types/index.ts';

export const GallerySection: React.FC = () => {
  const { gallery } = useHospital();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const categories = [
    'All',
    'Hospital Exterior',
    'Reception',
    'Eye Care',
    'Dental Care',
    'Facilities',
    'Patient Areas',
  ];

  const filteredImages =
    selectedCategory === 'All'
      ? gallery
      : gallery.filter((img) => img.category === selectedCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredImages.length : 0
        );
      }
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : 0
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredImages.length]);

  return (
    <section id="gallery" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
            Visual Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hospital Gallery
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Take a look at the clinical spaces, consultation desks, and diagnostic equipment at Maruthi Eye & Dental Hospital.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveLightboxIndex(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img: GalleryImage, idx: number) => (
            <div
              key={img.id}
              onClick={() => setActiveLightboxIndex(idx)}
              className="group cursor-pointer relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all border border-slate-200/80 aspect-4/3"
            >
              <img
                src={img.imageUrl}
                alt={img.altText || img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  {img.category}
                </span>
                <p className="text-sm font-bold text-white mt-0.5 line-clamp-2">
                  {img.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-2">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Click to expand</span>
                </div>
              </div>

              {/* Badge top-left */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                {img.category}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && filteredImages[activeLightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex((prev) =>
                    prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : 0
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex((prev) =>
                    prev !== null ? (prev + 1) % filteredImages.length : 0
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Lightbox Content */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={filteredImages[activeLightboxIndex].imageUrl}
              alt={filteredImages[activeLightboxIndex].altText || filteredImages[activeLightboxIndex].title}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div className="text-center mt-4 text-white">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                {filteredImages[activeLightboxIndex].category}
              </span>
              <h4 className="text-base font-bold mt-1">
                {filteredImages[activeLightboxIndex].title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeLightboxIndex + 1} of {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
