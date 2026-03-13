import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
// heroImage reemplazado por sketch
import {
  HERO_LAYERS,
  HERO_LAYER_ASSETS,
  HERO_LAYER_ORDER,
} from '../config/heroLayersConfig';

const ROTATION_MS = 3500;
const TRANSITION_MS = 650;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.2,
    },
  },
};

const viewport = { once: true, margin: '-40px', amount: 0.15 };

function HeroOverlayLayers() {
  const reducedMotion = useReducedMotion();

  if (HERO_LAYERS.useCombinedOverlay) {
    return (
      <div
        className="hero-layer hero-layer--combined"
        aria-hidden
        style={{ pointerEvents: 'none' }}
      >
        <img
          src={HERO_LAYER_ASSETS.combined}
          alt=""
          className="hero-layer__img"
          width="1536"
          height="1024"
        />
      </div>
    );
  }

  const layerKeys = HERO_LAYER_ORDER.filter((k) => HERO_LAYERS[k]);
  if (layerKeys.length === 0) return null;

  return (
    <>
      {layerKeys.map((layerKey) => {
        const src = HERO_LAYER_ASSETS[layerKey];
        const className = `hero-layer hero-layer--${layerKey}`;
        const motionProps = reducedMotion
          ? {}
          : layerKey === 'driftingBars'
            ? {
                initial: { opacity: 0.6 },
                whileInView: { opacity: 1 },
                viewport,
                transition: { duration: 1 },
              }
            : layerKey === 'sideMarkers' || layerKey === 'heroFrame'
              ? {
                  initial: { opacity: 0, y: 8 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport,
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                }
              : layerKey === 'architecturalOverlay'
                ? {
                    initial: { opacity: 0 },
                    whileInView: { opacity: 1 },
                    viewport,
                    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                  }
                : {
                    initial: { opacity: 0 },
                    whileInView: { opacity: 1 },
                    viewport,
                    transition: { duration: 0.9 },
                  };

        return (
          <motion.div
            key={layerKey}
            className={className}
            aria-hidden
            style={{ pointerEvents: 'none' }}
            {...motionProps}
          >
            <img
              src={src}
              alt=""
              className="hero-layer__img"
              width="1536"
              height="1024"
            />
          </motion.div>
        );
      })}
    </>
  );
}

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const images = useMemo(
    () => [
      '/sketchmarlett.png',
    ],
    []
  );
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(true);

  useEffect(() => {
    images.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, [images]);

  useEffect(() => {
    if (reducedMotion || images.length < 2) return;
    const intervalId = window.setInterval(() => {
      setIdx((current) => current + 1);
    }, ROTATION_MS);
    return () => window.clearInterval(intervalId);
  }, [images.length, reducedMotion]);

  useEffect(() => {
    if (idx !== images.length) return;
    const timeoutId = window.setTimeout(() => {
      setAnim(false);
      setIdx(0);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setAnim(true));
      });
    }, TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [idx, images.length]);

  const noMotion = Boolean(reducedMotion);
  const hasLayers =
    HERO_LAYERS.useCombinedOverlay ||
    HERO_LAYER_ORDER.some((key) => HERO_LAYERS[key]);

  return (
    <section className="hero-section" aria-label="Portada Marlett">
      <div className="hero-heroWrapper">
        <motion.div
          className="hero-imageWrapper"
          initial={noMotion ? false : { opacity: 0, y: 24 }}
          whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 1. Base: imagen principal */}
          <div className="hero-media" aria-label="Fachada de Marlett Restaurante & Salón de eventos">
            <div
              className={`hero-track ${anim ? '' : 'no-anim'}`.trim()}
              style={{ transform: `translateX(-${idx * 100}%)` }}
            >
              {images.map((src, i) => (
                <div
                  key={src}
                  className="hero-slide"
                  style={{ backgroundImage: `url(${src})` }}
                  aria-hidden={i !== idx}
                />
              ))}
              <div
                className="hero-slide hero-slide--clone"
                style={{ backgroundImage: `url(${images[0]})` }}
                aria-hidden={idx !== images.length}
              />
            </div>
          </div>

          {/* 2–8. Capas decorativas (orden: rings, bars, architectural, dots, frame, side markers) */}
          {hasLayers && <HeroOverlayLayers />}
        </motion.div>

        {/* 9. Contenido del hero */}
        <div className="hero-contentGrid">
          <motion.div
            className="hero-card"
            variants={noMotion ? undefined : stagger}
            initial="initial"
            whileInView="animate"
            viewport={viewport}
          >
            <motion.span className="hero-cardBadge" variants={noMotion ? undefined : fadeUp}>
              Eventos especiales
            </motion.span>
            <motion.h1 className="hero-cardTitle" variants={noMotion ? undefined : fadeUp}>
              <img src="/marlett_clean.png" alt="Marlett" style={{height:"0.72em",width:"auto",verticalAlign:"middle",filter:"brightness(1.15) saturate(1.2) drop-shadow(0 2px 8px rgba(0,0,0,0.4))"}} /> <em style={{fontStyle:"italic",color:"#c9a84c",fontWeight:300,fontSize:"0.62em",letterSpacing:"-0.01em",fontFamily:"'Playfair Display', serif"}}>Privé</em>
            </motion.h1>
            <motion.p className="hero-cardSubtitle" variants={noMotion ? undefined : fadeUp}>
              Restaurante &amp; Salón de eventos • Zapotlanejo / Guadalajara
            </motion.p>

            <motion.div className="hero-cardCopy" variants={noMotion ? undefined : stagger}>
              <motion.p className="hero-paragraph" variants={noMotion ? undefined : fadeUp}>
                En Marlett, no solo celebramos eventos: celebramos historias que merecen ser recordadas.
              </motion.p>
              <motion.p className="hero-paragraph" variants={noMotion ? undefined : fadeUp}>
                Es tu casa para celebrar tus logros, compartir con quienes más importan y ser el escenario donde nacen ideas que dejan huella. Luz cuidada, diseño moderno y detalles pensados para invitarte a quedarte.
              </motion.p>
              <motion.p className="hero-mantra" variants={noMotion ? undefined : fadeUp}>
                "La conexión multiplica la alegría como el conocimiento multiplica la sabiduría."
              </motion.p>
              <motion.p className="hero-ctaLine" variants={noMotion ? undefined : fadeUp}>
                Agenda tu experiencia y deja que la inspiración te encuentre aquí.
              </motion.p>
            </motion.div>

            <motion.div className="hero-ctaWrap" variants={noMotion ? undefined : fadeUp}>
              <a href="#resForm" className="hero-cta">
                Enviar solicitud
              </a>
            </motion.div>
          </motion.div>

          <div className="hero-right" aria-label="Lema Marlett">
            <div className="portrait-frame" aria-label="Marlett motto">
              <div className="portrait-frame__content" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
