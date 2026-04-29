import { memo } from 'react';

export type IllustrationType = 'concierge' | 'venue' | 'cuisine' | 'location';

interface ReasonIllustrationProps {
  type: IllustrationType;
}

const STROKE = 'var(--color-accent)';
const SW = 1;

function ConciergeIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="reason-illustration"
      role="img"
      aria-labelledby="ill-concierge-title"
    >
      <title id="ill-concierge-title">Copa de vino — atención al detalle</title>

      <path
        d="M 175 100 Q 175 175 195 195 Q 200 200 200 210 L 200 290"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 225 100 Q 225 175 205 195 Q 200 200 200 210"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinecap="round"
        opacity="0.85"
      />

      <path
        d="M 175 100 Q 200 95 225 100"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinecap="round"
        opacity="0.85"
      />

      <path
        d="M 182 145 Q 200 148 218 145"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinecap="round"
        opacity="0.4"
      />

      <ellipse
        cx="200"
        cy="295"
        rx="32"
        ry="3"
        stroke={STROKE}
        strokeWidth={SW}
        opacity="0.85"
      />
    </svg>
  );
}

function VenueIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="reason-illustration"
      role="img"
      aria-labelledby="ill-venue-title"
    >
      <title id="ill-venue-title">Arco arquitectónico — espacio amplio</title>

      <path
        d="M 130 320 L 130 200 Q 130 110 200 110 Q 270 110 270 200 L 270 320"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinecap="round"
        opacity="0.85"
      />

      <line
        x1="100"
        y1="320"
        x2="300"
        y2="320"
        stroke={STROKE}
        strokeWidth={SW}
        opacity="0.3"
      />

      <circle cx="200" cy="155" r="2.5" fill={STROKE} opacity="0.6" />
    </svg>
  );
}

function CuisineIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="reason-illustration"
      role="img"
      aria-labelledby="ill-cuisine-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="ill-cuisine-title">Cuchillo de chef — cocina de autor</title>

      <g transform="rotate(28 200 200)">
        {/* hoja: rectángulo alargado con punta curva */}
        <path
          d="M 100 195
             L 245 195
             Q 270 195 280 200
             Q 285 202 280 205
             Q 270 210 245 210
             L 100 210
             Z"
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* filo paralelo al lomo */}
        <path d="M 105 207 L 240 207" stroke={STROKE} strokeWidth={SW} opacity="0.35" />

        {/* mango */}
        <path
          d="M 100 188
             L 60 188
             Q 50 188 50 195
             L 50 210
             Q 50 217 60 217
             L 100 217
             Z"
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* remache del mango */}
        <circle cx="75" cy="202.5" r="2.5" stroke={STROKE} strokeWidth={SW} opacity="0.5" />
      </g>

      {/* sombra paralela al suelo (no rotada) */}
      <ellipse cx="200" cy="310" rx="80" ry="2" stroke={STROKE} strokeWidth={SW} opacity="0.18" />
    </svg>
  );
}

function LocationIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="reason-illustration"
      role="img"
      aria-labelledby="ill-location-title"
    >
      <title id="ill-location-title">Pin de ubicación — Zapotlanejo</title>

      <path d="M 60 230 Q 200 215 340 240" stroke={STROKE} strokeWidth={SW} opacity="0.18" />
      <path d="M 60 270 Q 200 258 340 280" stroke={STROKE} strokeWidth={SW} opacity="0.13" />
      <path d="M 60 310 Q 200 302 340 318" stroke={STROKE} strokeWidth={SW} opacity="0.08" />

      <path
        d="M 200 130 Q 165 130 165 175 Q 165 205 200 250 Q 235 205 235 175 Q 235 130 200 130 Z"
        stroke={STROKE}
        strokeWidth={SW + 0.2}
        opacity="0.9"
      />

      <circle cx="200" cy="178" r="6" stroke={STROKE} strokeWidth={SW} opacity="0.85" />
      <circle cx="200" cy="178" r="2" fill={STROKE} opacity="0.9" />

      <ellipse
        cx="200"
        cy="262"
        rx="20"
        ry="2"
        stroke={STROKE}
        strokeWidth={SW}
        opacity="0.25"
      />
    </svg>
  );
}

function ReasonIllustration({ type }: ReasonIllustrationProps) {
  switch (type) {
    case 'concierge':
      return <ConciergeIllustration />;
    case 'venue':
      return <VenueIllustration />;
    case 'cuisine':
      return <CuisineIllustration />;
    case 'location':
      return <LocationIllustration />;
    default:
      return null;
  }
}

export default memo(ReasonIllustration);
