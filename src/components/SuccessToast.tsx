import { useEffect } from 'react';

type SuccessToastProps = {
  visible: boolean;
  onDismiss: () => void;
};

const SuccessToast: React.FC<SuccessToastProps> = ({ visible, onDismiss }) => {
  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(id);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="success-toast-overlay" onClick={onDismiss}>
      <div
        className="success-toast-card"
        onClick={(event) => event.stopPropagation()}
        role="status"
        aria-live="polite"
      >
        <div className="success-toast-icon">✓</div>
        <h2 className="success-toast-title">Solicitud enviada</h2>
        <p className="success-toast-text">
          Gracias por compartir los detalles de tu evento.
          Nuestro equipo de Marlett se pondrá en contacto contigo muy pronto
          para confirmar disponibilidad y resolver cualquier duda.
        </p>
        <button
          type="button"
          className="success-toast-button"
          onClick={onDismiss}
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default SuccessToast;
