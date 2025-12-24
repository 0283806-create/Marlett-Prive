import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import { SITE_URL, withSiteUrl } from './lib/config';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from './lib/supabaseClient';
import SuccessToast from './components/SuccessToast';

const ambientes = [
  { id: 'accesibilidad', title: 'Accesibilidad', description: 'Rampas y circulación cómoda para todos.', image: '/assets/IMG_7429.jpg' },
  { id: 'detalles', title: 'Detalles', description: 'Acabados contemporáneos.', image: '/assets/IMG_7434.jpg' },
  { id: 'lounge', title: 'Lounge & Bar', description: 'Para convivios, cocteles y afters.', image: '/assets/IMG_7431.jpg' },
  { id: 'auditorio', title: 'Auditorio', description: 'Montaje tipo conferencia.', image: '/assets/IMG_7436.jpg' },
  { id: 'lobby', title: 'Lobby', description: 'Acceso elegante con iluminación cálida.', image: '/assets/IMG_7432.jpg' },
  { id: 'salon', title: 'Sala Marlett', description: 'El lugar para tus celebraciones.', image: '/assets/IMG_7436.jpg' }
];

const generateEventId = () => {
  const random = Math.floor(Math.random() * 1_000_000);
  return `evento-id${random.toString().padStart(6, '0')}`;
};

