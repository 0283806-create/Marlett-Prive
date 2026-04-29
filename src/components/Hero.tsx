import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import HeroParticles from './HeroParticles';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const STAGGER = 0.08;
const ITEM_DURATION = 0.4;

const SPRING_CONFIG = { damping: 30, stiffness: 100, mass: 0.5 };

export default function Hero() {
  const reduced = useReducedMotion() ?? false;

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothMouseX = useSpring(mouseX, SPRING_CONFIG);
  const smoothMouseY = useSpring(mouseY, SPRING_CONFIG);

  const bgTranslateX = useTransform(smoothMouseX, [0, 1], [12, -12]);
  const bgTranslateY = useTransform(smoothMouseY, [0, 1], [12, -12]);

  const spotlightX = useTransform(smoothMouseX, (v) => v * 100);
  const spotlightY = useTransform(smoothMouseY, (v) => v * 100);
  const spotlightBackground = useMotionTemplate`radial-gradient(circle 480px at ${spotlightX}% ${spotlightY}%, rgba(201, 184, 150, 0.18) 0%, rgba(201, 184, 150, 0.08) 25%, transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : STAGGER,
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: ITEM_DURATION, ease: EASE },
        },
      };

  return (
    <section
      className="hero-editorial"
      aria-label="Marlett Privé — Salón de eventos"
      onMouseMove={reduced ? undefined : handleMouseMove}
    >
      <motion.div
        className="hero-bg-parallax"
        aria-hidden="true"
        style={reduced ? undefined : { x: bgTranslateX, y: bgTranslateY }}
      >
        <div className="hero-bg-layer" />
      </motion.div>

      <div className="hero-editorial__overlay" aria-hidden="true" />

      {!reduced && (
        <motion.div
          className="hero-spotlight"
          aria-hidden="true"
          style={{ background: spotlightBackground }}
        />
      )}

      <HeroParticles />

      <motion.div
        className="hero-editorial__content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span variants={itemVariants} className="hero-editorial__kicker">
          Zapotlanejo · Jalisco
        </motion.span>

        <motion.h1 variants={itemVariants} className="hero-editorial__title">
          Un espacio pensado para momentos que no se olvidan
        </motion.h1>

        <motion.p variants={itemVariants} className="hero-editorial__subtitle">
          Restaurante y salón de eventos privado. Diseño, luz y atención al detalle —
          para hasta 200 invitados, a minutos de Guadalajara.
        </motion.p>

        <motion.div variants={itemVariants} className="hero-editorial__ctas">
          <a href="#resForm" className="cta-primary">
            Reservar disponibilidad
          </a>
          <a href="#galeria" className="cta-secondary">
            Ver galería <span aria-hidden="true">↓</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
