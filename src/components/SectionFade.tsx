import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionFadeProps {
  children: ReactNode;
  delay?: number;
  blur?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function SectionFade({
  children,
  delay = 0,
  blur = true,
  className,
  style,
}: SectionFadeProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{
        opacity: 0,
        y: 32,
        filter: blur ? 'blur(8px)' : 'none',
      }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : {}
      }
      transition={{
        duration: 1.1,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
