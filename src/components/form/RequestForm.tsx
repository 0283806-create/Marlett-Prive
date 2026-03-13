import { useMemo, useRef, useState } from 'react';
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
  const [honeypot, setHoneypot] = useState('');
  const lastSubmitAtRef = useRef(0);

  const summary = useMemo(() => {
    return {
      date: form.dateFlex ? 'Por definir' : (form.date || 'Por definir'),
      guests: form.guests || 'Por definir',
      type: form.eventType || 'Por definir',
      contact: form.phone || 'Por definir'
    };
  }, [form]);

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

    if (SUPABASE_CONFIG_ERROR) {
      const configErrorId = logError('request-submit-config', new Error(SUPABASE_CONFIG_ERROR), {
        table: REQUESTS_TABLE
      });
      setSubmitError(`No pudimos guardar tu solicitud. Intenta de nuevo. ID: ${configErrorId}`);
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
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAtRef.current < SUBMIT_COOLDOWN_MS) {
      setSubmitError('Espera unos segundos antes de intentar nuevamente.');
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

              {submitError && <div className="form-error show">{submitError}</div>}
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Datos principales
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
              {import.meta.env.DEV && submitErrorDev && <small className="field-error">{submitErrorDev}</small>}
            </div>
          )}
        </form>
      </div>

      <aside className="request-right">
        <div className="summary-card summary-card-desktop">
          <h3>Resumen</h3>
          <div className="summary-row"><span>Fecha</span><strong>{summary.date}</strong></div>
          <div className="summary-row"><span>Invitados</span><strong>{summary.guests}</strong></div>
          <div className="summary-row"><span>Tipo</span><strong>{summary.type}</strong></div>
          <div className="summary-row"><span>Contacto</span><strong>{summary.contact}</strong></div>
          <small className="summary-note">Usaremos tu información solo para dar seguimiento.</small>
        </div>
      </aside>
    </div>
  );
}
