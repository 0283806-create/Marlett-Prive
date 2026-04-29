import { memo, useRef } from 'react';
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

export type GalleryItemData = {
  id: string;
  src: string;
  title: string;
  caption: string;
  span: { col: number; row: number };
};

interface GalleryItemProps {
  item: GalleryItemData;
  index: number;
  total: number;
  onClick: () => void;
}

const SPRING_CONFIG = { damping: 20, stiffness: 150, mass: 0.5 };
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function GalleryItem({ item, index, total, onClick }: GalleryItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, SPRING_CONFIG);
  const smoothY = useSpring(mouseY, SPRING_CONFIG);

  const rotateY = useTransform(smoothX, [0, 1], [6, -6]);
  const rotateX = useTransform(smoothY, [0, 1], [-6, 6]);

  const imgX = useTransform(smoothX, [0, 1], [-8, 8]);
  const imgY = useTransform(smoothY, [0, 1], [-8, 8]);

  const spotPctX = useTransform(smoothX, (v) => v * 100);
  const spotPctY = useTransform(smoothY, (v) => v * 100);
  const spotlight = useMotionTemplate`radial-gradient(circle 280px at ${spotPctX}% ${spotPctY}%, rgba(201, 184, 150, 0.22) 0%, rgba(201, 184, 150, 0.08) 30%, transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    if (reducedMotion) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const revealDelay = (index % 4) * 0.12;

  const motionStyle = reducedMotion
    ? {
        gridColumn: `span ${item.span.col}`,
        gridRow: `span ${item.span.row}`,
      }
    : {
        gridColumn: `span ${item.span.col}`,
        gridRow: `span ${item.span.row}`,
        rotateY,
        rotateX,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d' as const,
      };

  const titleWords = item.title.split(' ');

  return (
    <motion.button
      ref={ref}
      type="button"
      className="gallery-item"
      style={motionStyle}
      initial={reducedMotion ? false : { opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay: revealDelay, ease: EASE }}
      whileHover={reducedMotion ? undefined : { y: -6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      aria-label={`Ver detalle: ${item.title}`}
    >
      <motion.div
        className="gallery-item__img-wrap"
        style={reducedMotion ? undefined : { x: imgX, y: imgY }}
      >
        <img
          src={item.src}
          alt={item.title}
          className="gallery-item__img"
          loading={index < 3 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
        />
      </motion.div>

      {!reducedMotion && (
        <motion.div
          className="gallery-item__spotlight"
          aria-hidden="true"
          style={{ background: spotlight }}
        />
      )}

      <div className="gallery-item__overlay" aria-hidden="true" />

      <div className="gallery-item__caption">
        <span className="gallery-item__meta">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <h3 className="gallery-item__title">
          {titleWords.map((word, i) => (
            <span
              key={`${item.id}-w-${i}`}
              className="gallery-item__word"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {word}
            </span>
          ))}
        </h3>
        <p className="gallery-item__desc">{item.caption}</p>
      </div>

      <div className="gallery-item__cta" aria-hidden="true">
        <span>Ampliar</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 11L11 3M11 3H5M11 3V9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="gallery-item__border" aria-hidden="true" />
    </motion.button>
  );
}

export default memo(GalleryItem);
