import RandomPhrase from "./RandomPhrase";

const heroStyles = `
.hero-wrapper {
  background: #050907;
}

/* Banda con la imagen frontal */
.hero-banner {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
}

.hero-banner img {
  width: 100%;
  max-height: 460px;
  object-fit: cover;
  display: block;
}

/* Tarjeta que se sobrepone a la imagen */
.hero-card {
  position: relative;
  width: min(1100px, 100% - 32px);
  margin: -80px auto 72px;
  background: rgba(11, 17, 13, 0.96);
  border-radius: 28px;
  border: 1px solid rgba(214, 200, 155, 0.18);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  padding: clamp(28px, 5vw, 40px);
  backdrop-filter: blur(14px);
  z-index: 10;
}

/* Contenido de la tarjeta */
.hero-card-text {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-card-badge {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(47, 143, 94, 0.16);
  color: #d6c89b;
  border: 1px solid rgba(214, 200, 155, 0.4);
}

.hero-card-title {
  margin: 0;
  font-size: clamp(32px, 4.2vw, 46px);
  line-height: 1.08;
  font-family: "Playfair Display", serif;
  color: #f7f4eb;
}

.hero-card-subtitle {
  margin: 0;
  color: rgba(247, 244, 235, 0.88);
  font-size: clamp(16px, 1.35vw, 19px);
  font-weight: 500;
}

.hero-card-copy {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-card-random p {
  margin: 0;
  color: rgba(214, 200, 155, 0.92);
  font-size: clamp(17px, 1.5vw, 20px);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.hero-paragraph {
  margin: 0;
  color: rgba(241, 244, 239, 0.86);
  font-size: clamp(15px, 1.25vw, 18px);
  line-height: 1.7;
}

.hero-mantra {
  margin: 0;
  color: rgba(214, 200, 155, 0.92);
  font-style: italic;
  font-size: clamp(15px, 1.2vw, 18px);
}

.hero-cta-line {
  margin: 0;
  color: rgba(192, 226, 205, 0.85);
  font-size: clamp(15px, 1.25vw, 18px);
  font-weight: 600;
}

/* Ajustes responsive */
@media (max-width: 900px) {
  .hero-card {
    margin: -56px auto 56px;
    border-radius: 24px;
  }
}

@media (max-width: 640px) {
  .hero-banner img {
    max-height: 360px;
  }

  .hero-card {
    width: calc(100% - 24px);
    padding: 22px 18px 26px;
  }
}
`;

export default function Hero() {
  return (
    <section className="hero-wrapper" aria-label="Portada Marlett">
      <style>{heroStyles}</style>
      {/* Imagen frontal completa */}
      <div className="hero-banner">
        <img
          src="/assets/PHOTO-2025-07-09-20-40-28.jpeg"
          alt="Fachada de Marlett Restaurante & Salón de eventos"
          loading="lazy"
          decoding="async"
        />
      </div>
      {/* Tarjeta de contenido sobrepuesta, sin foto a la derecha */}
      <div className="hero-card">
        <div className="hero-card-text">
          <span className="hero-card-badge">Eventos especiales</span>
          <h1 className="hero-card-title">Marlett — Altos de Jalisco</h1>
          <p className="hero-card-subtitle">
            Restaurante & Salón de eventos • Zapotlanejo / Guadalajara
          </p>
          <div className="hero-card-copy">
            <div className="hero-card-random">
              <RandomPhrase />
            </div>
            <p className="hero-paragraph">
              En Marlett, los momentos se vuelven memorias: de esas que se cuentan, se comparten y se atesoran en familia.
            </p>
            <p className="hero-paragraph">
              Es tu casa para celebrar tus logros, compartir con quienes más importan y ser el escenario donde nacen ideas que dejan huella. Luz cuidada, diseño moderno y detalles pensados para invitarte a quedarte.
            </p>
            <p className="hero-mantra">
              "La conexión multiplica la alegría como el conocimiento multiplica la sabiduría."
            </p>
            <p className="hero-cta-line">
              Agenda tu experiencia y deja que la inspiración te encuentre aquí.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
