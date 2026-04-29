import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import ReasonIllustration, { type IllustrationType } from './ReasonIllustration';

type Reason = {
  number: string;
  title: string;
  description: string;
  illustration: IllustrationType;
};

const REASONS: Reason[] = [
  {
    number: '01',
    title: 'Atención personalizada',
    description:
      'Cada evento tiene un coordinador dedicado que entiende tu visión y la ejecuta sin que tengas que preocuparte por los detalles.',
    illustration: 'concierge',
  },
  {
    number: '02',
    title: 'Espacio premium',
    description:
      'Salón de eventos diseñado para celebraciones íntimas y corporativas, con capacidad para hasta 200 invitados en un ambiente único.',
    illustration: 'venue',
  },
  {
    number: '03',
    title: 'Cocina de autor',
    description:
      'El mismo estándar gastronómico de Marlett — cortes, pastas frescas y cócteles únicos — llevado a tu evento privado.',
    illustration: 'cuisine',
  },
  {
    number: '04',
    title: 'Ubicación privilegiada',
    description:
      'En el corazón de Zapotlanejo, Jalisco. A 30 minutos de Guadalajara, con acceso fácil y estacionamiento para tus invitados.',
    illustration: 'location',
  },
];

function useIsBelowWidth(maxWidthPx: number): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < maxWidthPx : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidthPx - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [maxWidthPx]);
  return matches;
}

type AnimatedWordProps = {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  withBlur?: boolean;
  yFrom?: number;
};

function AnimatedWord({
  word,
  progress,
  start,
  end,
  withBlur = false,
  yFrom = 8,
}: AnimatedWordProps) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [yFrom, 0]);
  const blur = useTransform(progress, [start, end], [withBlur ? 8 : 0, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  const style: React.CSSProperties = {
    display: 'inline-block',
    marginRight: '0.25em',
    willChange: 'transform, opacity',
  };

  return (
    <motion.span
      style={
        withBlur
          ? { ...style, opacity, y, filter }
          : { ...style, opacity, y }
      }
    >
      {word}
    </motion.span>
  );
}

type ReasonSlideProps = {
  reason: Reason;
  index: number;
  total: number;
  progress: MotionValue<number>;
};

function ReasonSlide({ reason, index, total, progress }: ReasonSlideProps) {
  const slotSize = 1 / total;
  const slotStart = index * slotSize;

  const fadeInStart = slotStart + slotSize * 0.05;
  const fadeInEnd = slotStart + slotSize * 0.25;
  const fadeOutStart = slotStart + slotSize * 0.75;
  const fadeOutEnd = slotStart + slotSize * 0.95;

  const opacity = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [40, 0, 0, -40]
  );

  const lineScaleX = useTransform(progress, [fadeInStart, fadeInEnd], [0, 1]);

  const charProgress = useTransform(
    progress,
    [fadeInStart, fadeInEnd + slotSize * 0.15],
    [0, 1]
  );

  const illustrationOpacity = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0]
  );
  const illustrationScale = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0.94, 1, 1, 0.96]
  );

  const titleWords = reason.title.split(' ');
  const descWords = reason.description.split(' ');

  return (
    <motion.article className="why-reason" style={{ opacity, y }}>
      <div className="why-reason__content">
        <div className="why-reason__numeral" aria-hidden="true">
          <motion.span
            className="why-reason__numeral-line"
            style={{ scaleX: lineScaleX }}
          />
          <span>{reason.number}</span>
          <span className="why-reason__numeral-label">razón</span>
        </div>

        <h3 className="why-reason__title">
          <span className="sr-only">{reason.title}</span>
          <span aria-hidden="true">
            {titleWords.map((word, i) => (
              <AnimatedWord
                key={`t-${index}-${i}`}
                word={word}
                progress={charProgress}
                start={i / titleWords.length}
                end={(i + 0.6) / titleWords.length}
                withBlur
                yFrom={12}
              />
            ))}
          </span>
        </h3>

        <p className="why-reason__description">
          <span className="sr-only">{reason.description}</span>
          <span aria-hidden="true">
            {descWords.map((word, i) => (
              <AnimatedWord
                key={`d-${index}-${i}`}
                word={word}
                progress={charProgress}
                start={i / descWords.length}
                end={(i + 0.5) / descWords.length}
                yFrom={8}
              />
            ))}
          </span>
        </p>
      </div>

      <div className="why-reason__visual" aria-hidden="true">
        <motion.div
          className="why-reason__illustration-wrap"
          style={{ opacity: illustrationOpacity, scale: illustrationScale }}
        >
          <ReasonIllustration type={reason.illustration} />
        </motion.div>
      </div>
    </motion.article>
  );
}

function ReasonStatic({ reason }: { reason: Reason }) {
  return (
    <article className="why-reason why-reason--static">
      <div className="why-reason__content">
        <div className="why-reason__numeral" aria-hidden="true">
          <span className="why-reason__numeral-line why-reason__numeral-line--static" />
          <span>{reason.number}</span>
          <span className="why-reason__numeral-label">razón</span>
        </div>
        <h3 className="why-reason__title">{reason.title}</h3>
        <p className="why-reason__description">{reason.description}</p>
      </div>
      <div className="why-reason__visual" aria-hidden="true">
        <div className="why-reason__illustration-wrap">
          <ReasonIllustration type={reason.illustration} />
        </div>
      </div>
    </article>
  );
}

type ProgressItemProps = {
  reason: Reason;
  idx: number;
  total: number;
  progress: MotionValue<number>;
};

function ProgressItem({ reason, idx, total, progress }: ProgressItemProps) {
  const slotStart = idx / total;
  const slotEnd = (idx + 1) / total;
  const slotMid = (slotStart + slotEnd) / 2;

  const opacity = useTransform(
    progress,
    [slotStart, slotMid, slotEnd],
    [0.3, 1, 0.3]
  );
  const lineWidthPx = useTransform(progress, [slotStart, slotEnd], [12, 32]);
  const lineWidth = useMotionTemplate`${lineWidthPx}px`;

  return (
    <div className="why-progress__item">
      <motion.span className="why-progress__number" style={{ opacity }}>
        {reason.number}
      </motion.span>
      <motion.span
        className="why-progress__line"
        style={{ width: lineWidth, opacity }}
      />
    </div>
  );
}

export default function WhyMarlett() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const isMobile = useIsBelowWidth(768);
  const useStatic = isMobile || reducedMotion;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
  });

  return (
    <section
      ref={sectionRef}
      className={`why-marlett-cinema${useStatic ? ' is-static' : ''}`}
      aria-labelledby="why-marlett-title"
    >
      <div className="why-marlett-cinema__sticky">
        <header className="why-marlett-cinema__header">
          <span className="why-marlett-cinema__kicker">Por qué elegirnos</span>
          <h2 id="why-marlett-title" className="why-marlett-cinema__title">
            Es más que un <em>espacio</em>
          </h2>
        </header>

        <div className="why-stage">
          {REASONS.map((reason, idx) =>
            useStatic ? (
              <ReasonStatic key={reason.number} reason={reason} />
            ) : (
              <ReasonSlide
                key={reason.number}
                reason={reason}
                index={idx}
                total={REASONS.length}
                progress={smoothProgress}
              />
            )
          )}
        </div>

        {!useStatic && (
          <div className="why-progress" aria-hidden="true">
            {REASONS.map((reason, idx) => (
              <ProgressItem
                key={reason.number}
                reason={reason}
                idx={idx}
                total={REASONS.length}
                progress={smoothProgress}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
