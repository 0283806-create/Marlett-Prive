import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// Categorías de eventos — reemplaza los src con tus imágenes reales
const EVENTS = [
  { id: 1, label: 'Bodas', tag: 'boda', src: '/assets/fachada-marlett.jpeg', caption: 'Boda íntima · 80 invitados' },
  { id: 2, label: 'XV Años', tag: 'xv', src: '/assets/marlett_hero.png', caption: 'XV años · salón completo' },
  { id: 3, label: 'Corporativo', tag: 'corp', src: '/assets/fachada-marlett.jpeg', caption: 'Cena corporativa · 50 personas' },
  { id: 4, label: 'Cumpleaños', tag: 'cumple', src: '/assets/marlett_hero.png', caption: 'Cumpleaños VIP · terraza' },
  { id: 5, label: 'Bodas', tag: 'boda', src: '/assets/marlett_hero.png', caption: 'Recepción · jardín exterior' },
  { id: 6, label: 'Corporativo', tag: 'corp', src: '/assets/fachada-marlett.jpeg', caption: 'Lanzamiento de producto · 120 invitados' },
];

const TAGS = ['Todos', 'Bodas', 'XV Años', 'Corporativo', 'Cumpleaños'];
const TAG_MAP: Record<string, string> = {
  'Todos': 'all',
  'Bodas': 'boda',
  'XV Años': 'xv',
  'Corporativo': 'corp',
  'Cumpleaños': 'cumple',
};

export default function Gallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [active, setActive] = useState('Todos');

  const filtered = active === 'Todos'
    ? EVENTS
    : EVENTS.filter((e) => e.tag === TAG_MAP[active]);

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

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 'clamp(32px, 5vw, 48px)',
          }}
        >
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActive(tag)}
              style={{
                fontFamily: '"Manrope", system-ui, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                padding: '8px 20px',
                borderRadius: 999,
                border: active === tag
                  ? '1px solid rgba(42,122,82,0.7)'
                  : '1px solid var(--border-strong)',
                background: active === tag
                  ? 'rgba(16, 36, 28, 0.8)'
                  : 'transparent',
                color: active === tag ? '#e8f6ee' : 'var(--text-soft)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: active === tag ? '0 0 0 3px rgba(47,143,94,0.15)' : 'none',
              }}
            >
              {tag}
            </button>
          ))}
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
            {filtered.map((ev, i) => (
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

        {/* Note */}
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
      </div>
    </section>
  );
}
