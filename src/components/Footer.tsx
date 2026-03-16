import MarlettPriveLabel from './MarlettPriveLabel';

export default function Footer() {
  return (
    <footer className="footer" aria-label="Footer Marlett">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/assets/Marlett_high_contrast.jpg" alt="Marlett logo" className="footer-logo" />
            <p className="footer-copy">
              <MarlettPriveLabel /> es un espacio para celebraciones y experiencias privadas, con atención
              personalizada y detalles pensados para cada evento.
            </p>
          </div>

          <nav className="footer-links" aria-label="Enlaces de footer">
            <a href="https://maps.app.goo.gl/Ene96zWm79ng3EnU9" target="_blank" rel="noreferrer">Ubicación</a>
            <a href="https://www.marlett.mx/aviso-de-privacidad" target="_blank" rel="noreferrer">Aviso de privacidad</a>
            <a href="https://wa.me/523319006852" target="_blank" rel="noreferrer">Contactanos</a>
          </nav>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-legal">© 2026 Marlett | <MarlettPriveLabel /></p>

          <div className="footer-socials" aria-label="Redes sociales">
            <a
              href="https://www.instagram.com/marlett.mx?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Marlett"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
            </a>

            <a
              href="https://www.facebook.com/marlett.mx/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Marlett"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.5 22v-8h2.7l.5-3h-3.2V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6V11H7v3h2.8v8h3.7Z" />
              </svg>
            </a>

            <a
              href="https://wa.me/523319006852"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp Marlett"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.7 15l-1.1 4 4.1-1.1A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 6.9 12.1l-.3.5.7 2.5-2.6-.7-.4.2A8 8 0 1 1 12 4Zm-3 4.8c-.2 0-.5.1-.7.4-.3.3-.8.8-.8 2 0 1.2.8 2.3 1 2.6.1.2 1.7 2.7 4.1 3.7 1.8.8 2.4.6 2.9.5.5-.1 1.5-.7 1.7-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.7-.4l-1.2-.6c-.2-.1-.4-.1-.6.1l-.5.6c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.6-1.4-1.9-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.3.2-.4 0-.1 0-.3 0-.4l-.5-1.3c-.1-.3-.3-.4-.5-.4H9Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
