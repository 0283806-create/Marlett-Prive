import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logError, maskPhone } from '../../lib/logger';
import { SUPABASE_CONFIG_ERROR, supabase } from '../../lib/supabaseClient';
import { formatPhoneInput, normalizeMxToE164, validateMainStep } from '../../lib/validation';

type Step = 1 | 2;

type FormState = {
  fullName: string;
  phone: string;
  date: string;
  dateFlex: boolean;
  guests: string;
  eventType: string;
  startTime: string;
  visualsAudio: string;
  photoVideo: string;
  notes: string;
};

type RequestInsertPayload = {
  nombre_completo: string;
  telefono_whatsapp: string;
  correo: string | null;
  area_preferida: string | null;
  tipo_evento: string;
  fecha_evento: string;
  hora_inicio: string | null;
  cantidad_invitados: number;
  needs_av: string | null;
  media_interest: string | null;
  notes: string | null;
  status: 'pending';
};

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  date: '',
  dateFlex: false,
  guests: '',
  eventType: '',
  startTime: '',
  visualsAudio: '',
  photoVideo: '',
  notes: ''
};

const REQUESTS_TABLE = 'reservas_marlett';
const SUBMIT_TIMEOUT_MS = 12_000;
const SUBMIT_COOLDOWN_MS = 10_000;

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Error desconocido al insertar en Supabase.';
};

