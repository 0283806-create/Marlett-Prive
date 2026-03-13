import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Footer from './components/Footer';
import Hero from './components/Hero';
import RequestForm from './components/form/RequestForm';
import WhyMarlett from './components/WhyMarlett';
import Gallery from './components/Gallery';
import EventTypes from './components/EventTypes';
import { SITE_URL, withSiteUrl } from './lib/config';

function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Corregido: "Privé" con acento
    document.title = 'Marlett Privé — Restaurante & Salón de Eventos';

    function ensureTag<T extends HTMLElement>(selector: string, createTag: () => T): T {
      const existing = document.head.querySelector<T>(selector);
      if (existing) return existing;
      const tag = createTag();
      document.head.appendChild(tag);
      return tag;
    }

    const canonicalLink = ensureTag<HTMLLinkElement>('link[rel="canonical"]', () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    });
    canonicalLink.href = SITE_URL;

    const ogUrlMeta = ensureTag<HTMLMetaElement>('meta[property="og:url"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    });
    ogUrlMeta.setAttribute('content', SITE_URL);

    const ogTitleMeta = ensureTag<HTMLMetaElement>('meta[property="og:title"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    });
    ogTitleMeta.setAttribute('content', 'Marlett Privé — Restaurante & Salón de Eventos');

    const ogImageMeta = ensureTag<HTMLMetaElement>('meta[property="og:image"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      return meta;
    });
    ogImageMeta.setAttribute('content', withSiteUrl('/assets/marlett_hero.png'));

    const ogDescriptionMeta = ensureTag<HTMLMetaElement>('meta[property="og:description"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      return meta;
    });
    ogDescriptionMeta.setAttribute(
      'content',
      'Agenda tu evento privado en Marlett Privé. Atención personalizada, espacios premium y experiencias memorables en Zapotlanejo, Jalisco.'
    );

    const twitterCard = ensureTag<HTMLMetaElement>('meta[name="twitter:card"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'twitter:card');
      return meta;
    });
    twitterCard.setAttribute('content', 'summary_large_image');

    const twitterImage = ensureTag<HTMLMetaElement>('meta[name="twitter:image"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'twitter:image');
      return meta;
    });
    twitterImage.setAttribute('content', withSiteUrl('/assets/marlett_hero.png'));
  }, []);

  return (
    <div className="app-shell">
      <Hero />

      <header className={`navbar ${navScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
            <img src="/marlett_clean.png" alt="Marlett" className="navbar-logo" style={{height:36,width:"auto",display:"block"}} />
          <div className="navbar-text navbar-title site-brand">
            {/* Corregido: "Privé" con acento */}
            <h1>Marlett Privé</h1>
            <p>Agenda tu evento — Restaurante &amp; Salón de eventos</p>
          </div>
          <div className="navbar-actions top-actions">
            <a href="#resForm" className="navbar-cta">Enviar solicitud</a>
          </div>
        </div>
      </header>

      <main className="page-content contenedor-principal">
        <div className="borde-hojas borde-hojas-dark" aria-hidden="true" />

        {/* NUEVAS SECCIONES — entre el hero y el formulario */}
        <EventTypes />
        <Gallery />
        <WhyMarlett />

        {/* Formulario de reservaciones */}
        <motion.section
          className="wrap"
          id="resForm"
          aria-label="Solicitud de evento"
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ paddingBottom: 'clamp(64px, 10vw, 100px)' }}
        >
          <RequestForm />
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
