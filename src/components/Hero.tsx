import heroImage from "../assets/fachada-marlett.jpeg";

export default function Hero() {
  return (
    <section className="hero-section" aria-label="Portada Marlett">
      <div className="hero-heroWrapper">
        <div className="hero-imageWrapper">
          <img
            src={heroImage}
            alt="Fachada de Marlett Restaurante & Salón de eventos"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="hero-card">
          <span className="hero-cardBadge">Eventos especiales</span>
          <h1 className="hero-cardTitle">Marlett — Altos de Jalisco</h1>
          <p className="hero-cardSubtitle">
            Restaurante &amp; Salón de eventos • Zapotlanejo / Guadalajara
          </p>

          <div className="hero-cardCopy">
            <p className="hero-paragraph">
              En Marlett, no solo celebramos eventos: celebramos historias que merecen ser recordadas.
            </p>
            <p className="hero-paragraph">
              Es tu casa para celebrar tus logros, compartir con quienes más importan y ser el escenario donde nacen ideas que dejan huella. Luz cuidada, diseño moderno y detalles pensados para invitarte a quedarte.
            </p>
            <p className="hero-mantra">
              "La conexión multiplica la alegría como el conocimiento multiplica la sabiduría."
            </p>
            <p className="hero-ctaLine">
              Agenda tu experiencia y deja que la inspiración te encuentre aquí.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
