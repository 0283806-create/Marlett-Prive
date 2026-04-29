import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import GalleryItem, { type GalleryItemData } from './GalleryItem';
import GalleryLightbox from './GalleryLightbox';

const GALLERY_ITEMS: GalleryItemData[] = [
  {
    id: 'salon-principal',
    src: '/images1.1/IMG_7430.jpeg',
    title: 'Salón principal',
    caption: 'Hasta 200 invitados · luz natural cenital',
    span: { col: 7, row: 3 },
  },
  {
    id: 'salon-arcos',
    src: '/assets/IMG_7434.jpg',
    title: 'Salón con arcos',
    caption: 'Iluminación premium · capacidad 180',
    span: { col: 5, row: 3 },
  },
  {
    id: 'lobby',
    src: '/assets/IMG_7431.jpg',
    title: 'Lobby de bienvenida',
    caption: 'Recepción · escalera de mármol',
    span: { col: 4, row: 2 },
  },
  {
    id: 'salon-amplio',
    src: '/images1.1/IMG_7435.jpeg',
    title: 'Salón amplio',
    caption: 'Eventos grandes · doble altura',
    span: { col: 5, row: 2 },
  },
  {
    id: 'escalera',
    src: '/assets/IMG_7432.jpg',
    title: 'Escalera principal',
    caption: 'Hierro forjado · arquitectura',
    span: { col: 3, row: 2 },
  },
  {
    id: 'lounge',
    src: '/images1.1/IMG_7034.jpeg',
    title: 'Área lounge',
    caption: 'Espacio íntimo · acceso restaurante',
    span: { col: 4, row: 3 },
  },
  {
    id: 'restaurante',
    src: '/images1.1/4b02c8d9-4942-4c81-b327-80caacc90722.jpeg',
    title: 'Restaurante Marlett',
    caption: 'Gastronomía de autor · cortes premium',
    span: { col: 4, row: 2 },
  },
  {
    id: 'lampara',
    src: '/images1.1/IMG_7427.jpeg',
    title: 'Iluminación artística',
    caption: 'Candelabro principal · doble altura',
    span: { col: 4, row: 3 },
  },
];

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="gallery-editorial-section" aria-label="Galería de espacios">
      <div className="gallery-editorial-section__inner">
        <header className="gallery-editorial-section__header">
          <span className="gallery-editorial-section__kicker">Nuestros eventos</span>
          <h2 className="gallery-editorial-section__title">
            Cada celebración, <em>una historia</em>
          </h2>
        </header>

        <div className="gallery-editorial-grid">
          {GALLERY_ITEMS.map((item, idx) => (
            <GalleryItem
              key={item.id}
              item={item}
              index={idx}
              total={GALLERY_ITEMS.length}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>

        <p className="gallery-editorial-section__caption">
          Cada evento es único — estos son algunos de los momentos que hemos celebrado juntos.
        </p>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <GalleryLightbox
            items={GALLERY_ITEMS}
            activeIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            onNavigate={setActiveIndex}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
