import React, { useState } from 'react';

interface BrandLogoProps {
  /** Altura del logo en px o rem. Default 40px (navbar). */
  height?: string | number;
  /** "navbar" | "footer" — para análisis de cargas críticas */
  variant?: 'navbar' | 'footer';
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  height = 40,
  variant = 'navbar',
  className = '',
}) => {
  const [errored, setErrored] = useState(false);

  const heightCss = typeof height === 'string' ? height : `${height}px`;
  const fallbackFontSize =
    typeof height === 'number' ? `${Math.round(height * 0.6)}px` : height;

  if (errored) {
    return (
      <span
        className={`brand-logo-fallback ${className}`}
        style={{
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: fallbackFontSize,
          color: 'var(--color-accent)',
          fontWeight: 400,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        Marlett
      </span>
    );
  }

  return (
    <img
      src="/marlett-logo.png"
      alt="Marlett"
      height={typeof height === 'number' ? height : undefined}
      style={{
        height: heightCss,
        width: 'auto',
        display: 'block',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      loading={variant === 'navbar' ? 'eager' : 'lazy'}
      fetchPriority={variant === 'navbar' ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      className={className}
      onError={() => setErrored(true)}
    />
  );
};

export default React.memo(BrandLogo);
