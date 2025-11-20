import RandomPhrase from "./RandomPhrase";
import marlettHero from "../assets/marlett_hero.png";
import salonImage from "/assets/IMG_7431.jpg";

const heroStyles = `
.hero-section {
  padding: clamp(48px, 10vw, 96px) 24px;
  display: flex;
  justify-content: center;
}

.hero-card {
  width: min(1100px, 100%);
  background: rgba(18, 24, 20, 0.92);
  border-radius: 28px;
  border: 1px solid rgba(214, 200, 155, 0.14);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.hero-card-banner img {
  width: 100%;
  height: clamp(160px, 25vw, 220px);
  object-fit: cover;
  display: block;
}

.hero-card-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: clamp(24px, 6vw, 48px);
}

.hero-card-media {
  order: 1;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(10, 15, 12, 0.85);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.hero-card-media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.hero-card-text {
  order: 2;
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
  background: rgba(47, 143, 94, 0.14);
  color: #d6c89b;
  border: 1px solid rgba(214, 200, 155, 0.28);
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

.hero-card-copy .hero-paragraph {
  margin: 0;
  color: rgba(241, 244, 239, 0.86);
  font-size: clamp(15px, 1.25vw, 18px);
  line-height: 1.7;
}

.hero-card-copy .hero-mantra {
  margin: 0;
  color: rgba(214, 200, 155, 0.92);
  font-style: italic;
  font-size: clamp(15px, 1.2vw, 18px);
}

.hero-card-copy .hero-cta-line {
  margin: 0;
  color: rgba(192, 226, 205, 0.85);
  font-size: clamp(15px, 1.25vw, 18px);
  font-weight: 600;
}

@media (min-width: 980px) {
  .hero-card-content {
    flex-direction: row;
    align-items: stretch;
    gap: 36px;
  }

  .hero-card-text {
    order: 1;
    flex: 1 1 55%;
  }

  .hero-card-media {
    order: 2;
    flex: 1 1 45%;
  }

  .hero-card-media img {
    min-height: 100%;
  }
}

@media (max-width: 720px) {
  .hero-section {
    padding: 40px 18px 56px;
  }

  .hero-card {
    border-radius: 24px;
  }

  .hero-card-content {
    padding: 24px 20px 32px;
  }
}
`;

export default function Hero() {
  return (
    <section className="hero-section" aria-label="Portada Marlett">
      <style>{heroStyles}</style>
      <div className="hero-card">
        <div className="hero-card-banner">
          <img
            src={marlettHero}
            alt="Fachada superior de Marlett Restaurante"
            loading="lazy"
          />
        </div>
        <div className="hero-card-content">
          <figure className="hero-card-media">
            <img
              src={salonImage}
              alt="Interior del salón principal de Marlett"
              loading="lazy"
            />
          </figure>
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
      </div>
    </section>
  );
}

