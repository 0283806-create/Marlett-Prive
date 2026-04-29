import { memo, useId, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export type TicketSummaryProps = {
  fullName: string;
  phone: string;
  date: string;
  dateFlex: boolean;
  guests: string;
  eventType: string;
};

const MONTHS_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function formatTicketDate(date: string, flex: boolean): string {
  if (flex) return 'por confirmar';
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  const [yyyy, mm, dd] = parts;
  const monthIdx = Math.max(0, Math.min(11, Number(mm) - 1));
  const day = String(Number(dd)).padStart(2, '0');
  return `${day} / ${MONTHS_ES[monthIdx]} / ${yyyy}`;
}

function formatGuests(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  const numeric = Number(trimmed.replace(/[^\d]/g, ''));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `${numeric} personas`;
  }
  return trimmed;
}

function formatEventType(value: string): string {
  if (!value) return '';
  const t = value.trim();
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function formatContact(name: string): string {
  if (!name) return '';
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  if (tokens.length === 1) return tokens[0];
  return `${tokens[0]} ${tokens[tokens.length > 2 ? 2 : 1]}`;
}

function formatIssued(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${mon} ${year}`;
}

const TICKET_CLIP = `polygon(
  0% 8px, 3% 0%, 7% 8px, 11% 0%, 15% 8px, 19% 0%, 23% 8px, 27% 0%,
  31% 8px, 35% 0%, 39% 8px, 43% 0%, 47% 8px, 51% 0%, 55% 8px, 59% 0%,
  63% 8px, 67% 0%, 71% 8px, 75% 0%, 79% 8px, 83% 0%, 87% 8px, 91% 0%,
  95% 8px, 100% 0%, 100% calc(100% - 8px),
  97% 100%, 93% calc(100% - 8px), 89% 100%, 85% calc(100% - 8px),
  81% 100%, 77% calc(100% - 8px), 73% 100%, 69% calc(100% - 8px),
  65% 100%, 61% calc(100% - 8px), 57% 100%, 53% calc(100% - 8px),
  49% 100%, 45% calc(100% - 8px), 41% 100%, 37% calc(100% - 8px),
  33% 100%, 29% calc(100% - 8px), 25% 100%, 21% calc(100% - 8px),
  17% 100%, 13% calc(100% - 8px), 9% 100%, 5% calc(100% - 8px),
  1% 100%, 0% calc(100% - 8px)
)`;

const INK_DARK = '#2a2520';
const INK_MUTED = '#6b5d4a';
const INK_LOGO = '#8b6f47';

const labelStyle: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  fontSize: 10,
  color: INK_MUTED,
  fontWeight: 600,
  margin: 0,
};

const valueStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Courier Prime", "Courier New", monospace',
  fontSize: 13,
  fontWeight: 500,
  color: INK_DARK,
  margin: 0,
  letterSpacing: '0.02em',
  lineHeight: 1.3,
  minHeight: '1.3em',
};

const dashedRule: React.CSSProperties = {
  border: 0,
  borderTop: '1px dashed rgba(42,37,32,0.3)',
  margin: '14px 0',
};

type TicketLineProps = {
  label: string;
  value: string;
};

function TicketLine({ label, value }: TicketLineProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: 8, alignItems: 'baseline' }}>
      <p style={labelStyle}>{label}</p>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" initial={false}>
          {value ? (
            <motion.p
              key={`v-${value}`}
              style={valueStyle}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {value}
            </motion.p>
          ) : (
            <motion.span
              key="empty"
              style={{
                display: 'inline-block',
                width: '100%',
                borderBottom: `1px solid ${INK_MUTED}`,
                color: 'transparent',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                lineHeight: 1.3,
              }}
              initial={false}
              aria-hidden="true"
            >
              _______________
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TicketSummaryComponent({ fullName, phone, date, dateFlex, guests, eventType }: TicketSummaryProps) {
  const reduced = useReducedMotion() ?? false;
  const filterId = useId().replace(/[:]/g, '-') + '-paper-grain';

  const folio = useMemo(() => {
    const n = Math.floor(100 + Math.random() * 900);
    return `#00${n}`;
  }, []);
  const issued = useMemo(() => formatIssued(new Date()), []);

  const fechaValue = formatTicketDate(date, dateFlex);
  const invitadosValue = formatGuests(guests);
  const tipoValue = formatEventType(eventType);
  const contactoValue = formatContact(fullName) || (phone ? phone : '');

  const initial = reduced
    ? { opacity: 0, rotate: 0, y: 0 }
    : { opacity: 0, rotate: -8, y: 40 };
  const animate = reduced
    ? { opacity: 1, rotate: 0, y: 0 }
    : { opacity: 1, rotate: -1.2, y: 0 };
  const transition = reduced
    ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    : { type: 'spring' as const, stiffness: 80, damping: 14 };

  const playedRef = useRef(false);
  const onAnimationComplete = () => {
    playedRef.current = true;
  };

  return (
    <motion.div
      role="figure"
      aria-label="Resumen de tu solicitud"
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.3 }}
      transition={transition}
      onAnimationComplete={onAnimationComplete}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 300,
        margin: '0 auto',
        padding: '2.25rem 1.75rem 2rem',
        background: 'linear-gradient(135deg, #f4ede0 0%, #ebe1cf 100%)',
        borderRadius: 2,
        boxShadow:
          '0 24px 48px -16px rgba(0,0,0,0.6), 0 4px 12px -2px rgba(0,0,0,0.3)',
        clipPath: TICKET_CLIP,
        WebkitClipPath: TICKET_CLIP,
        color: INK_DARK,
        willChange: 'transform',
      }}
    >
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.08,
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
        }}
      >
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} />
          <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <p
          style={{
            margin: 0,
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 32,
            color: INK_LOGO,
            lineHeight: 1,
          }}
        >
          Marlett
        </p>
        <p
          style={{
            margin: '6px 0 0',
            fontFamily: '"Manrope", system-ui, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: 9,
            fontWeight: 600,
            color: INK_MUTED,
          }}
        >
          Restaurante y salón de eventos
        </p>
      </div>

      <hr style={dashedRule} />

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 10 }}>
        <TicketLine label="Fecha" value={fechaValue} />
        <TicketLine label="Invitados" value={invitadosValue} />
        <TicketLine label="Tipo" value={tipoValue} />
        <TicketLine label="Contacto" value={contactoValue} />
      </div>

      <hr style={dashedRule} />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          fontFamily: '"JetBrains Mono", "Courier Prime", monospace',
          fontSize: 11,
          color: INK_MUTED,
          letterSpacing: '0.05em',
        }}
      >
        <span>FOLIO {folio}</span>
        <span>Emitido: {issued}</span>
      </div>

      <hr style={dashedRule} />

      <p
        style={{
          position: 'relative',
          zIndex: 1,
          margin: 0,
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontSize: 9,
          lineHeight: 1.5,
          textAlign: 'center',
          color: INK_MUTED,
        }}
      >
        *Tu información será utilizada exclusivamente
        <br />para fines de seguimiento*
      </p>
    </motion.div>
  );
}

const TicketSummary = memo(TicketSummaryComponent);
export default TicketSummary;
