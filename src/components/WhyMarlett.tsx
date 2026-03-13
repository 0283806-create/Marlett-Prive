import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const reasons = [
  {
    number: '01',
    title: 'Atención personalizada',
    body: 'Cada evento tiene un coordinador dedicado que entiende tu visión y la ejecuta sin que tengas que preocuparte por los detalles.',
  },
  {
    number: '02',
    title: 'Espacio premium',
    body: 'Salón de eventos diseñado para celebraciones íntimas y corporativas, con capacidad para hasta 200 invitados en un ambiente único.',
  },
  {
    number: '03',
    title: 'Cocina de autor',
    body: 'El mismo estándar gastronómico de Marlett — cortes, pastas frescas y cócteles únicos — llevado a tu evento privado.',
  },
  {
    number: '04',
    title: 'Ubicación privilegiada',
    body: 'En el corazón de Zapotlanejo, Jalisco. A 30 minutos de Guadalajara, con acceso fácil y estacionamiento para tus invitados.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export default function WhyMarlett() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      style={{
        padding: 'clamp(72px, 12vw, 120px) 0 clamp(56px, 10vw, 96px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(42,122,82,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="wrap">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 'clamp(48px, 7vw, 72px)' }}
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
            Por qué elegirnos
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
            Marlett Privé es más<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent-champagne)' }}>
              que un espacio
            </em>
          </h2>
        </motion.div>

        {/* Grid of reasons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(20px, 2.5vw, 28px)',
          }}
        >
          {reasons.map((r) => (
            <motion.div
              key={r.number}
              variants={itemVariants}
              style={{
                position: 'relative',
                padding: 'clamp(28px, 4vw, 36px)',
                borderRadius: '20px',
                background: 'rgba(14, 19, 17, 0.75)',
                border: '1px solid var(--border-strong)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'border-color 0.3s ease, transform 0.3s ease',
                cursor: 'default',
              }}
              whileHover={{
                borderColor: 'rgba(201, 184, 150, 0.35)',
                y: -4,
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '3rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  color: 'rgba(201, 184, 150, 0.15)',
                  letterSpacing: '-0.04em',
                  userSelect: 'none',
                }}
              >
                {r.number}
              </span>

              {/* Divider */}
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: 'linear-gradient(90deg, var(--accent), transparent)',
                }}
              />

              {/* Title */}
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
                  fontWeight: 600,
                  color: '#f8f6f0',
                  letterSpacing: '0.01em',
                  lineHeight: 1.2,
                }}
              >
                {r.title}
              </h3>

              {/* Body */}
              <p
                style={{
                  margin: 0,
                  fontFamily: '"Manrope", system-ui, sans-serif',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  lineHeight: 1.65,
                  color: 'var(--text-soft)',
                }}
              >
                {r.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: 'clamp(48px, 7vw, 72px)',
            padding: 'clamp(24px, 4vw, 36px)',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(42,122,82,0.12) 0%, rgba(14,19,17,0.8) 100%)',
            border: '1px solid rgba(42,122,82,0.25)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 6px',
                fontFamily: '"Playfair Display", serif',
                fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
                fontWeight: 600,
                color: '#f8f6f0',
              }}
            >
              ¿Tienes un evento en mente?
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: '"Manrope", system-ui, sans-serif',
                fontSize: '0.9375rem',
                color: 'var(--text-soft)',
              }}
            >
              Cuéntanos y te contactamos con una propuesta en menos de 24 horas.
            </p>
          </div>
          <a
            href="#resForm"
            className="hero-cta"
            style={{ flexShrink: 0 }}
          >
            Solicitar disponibilidad
          </a>
        </motion.div>
      </div>
    </section>
  );
}