function App() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isShortNotice, setIsShortNotice] = useState(false);

  const checkIfShortNotice = (value: string | null | undefined): boolean => {
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length !== 3) return false;
    const [yearStr, monthStr, dayStr] = parts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if ([year, month, day].some((num) => Number.isNaN(num))) return false;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const eventDate = new Date(year, month - 1, day);
    const diffMs = eventDate.getTime() - todayStart.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    return diffDays >= 0 && diffDays <= 7;
  };
  const SHORT_NOTICE_NOTE = 'AVISO: Evento con menos de 7 días de anticipación.';

  useEffect(() => {
    document.title = 'Reservaciones | Marlett Privé';

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
    ogTitleMeta.setAttribute('content', 'Reservaciones | Marlett Privé');

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
      'Agenda tu evento privado en Marlett Privé y recibe atención personalizada.'
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

  useEffect(() => {
    const listeners: Array<() => void> = [];
    const addListener = (
      target: EventTarget | null,
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => {
      if (!target) return;
      target.addEventListener(type, handler, options);
      listeners.push(() => target.removeEventListener(type, handler, options));
    };


    /* Carrusel de ambientes */
    const track = document.querySelector<HTMLDivElement>('.ambientes-track');
    const slides = Array.from(document.querySelectorAll<HTMLDivElement>('.ambiente-item'));
    const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.ambientes-dots button'));
    const prevBtn = document.querySelector<HTMLButtonElement>('.amb-btn.prev');
    const nextBtn = document.querySelector<HTMLButtonElement>('.amb-btn.next');
    let current = 0;

    const goToSlide = (index: number) => {
      if (!track || !slides.length) return;
      const total = slides.length;
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === current);
      });
    };

    const handlePrev = () => goToSlide(current - 1);
    const handleNext = () => goToSlide(current + 1);

    addListener(prevBtn, 'click', handlePrev);
    addListener(nextBtn, 'click', handleNext);
    dots.forEach((dot, idx) => {
      const handler = () => goToSlide(idx);
      addListener(dot, 'click', handler);
    });

    const intervalId = slides.length ? window.setInterval(() => handleNext(), 6000) : undefined;
    goToSlide(0);

    /* Formulario */
    const formEl = document.getElementById('resForm');
    if (!(formEl instanceof HTMLFormElement)) {
      console.warn('Reservation form element not found in DOM.');
      return;
    }
    const form = formEl;
    const previewBtn = document.getElementById('previewBtn');
    const previewEl = document.getElementById('preview');
    const errorPanel = document.getElementById('formError');

    const setMinDate = () => {
      const dateInput = document.getElementById('date') as HTMLInputElement | null;
      if (!dateInput) return;
      const d = new Date();
      d.setDate(d.getDate() + 1);
      dateInput.min = d.toISOString().slice(0, 10);
    };

    const validateField = (field: HTMLInputElement | HTMLTextAreaElement) => {
      const value = field.value.trim();
      const id = field.id || field.name;
      let isValid = true;
      let message = '';

      if (id === 'name') {
        isValid = value.length >= 2;
        if (!isValid) message = 'Por favor, escribe tu nombre completo.';
      } else if (id === 'phone') {
        isValid = value.replace(/\D/g, '').length >= 8;
        if (!isValid) message = 'El teléfono debe tener al menos 8 dígitos.';
      } else if (id === 'email') {
        isValid = value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) message = 'Escribe un correo válido o deja el campo vacío.';
      } else if (id === 'date') {
        isValid = value !== '';
        if (!isValid) message = 'Selecciona una fecha para tu evento.';
      } else if (id === 'time') {
        isValid = value !== '' && (
          value === '00:00' ||
          (value >= '08:00' && value <= '23:59')
        );
        if (!isValid) message = 'La hora debe estar entre las 8:00 AM y las 12:00 AM (medianoche).';
      } else if (id === 'guests') {
        const num = Number(value);
        isValid = num >= 1 && num <= 499;
        if (!isValid) message = 'La cantidad de invitados debe estar entre 1 y 499.';
      } else if (id === 'eventType') {
        isValid = value !== '';
        if (!isValid) message = 'Selecciona el tipo de evento.';
      }

      if (!isValid) {
        setErrors(prev => ({ ...prev, [id]: message }));
        field.classList.add('error');
      } else {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        field.classList.remove('error');
      }
      field.classList.toggle('valid', isValid && value !== '');
    };

    const validateForm = () => {
      if (!form) return false;
      
      // Forzar actualización de valores de choice groups antes de validar
      document.querySelectorAll<HTMLElement>('.choice-group').forEach((group) => {
        const hidden = group.nextElementSibling as HTMLInputElement | null;
        if (!hidden || hidden.type !== 'hidden') return;
        const activeBtn = group.querySelector<HTMLButtonElement>('.choice-btn.is-active');
        if (activeBtn) {
          const value = (activeBtn.dataset.value || activeBtn.textContent || '').trim();
          if (value) hidden.value = value;
        }
      });
      
      const fd = new FormData(form);
      const newErrors: Record<string, string> = {};

      const check = (name: string, condition: boolean, message: string) => {
        if (!condition) newErrors[name] = message;
      };

      const name = (fd.get('name') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().replace(/\D/g, '');
      const guestsValue = Number(fd.get('guests'));
      
      // Obtener valores de los campos hidden directamente del DOM para asegurar que estén actualizados
      const needsAVInput = form.querySelector<HTMLInputElement>('input[name="needs_av"]');
      const mediaInterestInput = form.querySelector<HTMLInputElement>('input[name="media_interest"]');
      const needsAV = (needsAVInput?.value || fd.get('needs_av') || '').toString().trim();
      const mediaInterest = (mediaInterestInput?.value || fd.get('media_interest') || '').toString().trim();
      
      const consent = (document.getElementById('consent') as HTMLInputElement | null)?.checked;

      check('name', name.length >= 2, 'Por favor, escribe tu nombre completo.');
      check('phone', phone.length >= 8, 'El teléfono debe tener al menos 8 dígitos.');
      check('date', Boolean(fd.get('date')), 'Selecciona una fecha para tu evento.');
      
      // Validación de hora: 08:00-23:59 o 00:00 (medianoche)
      const timeValue = (fd.get('time') || '').toString().trim();
      const isValidTime = timeValue !== '' && (
        timeValue === '00:00' ||
        (timeValue >= '08:00' && timeValue <= '23:59')
      );
      check('time', isValidTime, 'La hora debe estar entre las 8:00 AM y las 12:00 AM (medianoche).');
      
      check('guests', !Number.isNaN(guestsValue) && guestsValue >= 1 && guestsValue <= 499, 'La cantidad de invitados debe estar entre 1 y 499.');
      check('eventType', Boolean(fd.get('event_type')), 'Selecciona el tipo de evento.');
      
      // Validación simplificada: solo verificar que haya un valor seleccionado (Sí, No o Tal vez)
      check('needs_av', needsAV !== '' && needsAV.length > 0, 'Selecciona si necesitas equipo audiovisual.');
      check('media_interest', mediaInterest !== '' && mediaInterest.length > 0, 'Selecciona si te interesan paquetes de foto/video.');
      check('consent', Boolean(consent), 'Debes aceptar el contacto por correo o teléfono.');

      setErrors(newErrors);

      if (!errorPanel) return Object.keys(newErrors).length === 0;
      if (Object.keys(newErrors).length) {
        errorPanel.classList.add('show');
        errorPanel.textContent = 'Revisa la información resaltada para continuar.';
      } else {
        errorPanel.classList.remove('show');
        errorPanel.textContent = '';
      }

      if (Object.keys(newErrors).length) {
        const firstKey = Object.keys(newErrors)[0];
        const target =
          (form.querySelector(`[name="${firstKey}"]`) as HTMLElement | null) ||
          (form.querySelector(`#${firstKey}`) as HTMLElement | null);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.focus?.();
        }
        return false;
      }

      return true;
    };

    const showPreview = () => {
      if (!form || !previewEl) return;
      const fd = new FormData(form);
      const esc = (value: string | null) =>
        (value ?? '—')
          .toString()
          .replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));

      previewEl.innerHTML = `
        <strong>Vista previa — Marlett</strong><br><br>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:6px 12px">
          <div>Nombre</div><div>${esc(fd.get('name')?.toString() ?? '—')}</div>
          <div>Teléfono</div><div>${esc(fd.get('phone')?.toString() ?? '—')}</div>
          <div>Correo</div><div>${esc(fd.get('email')?.toString() ?? '—')}</div>
          <div>Fecha</div><div>${esc(fd.get('date')?.toString() ?? '—')}</div>
          <div>Hora</div><div>${esc(fd.get('time')?.toString() ?? '—')}</div>
          <div>Invitados</div><div>${esc(fd.get('guests')?.toString() ?? '—')}</div>
          <div>Tipo de evento</div><div>${esc(fd.get('event_type')?.toString() ?? '—')}</div>
          <div>Área</div><div>${esc(fd.get('venue_area')?.toString() ?? '—')}</div>
          <div>A/V</div><div>${esc(fd.get('needs_av')?.toString() ?? '—')}</div>
          <div>Foto/Video</div><div>${esc(fd.get('media_interest')?.toString() ?? '—')}</div>
          <div>Notas</div><div>${esc(fd.get('notes')?.toString() ?? '—')}</div>
        </div>`;
      previewEl.style.display = 'block';
    };


    const handleSubmit = async (event: Event) => {
      event.preventDefault();

      if (!validateForm()) {
        alert('Completa los campos obligatorios y acepta el consentimiento.');
        return;
      }

      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      
      // Forzar actualización de valores de choice groups antes de crear FormData
      document.querySelectorAll<HTMLElement>('.choice-group').forEach((group) => {
        const hidden = group.nextElementSibling as HTMLInputElement | null;
        if (!hidden || hidden.type !== 'hidden') return;
        const activeBtn = group.querySelector<HTMLButtonElement>('.choice-btn.is-active');
        if (activeBtn) {
          const value = (activeBtn.dataset.value || activeBtn.textContent || '').trim();
          if (value) hidden.value = value;
        }
      });
      
      const fd = new FormData(form);

      const getValue = (key: string) => {
        // Para campos hidden de choice groups, obtener directamente del DOM para asegurar valores actualizados
        if (key === 'needs_av' || key === 'media_interest') {
          const input = form.querySelector<HTMLInputElement>(`input[name="${key}"]`);
          if (input && input.value && input.value.trim() !== '') {
            return input.value.trim();
          }
          return null;
        }
        const value = fd.get(key);
        return value !== null && value.toString().trim() !== '' ? value.toString().trim() : null;
      };

      const invitadosRaw = parseInt((fd.get('guests') || '0').toString(), 10);
      const invitados = Number.isNaN(invitadosRaw)
        ? 1
        : Math.min(Math.max(invitadosRaw, 1), 499);
      // Asegurar que needs_av y media_interest tengan valores válidos
      const needsAVValue = getValue('needs_av') || '';
      const mediaInterestValue = getValue('media_interest') || '';
      const dateValue = getValue('date');
      const isShortNoticeNow = checkIfShortNotice(dateValue);
      setIsShortNotice(isShortNoticeNow);
      const existingNotes = getValue('notes');
      const notesWithShortNotice = isShortNoticeNow
        ? existingNotes
          ? `${SHORT_NOTICE_NOTE} ${existingNotes}`
          : SHORT_NOTICE_NOTE
        : existingNotes;
      
      const eventId = generateEventId();

      const reservationData = {
        evento_id: eventId,
        nombre_completo: getValue('name') || '',
        telefono_whatsapp: getValue('phone') || '',
        correo: getValue('email') || null,
        area_preferida: getValue('venue_area') || null,
        tipo_evento: getValue('event_type') || '',
        fecha_evento: getValue('date') || new Date().toISOString().slice(0, 10),
        hora_inicio: getValue('time') || null,
        cantidad_invitados: invitados,
        needs_av: needsAVValue || null,
        media_interest: mediaInterestValue || null,
        notes: notesWithShortNotice || null,
        status: 'pending'
      };

      form.classList.add('loading');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      try {
        const { error } = await supabase.from('reservas_marlett').insert([reservationData]);

        if (error) {
          console.warn('Supabase client insert failed, attempting REST fallback', error);
          const response = await fetch(`${SUPABASE_URL}/rest/v1/reservas_marlett`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(reservationData)
          });

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `REST insert failed with status ${response.status}`);
          }
        }

        setShowSuccess(true);
        showPreview();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          if (previewEl) previewEl.style.display = 'none';
        }, 10000);

        form.reset();
        setErrors({});
        setIsShortNotice(false);
      } catch (err) {
        console.error('Error submitting form:', err);
        if (errorPanel) {
          errorPanel.classList.add('show');
          errorPanel.textContent = 'No pudimos guardar tu solicitud. Verifica tu conexión e inténtalo de nuevo.';
        }
        alert('No pudimos guardar tu solicitud. Verifica tu conexión e inténtalo de nuevo.');
        return;
      } finally {
        form.classList.remove('loading');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar solicitud';
        }
      }
    };


    const handlePreviewClick = () => showPreview();

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;
      if (target.id === 'phone') {
        target.value = target.value.replace(/[^\d+]/g, '').replace(/\s+/g, '');
      }
      if (target.id === 'date') {
        setIsShortNotice(checkIfShortNotice(target.value));
      }
      if (target.classList.contains('fld')) validateField(target);
    };

    const handleBlur = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (target && target.classList.contains('fld')) validateField(target);
    };

    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!target) return;
      if (target.id === 'date') {
        setIsShortNotice(checkIfShortNotice(target.value));
      }
      if (target.classList.contains('fld')) validateField(target);
    };

    const initChoiceGroups = () => {
      document.querySelectorAll<HTMLElement>('.choice-group').forEach((group) => {
        const hidden = group.nextElementSibling as HTMLInputElement | null;
        if (!hidden || hidden.type !== 'hidden') return;
        const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('.choice-btn'));

        const setActive = (value: string) => {
          buttons.forEach((btn) => {
            const btnValue = (btn.dataset.value || btn.textContent || '').trim();
            btn.classList.toggle('is-active', btnValue === value);
          });
        };

        const applyValue = (value: string) => {
          hidden.value = value;
          setActive(value);
        };

        if (hidden.value.trim()) {
          setActive(hidden.value.trim());
        }

        const clickHandler = (event: Event) => {
          const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('.choice-btn');
          if (!btn) return;
          const value = (btn.dataset.value || btn.textContent || '').trim();
          applyValue(value);
        };

        addListener(group, 'click', clickHandler);
      });
    };

    const cleanup: Array<() => void> = [];

    if (intervalId) {
      cleanup.push(() => window.clearInterval(intervalId));
    }

    if (form) {
      addListener(form, 'submit', handleSubmit as EventListener);
      addListener(document, 'input', handleInput as EventListener);
      addListener(document, 'change', handleChange as EventListener);
      addListener(document, 'blur', handleBlur as EventListener, true);
      addListener(previewBtn, 'click', handlePreviewClick as EventListener);

      setMinDate();
      initChoiceGroups();
      const dateInput = form.querySelector<HTMLInputElement>('#date');
      if (dateInput) {
        setIsShortNotice(checkIfShortNotice(dateInput.value));
      }
    }

    return () => {
      listeners.forEach((fn) => fn());
      cleanup.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="app-shell">
      <SuccessToast visible={showSuccess} onDismiss={() => setShowSuccess(false)} />
      <Hero />

      <header className="navbar">
        <div className="navbar-inner">
          <img src="/assets/Marlett_high_contrast.jpg" alt="Marlett Logo" className="navbar-logo" />
          <div className="navbar-text navbar-title site-brand">
            <h1>Marlett</h1>
            <p>Agenda tu evento — Restaurante &amp; Salón de eventos</p>
          </div>
          <div className="navbar-actions top-actions">
            <a href="#resForm" className="navbar-cta">Reservar mi fecha</a>
          </div>
        </div>
      </header>

      <main className="page-content contenedor-principal">
        <div className="borde-hojas borde-hojas-dark"></div>

        <section className="marlett-divider" aria-label="Frase de transición">
          <h2 className="golden-text scroll-animate">COME. COMPARTE. DISFRUTA.</h2>
        </section>

        <section className="wrap" aria-label="Ambientes Marlett">
          <div className="card pad ambientes-card">
            <section className="ambientes" aria-labelledby="ambientes-title">
              <div className="ambientes-header" id="ambientes-title">
                <h2>Conoce nuestros ambientes</h2>
                <p>Lobby, accesibilidad, sala de eventos y montaje.</p>
              </div>

              <div className="ambientes-carousel">
                <button className="amb-btn prev" aria-label="Anterior">‹</button>
                <div className="ambientes-track">
                  {ambientes.map(({ id, title, description, image }) => (
                    <article className="ambiente-item" data-id={id} key={id}>
                      <img src={image} alt={title} loading="lazy" />
                      <div className="ambiente-caption">
                        <h3>{title}</h3>
                        <p>{description}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <button className="amb-btn next" aria-label="Siguiente">›</button>
              </div>

              <div className="ambientes-dots" role="tablist" aria-label="Selecciona un ambiente">
                {ambientes.map((_, index) => (
                  <button key={index} data-slide={index} type="button" className={index === 0 ? 'active' : ''}></button>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="wrap grid grid-2" aria-label="Reservación">
          <div className="card pad reservation-card">
            <div className="marlett-panel">
              <div className="marlett-brand-banner" aria-hidden="true">
                <img
                  src="/assets/Marlett.png"
                  alt="Marlett"
                  className="marlett-brand-logo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="panel-body">
                <div className="header">
                  <div>
                    <strong>Reserva tu evento</strong><br />
                    <small>Responderemos rápido por correo o teléfono.</small>
                  </div>
                </div>

                <div className="form-top">
                  <p className="eyebrow">Coordinación personal</p>
                  <h2>Agenda tu evento en Marlett</h2>
                  <p className="sub">Te contactamos por correo o teléfono para confirmar disponibilidad.</p>
                </div>

                <form id="resForm" className="form-grid" noValidate>
                  <div id="formError" className="form-error" role="alert"></div>
                  <p className="section-title">Información de contacto</p>
                  <div className="row-span-2 section soft-panel" aria-label="Información de contacto">
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="name">Nombre completo <span className="req">*</span></label>
                        <input className="fld" id="name" name="name" type="text" placeholder="Juan Pérez" autoComplete="name" required minLength={2} />
                        {errors.name && <div className="field-error">{errors.name}</div>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="phone">Teléfono <span className="req">*</span></label>
                        <input className="fld" id="phone" name="phone" type="tel" inputMode="tel" placeholder="+52 33 1234 5678" autoComplete="tel" required />
                        <div className="hint">Teléfono de contacto.</div>
                        {errors.phone && <div className="field-error">{errors.phone}</div>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="email">Correo (opcional)</label>
                        <input className="fld" id="email" name="email" type="email" placeholder="tucorreo@ejemplo.com" autoComplete="email" />
                        {errors.email && <div className="field-error">{errors.email}</div>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="venueArea">Área preferida</label>
                        <input className="fld" id="venueArea" name="venue_area" list="areas" placeholder="Selecciona o escribe…" />
                        <datalist id="areas">
                          <option>Sala Marlett</option>
                        </datalist>
                        {errors.venue_area && <div className="field-error">{errors.venue_area}</div>}
                      </div>
                    </div>
                  </div>

                  {/* DATOS DEL EVENTO */}
                  <p className="section-title">Datos del evento</p>
                  <div
                    className="row-span-2 section soft-panel"
                    aria-label="Datos del evento"
                  >
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="date">
                          Fecha del evento <span className="req">*</span>
                        </label>
                        <input
                          className="fld"
                          id="date"
                          name="date"
                          type="date"
                          required
                        />
                        {errors.date && <div className="field-error">{errors.date}</div>}
                        {isShortNotice && (
                          <div className="short-notice-alert" role="note">
                            <p className="short-notice-alert__line">
                              <span aria-hidden="true" className="short-notice-alert__icon">⚠️</span>
                              Tu evento está dentro de los próximos 7 días.
                            </p>
                            <p className="short-notice-alert__line">
                              Por cuestiones de tiempo, la disponibilidad deberá revisarse con detalle y podría requerir confirmación especial por parte del equipo Marlett.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="form-field">
                        <label htmlFor="time">
                          Hora de inicio <span className="req">*</span>
                        </label>
                        <input
                          className="fld"
                          id="time"
                          name="time"
                          type="time"
                          min="08:00"
                          max="23:59"
                          required
                        />
                        {errors.time && <div className="field-error">{errors.time}</div>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="guests">
                          Cantidad de invitados <span className="req">*</span>
                        </label>
                        <input
                          className="fld"
                          id="guests"
                          name="guests"
                          type="number"
                          min={1}
                          max={499}
                          placeholder="Ej. 120"
                          required
                        />
                        {errors.guests && <div className="field-error">{errors.guests}</div>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="eventType">
                          Tipo de evento <span className="req">*</span>
                        </label>
                        <input
                          className="fld"
                          id="eventType"
                          name="event_type"
                          list="eventTypes"
                          placeholder="Selecciona o escribe…"
                          required
                        />
                        <datalist id="eventTypes">
                          <option>Boda</option>
                          <option>XV / Quinceañera</option>
                          <option>Cumpleaños</option>
                          <option>Corporativo</option>
                          <option>Graduación</option>
                          <option>Baby Shower</option>
                          <option>Pedida / Compromiso</option>
                          <option>Otro</option>
                        </datalist>
                        {errors.eventType && <div className="field-error">{errors.eventType}</div>}
                      </div>
                    </div>
                  </div>

                  <p className="section-title">Servicios adicionales</p>
                  <div className="row-span-2 form-group services-section">
                    <label className="form-label">¿Planean usar visuales (pantallas, proyector) o audio? <span className="req">*</span></label>
                    <div className="choice-group" data-choice="visuales" role="group" aria-label="Requerimiento A/V">
                      <button type="button" className="choice-btn" data-value="Sí">Sí</button>
                      <button type="button" className="choice-btn" data-value="No">No</button>
                      <button type="button" className="choice-btn" data-value="Tal vez">Tal vez</button>
                    </div>
                    <input type="hidden" name="needs_av" value="" required={false} />
                    {errors.needs_av && <div className="field-error">{errors.needs_av}</div>}
                  </div>

                  <div className="row-span-2 form-group services-section">
                    <label className="form-label">¿Te interesan paquetes de Foto/Video? <span className="req">*</span></label>
                    <div className="choice-group" data-choice="media" role="group" aria-label="Interés en Foto/Video">
                      <button type="button" className="choice-btn" data-value="Sí">Sí</button>
                      <button type="button" className="choice-btn" data-value="No">No</button>
                      <button type="button" className="choice-btn" data-value="Tal vez">Tal vez</button>
                    </div>
                    <input type="hidden" name="media_interest" value="" required={false} />
                    {errors.media_interest && <div className="field-error">{errors.media_interest}</div>}
                  </div>

                  <div className="row-span-2 form-group">
                    <div className="letter-block">
                      <label className="form-label" htmlFor="notes">Algo más que debamos saber (opcional)</label>
                      <textarea
                        className="fld note-text letter-textarea"
                        id="notes"
                        name="notes"
                        rows={5}
                        placeholder="Querido equipo Marlett,

Me gustaría compartir algunos detalles sobre mi evento..."
                      ></textarea>
                    </div>
                    <div className="hint" style={{ marginTop: '10px' }}>Usaremos tu información solo para dar seguimiento a tu solicitud.</div>
                    <label className="consent-label">
                      <input type="checkbox" id="consent" required />
                      Acepto ser contactad@ por correo o teléfono para confirmar mi evento <span className="req">*</span>
                    </label>
                    {errors.consent && <div className="field-error">{errors.consent}</div>}
                  </div>

                  <div className="row-span-2 actions">
                    <button type="button" className="btn btn-ghost" id="previewBtn" aria-controls="preview">Vista previa</button>
                    <button type="submit" className="btn btn-primary">Enviar solicitud</button>
                  </div>

                  <div id="preview" className="row-span-2 section soft-panel" style={{ display: 'none' }}></div>
                  <input type="text" name="_company" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0 }} />
                </form>
              </div>
            </div>
          </div>

          <aside className="sidebar-banner form-side-panel" aria-label="Ambiente Marlett">
            <div className="sidebar-image-wrap">
              <img src="/assets/ambiente-marlett-vertical.jpg" alt="Ambiente Marlett vertical" className="sidebar-image" loading="lazy" decoding="async" />
            </div>
          </aside>
        </section>

      </main>
    </div>
  );
}

export default App;

