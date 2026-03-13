import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const LINES = [
  { text: 'Un espacio pensado para momentos que no se olvidan.', align: 'left' },
  { text: 'Diseño, luz y atención al detalle — en cada rincón.', align: 'right' },
  { text: 'Hasta 200 invitados. Una sola historia a la vez.', align: 'left' },
  { text: 'Zapotlanejo, Jalisco. A minutos de Guadalajara.', align: 'right' },
];

function ScrollLine({
  text,
  align,
  index,
  total,
}: {
  text: string;
  align: 'left' | 'right';
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [align === 'left' ? -40 : 40, 0]
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, x }}
      aria-label={text}
      className={`sketch-line sketch-line--${align}`}
    >
      <p>{text}</p>
    </motion.div>
  );
}

export default function SketchScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Sketch parallax suave
  const sketchY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);
  const sketchOpacity = useTransform(scrollYProgress, [0, 0.15, 0.75, 1], [0, 0.18, 0.18, 0]);

  return (
    <section
      ref={sectionRef}
      aria-label="Historia de Marlett Privé"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        background: '#080b09',
        padding: 'clamp(80px, 14vw, 160px) 0',
      }}
    >
      {/* Sketch de fondo con parallax */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-10% 0',
          backgroundImage: 'url(/sketchmarlett.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          y: reducedMotion ? 0 : sketchY,
          opacity: reducedMotion ? 0.12 : sketchOpacity,
          filter: 'invert(1) contrast(0.9)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* Overlay para contraste */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #080b09 0%, transparent 15%, transparent 85%, #080b09 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Frases descriptivas */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 clamp(24px, 6vw, 80px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(48px, 8vw, 80px)',
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center' }}
        >
          <span
            style={{
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#c9b896',
            }}
          >
            Marlett Privé
          </span>
        </motion.div>

        {/* Líneas con scroll */}
        {LINES.map((line, i) => (
          <ScrollLine
            key={i}
            text={line.text}
            align={line.align as 'left' | 'right'}
            index={i}
            total={LINES.length}
          />
        ))}

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', paddingTop: 16 }}
        >
          <a
            href="#resForm"
            style={{
              display: 'inline-block',
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: '0.8125rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#c9b896',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(201,184,150,0.4)',
              paddingBottom: 3,
              transition: 'border-color 0.25s',
            }}
          >
            Agenda tu evento →
          </a>
        </motion.div>
      </div>

      <style>{`
        .sketch-line {
          max-width: 640px;
        }
        .sketch-line--left {
          align-self: flex-start;
          text-align: left;
        }
        .sketch-line--right {
          align-self: flex-end;
          text-align: right;
        }
        .sketch-line p {
          font-family: "Playfair Display", serif;
          font-size: clamp(1.375rem, 2.8vw, 2.125rem);
          font-weight: 400;
          font-style: italic;
          line-height: 1.35;
          color: var(--text, #f2f6f1);
          margin: 0;
          letter-spacing: -0.01em;
        }
      `}</style>
    </section>
  );
}
