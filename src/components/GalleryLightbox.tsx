import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GalleryItemData } from './GalleryItem';

interface LightboxProps {
  items: GalleryItemData[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (idx: number) => void;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function GalleryLightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const item = items[activeIndex];

  const goNext = () => {
    if (activeIndex < items.length - 1) onNavigate(activeIndex + 1);
  };

  const goPrev = () => {
    if (activeIndex > 0) onNavigate(activeIndex - 1);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowRight' && activeIndex < items.length - 1) {
        onNavigate(activeIndex + 1);
        return;
      }
      if (e.key === 'ArrowLeft' && activeIndex > 0) {
        onNavigate(activeIndex - 1);
      }
    };

    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, items.length, onClose, onNavigate]);

  return (
    <motion.div
      className="gallery-lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="gallery-lightbox__backdrop" aria-hidden="true" />

      <button
        type="button"
        className="gallery-lightbox__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 5L15 15M15 5L5 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className="gallery-lightbox__nav gallery-lightbox__nav--prev"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        disabled={activeIndex === 0}
        aria-label="Imagen anterior"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M18 6L10 14L18 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className="gallery-lightbox__nav gallery-lightbox__nav--next"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        disabled={activeIndex === items.length - 1}
        aria-label="Imagen siguiente"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M10 6L18 14L10 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <motion.div
        className="gallery-lightbox__content"
        key={item.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={item.src} alt={item.title} className="gallery-lightbox__img" />
        <div className="gallery-lightbox__info">
          <span className="gallery-lightbox__meta">
            {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <h3 className="gallery-lightbox__title">{item.title}</h3>
          <p className="gallery-lightbox__desc">{item.caption}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
