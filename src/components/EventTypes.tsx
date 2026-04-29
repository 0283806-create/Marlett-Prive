import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Crown, Briefcase, Confetti } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

type EventType = {
  Icon: Icon;
  title: string;
  desc: string;
  capacity: string;
  detail: string;
};

const EVENT_TYPES: EventType[] = [
  {
    Icon: Heart,
    title: 'Bodas',
    desc: 'Desde la ceremonia hasta el último baile. Coordinación completa, decoración incluida.',
    capacity: 'Hasta 200 invitados',
    detail: 'Servicio de banquete · DJ · Decoración floral',
  },
  {
    Icon: Crown,
    title: 'XV Años',
    desc: 'El día más especial merece el espacio más especial. Hacemos de tu quince un sueño.',
    capacity: 'Hasta 180 invitados',
    detail: 'Vals · Sorpresa · Menú personalizado',
  },
  {
    Icon: Briefcase,
    title: 'Corporativo',
    desc: 'Cenas de negocios, lanzamientos, team buildings y eventos de empresa con clase.',
    capacity: 'Hasta 120 personas',
    detail: 'AV · Catering ejecutivo · Sala privada',
  },
  {
    Icon: Confetti,
    title: 'Celebraciones',
    desc: 'Cumpleaños, aniversarios, graduaciones. Cualquier motivo es uno para celebrar.',
    capacity: 'Desde 20 invitados',
    detail: 'Ambiente personalizado · Pastel · Bar abierto',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export default function EventTypes() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      style={{
        padding: 'clamp(72px, 12vw, 120px) 0',
        position: 'relative',
      }}
    >
      <div className="wrap">
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
            marginBottom: 'clamp(48px, 7vw, 72px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(24px, 4vw, 48px)',
            alignItems: 'end',
            marginBottom: 'clamp(48px, 7vw, 64px)',
          }}
        >
          <div>
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
              Tipos de evento
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
              Un espacio para{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent-champagne)' }}>
                cada ocasión
              </em>
            </h2>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: 'clamp(0.9375rem, 1.2vw, 1.05rem)',
              fontWeight: 500,
              lineHeight: 1.65,
              color: 'var(--text-soft)',
              maxWidth: 460,
            }}
          >
            Nos adaptamos al tipo de evento que necesitas, con la misma atención
            al detalle y calidad que nos caracteriza.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {EVENT_TYPES.map((ev) => {
            const IconCmp = ev.Icon;
            return (
              <motion.div
                key={ev.title}
                variants={itemVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: 'clamp(16px, 2.5vw, 28px)',
                  alignItems: 'center',
                  padding: 'clamp(20px, 3vw, 28px) clamp(16px, 3vw, 24px)',
                  borderRadius: 16,
                  border: '1px solid transparent',
                  color: 'var(--color-accent)',
                  transition:
                    'background var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease)',
                  cursor: 'default',
                }}
                whileHover={{
                  background: 'rgba(14,19,17,0.65)',
                  borderColor: 'var(--border)',
                  color: '#fff',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 24,
                    color: 'inherit',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  <IconCmp size={24} weight="thin" />
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 'clamp(1.1rem, 1.5vw, 1.25rem)',
                        fontWeight: 600,
                        color: '#f8f6f0',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {ev.title}
                    </h3>
                    <span
                      style={{
                        fontFamily: '"Manrope", system-ui, sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {ev.capacity}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: '"Manrope", system-ui, sans-serif',
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color: 'var(--text-soft)',
                    }}
                  >
                    {ev.desc}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontFamily: '"Manrope", system-ui, sans-serif',
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {ev.detail}
                  </p>
                </div>

                <span
                  style={{
                    color: 'inherit',
                    fontSize: '1.2rem',
                    opacity: 0.55,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  →
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
            marginTop: 'clamp(48px, 7vw, 72px)',
          }}
        />
      </div>
    </section>
  );
}