export default function RequestForm() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitErrorDev, setSubmitErrorDev] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const lastSubmitAtRef = useRef(0);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = (): boolean => {
    const nextErrors = validateMainStep({
      fullName: form.fullName,
      phone: form.phone,
      date: form.date,
      dateFlex: form.dateFlex,
      guests: form.guests
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onBlurField = (name: keyof FormState) => {
    const nextErrors = validateMainStep({
      fullName: form.fullName,
      phone: form.phone,
      date: form.date,
      dateFlex: form.dateFlex,
      guests: form.guests
    });

    if (name in nextErrors) {
      setErrors((prev) => ({ ...prev, [name]: nextErrors[name] }));
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const goToStep2 = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError('');
    setSubmitErrorDev('');
    setShowError(false);

    if (SUPABASE_CONFIG_ERROR) {
      const configErrorId = logError('request-submit-config', new Error(SUPABASE_CONFIG_ERROR), {
        table: REQUESTS_TABLE
      });
      setSubmitError(`No pudimos guardar tu solicitud. Intenta de nuevo. ID: ${configErrorId}`);
      setShowError(true);
      if (import.meta.env.DEV) {
        setSubmitErrorDev(SUPABASE_CONFIG_ERROR);
      }
      return;
    }

    if (honeypot.trim()) {
      const spamErrorId = logError('request-submit-honeypot', new Error('Honeypot triggered'), {
        table: REQUESTS_TABLE
      });
      setSubmitError(`No pudimos guardar tu solicitud. Intenta de nuevo. ID: ${spamErrorId}`);
      setShowError(true);
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAtRef.current < SUBMIT_COOLDOWN_MS) {
      setSubmitError('Espera unos segundos antes de intentar nuevamente.');
      setShowError(true);
      return;
    }

    if (!validateStep1()) {
      setStep(1);
      return;
    }

    lastSubmitAtRef.current = now;
    setIsSubmitting(true);

    let payloadForLog: Record<string, unknown> = {};
    try {
      const normalizedPhone = normalizeMxToE164(form.phone) || form.phone.trim();
      const fallbackDate = form.date || new Date().toISOString().slice(0, 10);
      const guestsValue = form.guests ? Number(form.guests) : 1;
      const safeGuests = Number.isFinite(guestsValue) && guestsValue >= 1 ? guestsValue : 1;
      const safeEventType = form.eventType?.trim() || 'Por definir';
      const notesValue = form.notes.trim();
      const notesWithFlex = form.dateFlex
        ? [notesValue, 'Fecha flexible: cliente sin fecha exacta.'].filter(Boolean).join(' | ')
        : notesValue;

      const payload: RequestInsertPayload = {
        nombre_completo: form.fullName.trim(),
        telefono_whatsapp: normalizedPhone,
        correo: null,
        area_preferida: null,
        tipo_evento: safeEventType,
        fecha_evento: fallbackDate,
        hora_inicio: form.startTime || null,
        cantidad_invitados: safeGuests,
        needs_av: form.visualsAudio || null,
        media_interest: form.photoVideo || null,
        notes: notesWithFlex || null,
        status: 'pending'
      };
      payloadForLog = {
        ...payload,
        telefono_whatsapp: maskPhone(payload.telefono_whatsapp)
      };
      console.log('[payload]', payloadForLog);

      const abortController = new AbortController();
      const timeoutId = window.setTimeout(() => abortController.abort(), SUBMIT_TIMEOUT_MS);
      const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .insert(payload)
        .select()
        .abortSignal(abortController.signal);
      window.clearTimeout(timeoutId);

      if (error) {
        console.error('[supabase insert error]', error);
      } else {
        console.log('[supabase insert ok]', {
          table: REQUESTS_TABLE,
          rows: Array.isArray(data) ? data.length : 0
        });
      }
      if (error) throw error;
      setForm(INITIAL_FORM);
      setStep(1);
      setErrors({});
      setHoneypot('');
      setSubmitError('');
      setSubmitErrorDev('');
      setShowSuccessModal(true);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const errorId = logError('request-submit', error, {
        table: REQUESTS_TABLE,
        code: error && typeof error === 'object' && 'code' in error ? (error as { code?: unknown }).code : null,
        status: error && typeof error === 'object' && 'status' in error ? (error as { status?: unknown }).status : null,
        payload: payloadForLog
      });

      if (import.meta.env.DEV) {
        setSubmitError('No pudimos guardar tu solicitud. Intenta de nuevo.');
      } else {
        setSubmitError(`No pudimos guardar tu solicitud. Intenta de nuevo. ID: ${errorId}`);
      }
      setShowError(true);

      if (import.meta.env.DEV) {
        setSubmitErrorDev(`${errorMessage} (ID: ${errorId})`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-layout">
      <div className="request-left">
        <form className="request-form-shell" onSubmit={onSubmit} noValidate>
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
          >
            <label htmlFor="company_website">Website</label>
            <input
              id="company_website"
              name="company_website"
              type="text"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <p className="request-kicker">Solicitud guiada</p>
          <h2 className="request-title">Solicitud de disponibilidad</h2>
          <p className="request-subtitle">Te contactamos para confirmar disponibilidad y compartirte una propuesta.</p>

          <div className="form-steps" aria-label="Pasos del formulario">
            <button
              type="button"
              className={`form-step ${step === 1 ? 'is-active' : ''}`}
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Datos principales
            </button>
            <button
              type="button"
              className={`form-step ${step === 2 ? 'is-active' : ''}`}
              onClick={() => setStep(2)}
              disabled={isSubmitting}
            >
              Detalles opcionales
            </button>
          </div>

          {step === 1 && (
            <div className="request-block">
              <label className="form-field">
                <span>Nombre completo *</span>
                <input className="fld" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} onBlur={() => onBlurField('fullName')} />
                {errors.fullName && <small className="field-error">{errors.fullName}</small>}
              </label>

              <label className="form-field">
                <span>WhatsApp / Teléfono *</span>
                <input className="fld" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setField('phone', formatPhoneInput(e.target.value))} onBlur={() => onBlurField('phone')} placeholder="+52 33 1234 5678" />
                <small className="hint">WhatsApp recomendado. Acepta 10 dígitos o +52.</small>
                {errors.phone && <small className="field-error">{errors.phone}</small>}
              </label>

              <label className="form-field">
                <span>Fecha tentativa *</span>
                <input className="fld" type="date" value={form.date} disabled={form.dateFlex} onChange={(e) => setField('date', e.target.value)} onBlur={() => onBlurField('date')} />
                <label className="consent-label date-flex-toggle">
                  <input type="checkbox" checked={form.dateFlex} onChange={(e) => setField('dateFlex', e.target.checked)} />
                  Aun no tengo fecha exacta
                </label>
                {errors.date && <small className="field-error">{errors.date}</small>}
              </label>

              <label className="form-field">
                <span>Invitados</span>
                <div className="guest-chips">
                  {['50', '80', '120', '200'].map((value) => (
                    <button key={value} type="button" className={`guest-chip ${form.guests === value ? 'is-active' : ''}`} onClick={() => setField('guests', value)}>{value}</button>
                  ))}
                  <button type="button" className={`guest-chip ${!['50', '80', '120', '200'].includes(form.guests) && form.guests ? 'is-active' : ''}`} onClick={() => setField('guests', '')}>Otro</button>
                </div>
                <input className="fld" value={form.guests} onChange={(e) => setField('guests', e.target.value.replace(/[^\d]/g, ''))} placeholder="Por definir" />
              </label>

              <label className="form-field">
                <span>Tipo</span>
                <div className="guest-chips">
                  {['Boda', 'XV', 'Empresarial', 'Cumple', 'Otro'].map((value) => (
                    <button key={value} type="button" className={`guest-chip ${form.eventType === value ? 'is-active' : ''}`} onClick={() => setField('eventType', value)}>{value}</button>
                  ))}
                </div>
              </label>

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={goToStep2}
                  disabled={isSubmitting}
                >
                  Agregar detalles (opcional)
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="request-block">
              <label className="form-field">
                <span>Hora (opcional)</span>
                <input className="fld" type="time" value={form.startTime} onChange={(e) => setField('startTime', e.target.value)} />
              </label>

              <label className="form-field">
                <span>Visuales / Audio (opcional)</span>
                <div className="choice-group">
                  {['Sí', 'No', 'Tal vez'].map((value) => (
                    <button key={value} type="button" className={`choice-btn ${form.visualsAudio === value ? 'is-active' : ''}`} onClick={() => setField('visualsAudio', value)}>{value}</button>
                  ))}
                </div>
              </label>

              <label className="form-field">
                <span>Foto / Video (opcional)</span>
                <div className="choice-group">
                  {['Sí', 'No', 'Tal vez'].map((value) => (
                    <button key={value} type="button" className={`choice-btn ${form.photoVideo === value ? 'is-active' : ''}`} onClick={() => setField('photoVideo', value)}>{value}</button>
                  ))}
                </div>
              </label>

              <label className="form-field">
                <span>Notas (opcional)</span>
                <textarea className="fld note-text" rows={4} value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
              </label>

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Datos principales
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
              {import.meta.env.DEV && submitErrorDev && <small className="field-error">{submitErrorDev}</small>}
            </div>
          )}
        </form>
      </div>

      <aside className="request-right" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
        <div style={{ position: 'relative', width: '100%', height: '90vh' }}>
          <img src="/ticketreservacion.svg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
          <svg viewBox="0 0 810 1012.5" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <text x="420" y="463" fontFamily="'Playfair Display', Georgia, serif" fontSize="26" fontWeight="400" fontStyle="italic" fill="#1a1a1a" opacity="0.85" textAnchor="middle" dominantBaseline="auto" letterSpacing="1.5">{form.dateFlex ? 'Por definir' : (form.date || 'Por definir')}</text>
            <text x="420" y="532" fontFamily="'Playfair Display', Georgia, serif" fontSize="26" fontWeight="400" fontStyle="italic" fill="#1a1a1a" opacity="0.85" textAnchor="middle" dominantBaseline="auto" letterSpacing="1.5">{form.guests || 'Por definir'}</text>
            <text x="390" y="600" fontFamily="'Playfair Display', Georgia, serif" fontSize="26" fontWeight="400" fontStyle="italic" fill="#1a1a1a" opacity="0.85" textAnchor="middle" dominantBaseline="auto" letterSpacing="1.5">{form.eventType || 'Por definir'}</text>
            <text x="420" y="678" fontFamily="'Playfair Display', Georgia, serif" fontSize="26" fontWeight="400" fontStyle="italic" fill="#1a1a1a" opacity="0.85" textAnchor="middle" dominantBaseline="auto" letterSpacing="1.5">{form.phone || 'Por definir'}</text>
          </svg>
        </div>
      </aside>

      {/* Modal éxito */}
      {createPortal(
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(6, 10, 8, 0.88)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
              onClick={() => {
                setShowSuccessModal(false);
                setForm(INITIAL_FORM);
                setStep(1);
                setErrors({});
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="success-modal-title"
                style={{
                  background: 'linear-gradient(180deg, #121814 0%, #0e1210 100%)',
                  border: '1px solid rgba(201, 168, 76, 0.35)',
                  borderRadius: 28,
                  padding: '56px 48px',
                  maxWidth: 480,
                  width: '90%',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(47, 143, 94, 0.15)',
                    border: '2px solid rgba(47, 143, 94, 0.4)',
                    fontSize: 32,
                    color: '#2f8f5e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                  }}
                >
                  ✓
                </div>
                <h2
                  id="success-modal-title"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#c9a84c',
                    fontSize: '2rem',
                    marginTop: 24,
                    marginBottom: 0,
                  }}
                >
                  ¡Solicitud recibida!
                </h2>
                <p
                  style={{
                    color: 'rgba(241, 245, 240, 0.8)',
                    fontSize: '1rem',
                    marginTop: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Nos pondremos en contacto contigo pronto para confirmar disponibilidad y compartirte una propuesta.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setForm(INITIAL_FORM);
                    setStep(1);
                    setErrors({});
                  }}
                  style={{
                    background: 'linear-gradient(180deg, #3ca671 0%, #2f8f5e 100%)',
                    color: '#fff',
                    borderRadius: 9999,
                    padding: '12px 36px',
                    fontWeight: 600,
                    marginTop: 32,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Banner error fijo abajo */}
      {createPortal(
        <AnimatePresence>
          {showError && submitError && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(30, 10, 10, 0.95)',
                border: '1px solid rgba(220, 80, 80, 0.5)',
                borderRadius: 14,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                maxWidth: 'calc(100vw - 48px)',
                zIndex: 10000,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              role="alert"
            >
              <span style={{ color: '#f87171', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                ⚠ No pudimos enviar tu solicitud. Intenta de nuevo o contáctanos por WhatsApp.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowError(false);
                  setSubmitError('');
                }}
                aria-label="Cerrar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '0 4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
