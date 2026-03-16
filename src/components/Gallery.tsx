import { useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import MarlettPriveLabel from './MarlettPriveLabel';

const EVENTS = [
  { id: 1, label: 'Salón principal', tag: 'todos', src: '/images1.1/IMG_7430.jpeg', caption: 'Salón principal · hasta 200 invitados' },
  { id: 2, label: 'Área lounge', tag: 'bodas', src: '/images1.1/IMG_7034.jpeg', caption: 'Área lounge · ambiente íntimo' },
  { id: 3, label: 'Salón con arcos', tag: 'corporativo', src: '/assets/IMG_7434.jpg', caption: 'Salón con arcos · iluminación premium' },
  { id: 4, label: 'Salón amplio', tag: 'xv', src: '/images1.1/IMG_7435.jpeg', caption: 'Salón amplio · eventos grandes' },
  { id: 5, label: 'Lobby principal', tag: 'todos', src: '/assets/IMG_7431.jpg', caption: 'Lobby · recepción de invitados' },
  { id: 6, label: 'Escaleras', tag: 'cumple', src: '/assets/IMG_7432.jpg', caption: 'Acceso · diseño arquitectónico' },
  { id: 7, label: 'Restaurante', tag: 'todos', src: '/images1.1/4b02c8d9-4942-4c81-b327-80caacc90722.jpeg', caption: 'Restaurante Marlett · gastronomía' },
  { id: 8, label: 'Lámpara central', tag: 'bodas', src: '/images1.1/IMG_7427.jpeg', caption: 'Detalle · iluminación artística' },
];

export default function Gallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      style={{
        padding: 'clamp(72px, 12vw, 120px) 0',
        position: 'relative',
      }}
    >
      {/* Glow left */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '-15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,184,150,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="wrap">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 'clamp(36px, 5vw, 56px)' }}
        >
          <p
            style={{
              margin: '0 0 16px',
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
            Nuestros eventos
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: '#f8f6f0',
            }}
          >
            Cada celebración,{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--accent-champagne)' }}>
              una historia
            </em>
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'clamp(14px, 2vw, 20px)',
          }}
        >
          <AnimatePresence mode="popLayout">
            {EVENTS.map((ev, i) => (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'relative',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  aspectRatio: '4 / 3',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: 'var(--panel)',
                }}
                whileHover="hovered"
              >
                {/* Image */}
                <img
                  src={ev.src}
                  alt={ev.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.6s ease',
                  }}
                />

                {/* Hover overlay */}
                <motion.div
                  variants={{
                    hovered: { opacity: 1 },
                  }}
                  initial={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 30%, rgba(6,10,8,0.88) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '24px 20px',
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontFamily: '"Manrope", system-ui, sans-serif',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                      }}
                    >
                      {ev.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: '#f8f6f0',
                      }}
                    >
                      {ev.caption}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            marginTop: 'clamp(28px, 4vw, 40px)',
            textAlign: 'center',
            fontFamily: '"Manrope", system-ui, sans-serif',
            fontSize: '0.875rem',
            color: 'var(--muted)',
            fontStyle: 'italic',
          }}
        >
          Cada evento es único — estos son algunos de los momentos que hemos celebrado juntos.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.9 }}
          style={{
            marginTop: '12px',
            textAlign: 'center',
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#f8f6f0',
          }}
        >
          El espacio ideal existe. Bienvenido a <MarlettPriveLabel />.
        </motion.p>
      </div>
    </section>
  );
}
