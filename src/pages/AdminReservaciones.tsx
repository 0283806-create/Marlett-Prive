import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const TABLE = 'reservas_marlett';
const NOTIFY_FN_PATH = '/functions/v1/notify-reservation';
const BG = '#1a1a1a';
const GOLD = '#C8A96E';
const BORDER = '#333';
const CARD_BG = '#2a2a2a';
const CARD_HOVER = '#303030';
const GREEN_SUMMARY = '#4CAF50';
const RED_SUMMARY = '#e57373';

type FilterKey = 'todas' | 'pendientes' | 'confirmadas' | 'canceladas';

type ReservationRow = {
  id: string;
  nombre_completo: string | null;
  tipo_evento: string | null;
  fecha_evento: string | null;
  hora_inicio: string | null;
  cantidad_invitados: number | null;
  area_preferida: string | null;
  status: string | null;
  correo: string | null;
  telefono_whatsapp: string | null;
  needs_av: string | null;
  media_interest: string | null;
  av_items: unknown;
  av_notes: string | null;
  media_notes: string | null;
  notes: string | null;
  evento_id: string | null;
  created_at: string | null;
  es_urgente: boolean | null;
};

function normalizeStatus(status: string | null): string {
  return (status ?? '').toLowerCase().trim();
}

function isPendiente(status: string | null): boolean {
  const s = normalizeStatus(status);
  return s === 'pendiente' || s === 'pending';
}

function isConfirmada(status: string | null): boolean {
  const s = normalizeStatus(status);
  return s === 'confirmada' || s === 'confirmed';
}

function isCancelada(status: string | null): boolean {
  const s = normalizeStatus(status);
  return s === 'cancelada' || s === 'cancelled' || s === 'canceled';
}

function statusBadgeStyle(status: string | null): CSSProperties {
  if (isConfirmada(status)) {
    return {
      background: 'rgba(76, 175, 80, 0.2)',
      color: GREEN_SUMMARY,
      border: `1px solid ${BORDER}`
    };
  }
  if (isCancelada(status)) {
    return {
      background: 'rgba(229, 115, 115, 0.15)',
      color: RED_SUMMARY,
      border: `1px solid ${BORDER}`
    };
  }
  if (isPendiente(status)) {
    return {
      background: 'rgba(200, 169, 110, 0.2)',
      color: GOLD,
      border: `1px solid ${BORDER}`
    };
  }
  return {
    background: 'rgba(255,255,255,0.06)',
    color: '#ccc',
    border: `1px solid ${BORDER}`
  };
}

function statusLabel(status: string | null): string {
  if (isPendiente(status)) return 'pendiente';
  if (isConfirmada(status)) return 'confirmada';
  if (isCancelada(status)) return 'cancelada';
  return normalizeStatus(status) || '—';
}

function statusLeftBorder(status: string | null): string {
  if (isConfirmada(status)) return GREEN_SUMMARY;
  if (isCancelada(status)) return RED_SUMMARY;
  if (isPendiente(status)) return GOLD;
  return '#666';
}

function hasText(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function parseAvItems(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

function formatFechaEvento(dateStr: string | null): string {
  if (!hasText(dateStr)) return '—';
  const raw = dateStr.trim();
  const d = new Date(raw.includes('T') ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function formatHoraInicio(t: string | null): string | null {
  if (!hasText(t)) return null;
  const parts = t.trim().split(':');
  const h = Number.parseInt(parts[0] ?? '', 10);
  const m = Number.parseInt(parts[1] ?? '0', 10);
  if (!Number.isFinite(h)) return t.trim();
  const d = new Date();
  d.setHours(h, Number.isFinite(m) ? m : 0, 0, 0);
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
}

function formatCreatedAt(iso: string | null): string | null {
  if (!hasText(iso)) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

function whatsappDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

function filterRows(rows: ReservationRow[], key: FilterKey): ReservationRow[] {
  if (key === 'todas') return rows;
  if (key === 'pendientes') return rows.filter((r) => isPendiente(r.status));
  if (key === 'confirmadas') return rows.filter((r) => isConfirmada(r.status));
  return rows.filter((r) => isCancelada(r.status));
}

function SectionDivider() {
  return <div style={{ height: 1, background: BORDER, margin: '14px 0' }} />;
}

export default function AdminReservaciones() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authPending, setAuthPending] = useState(true);
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [narrow, setNarrow] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        const {
          data: { session: s }
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!s) {
          window.location.href = '/login';
          return;
        }
        const {
          data: { user: u },
          error: userErr
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userErr || !u || u.app_metadata?.role !== 'admin') {
          window.location.href = '/login';
          return;
        }
        if (cancelled) return;
        setSession(s);
        setAuthPending(false);
      } catch {
        if (!cancelled) {
          window.location.href = '/login';
        }
      }
    };
    void verify();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    const { data, error: qErr } = await supabase
      .from(TABLE)
      .select('*')
      .order('es_urgente', { ascending: false })
      .order('created_at', { ascending: false });
    setLoading(false);
    if (qErr) {
      setError(qErr.message || 'No se pudieron cargar las reservaciones.');
      setRows([]);
      return;
    }
    setRows((data as ReservationRow[]) ?? []);
  }, []);

  useEffect(() => {
    if (session === null) return;
    void load();
  }, [session, load]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  async function onSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    setError('');
    const { error: uErr } = await supabase.from(TABLE).update({ status }).eq('id', id);
    setBusyId(null);
    if (uErr) {
      setError(uErr.message || 'No se pudo actualizar el estado.');
      return;
    }
    await load();
  }

  async function handleTestNotification() {
    setTestingNotification(true);
    setTestResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      if (!supabaseUrl || !supabaseKey) {
        setTestResult({ ok: false, message: '✗ VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas.' });
        return;
      }

      const fechaEvento = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const testPayload = {
        type: 'INSERT',
        table: 'reservas_marlett',
        record: {
          id: crypto.randomUUID(),
          nombre_completo: 'Cliente de Prueba',
          telefono_whatsapp: '+523300000000',
          correo: 'test@marlettprive.mx',
          tipo_evento: 'Boda (PRUEBA)',
          fecha_evento: fechaEvento,
          hora_inicio: null,
          cantidad_invitados: 100,
          area_preferida: null,
          needs_av: null,
          media_interest: null,
          notes: 'Este es un email de prueba del sistema de notificaciones.',
          es_urgente: true,
          created_at: new Date().toISOString(),
        },
        old_record: null,
      };

      const response = await fetch(`${supabaseUrl}${NOTIFY_FN_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(testPayload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        resend_id?: string;
      };

      if (response.ok && data.success) {
        setTestResult({
          ok: true,
          message: `✓ Email de prueba enviado. Revisa miguel.donpule@gmail.com (resend_id: ${data.resend_id ?? '—'})`,
        });
      } else {
        setTestResult({ ok: false, message: `✗ Error: ${data.error || `HTTP ${response.status}`}` });
      }
    } catch (e) {
      setTestResult({
        ok: false,
        message: `✗ Error de red: ${e instanceof Error ? e.message : 'desconocido'}`,
      });
    } finally {
      setTestingNotification(false);
      window.setTimeout(() => setTestResult(null), 8000);
    }
  }

  const counts = useMemo(() => {
    const pendientes = rows.filter((r) => isPendiente(r.status)).length;
    const confirmadas = rows.filter((r) => isConfirmada(r.status)).length;
    const canceladas = rows.filter((r) => isCancelada(r.status)).length;
    return { total: rows.length, pendientes, confirmadas, canceladas };
  }, [rows]);

  const filtered = useMemo(() => filterRows(rows, filter), [rows, filter]);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (authPending || session === null) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: BG,
          color: GOLD,
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontSize: '16px'
        }}
      >
        Verificando acceso...
      </div>
    );
  }

  const filterBtn = (key: FilterKey, label: string) => {
    const active = filter === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setFilter(key)}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: `1px solid ${GOLD}`,
          background: active ? GOLD : 'transparent',
          color: active ? '#1a1a1a' : GOLD,
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer'
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: '#fff',
        fontFamily: "'Manrope', system-ui, sans-serif"
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '1.1rem clamp(0.75rem, 3vw, 2rem)',
          borderBottom: `1px solid ${BORDER}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <img src="/marlett_clean.png" alt="Marlett" style={{ height: 36, width: 'auto', display: 'block' }} />
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 600,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.45rem)',
              color: GOLD
            }}
          >
            Panel de Reservaciones
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            background: 'transparent',
            color: GOLD,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <main
        style={{
          padding: 'clamp(0.85rem, 2.5vw, 1.5rem) clamp(0.75rem, 3vw, 2rem) 2.5rem',
          maxWidth: 800,
          margin: '0 auto'
        }}
      >
        {error ? (
          <p
            role="alert"
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              background: 'rgba(180, 60, 60, 0.15)',
              border: `1px solid ${BORDER}`,
              color: '#f5b4b4',
              marginBottom: '1rem'
            }}
          >
            {error}
          </p>
        ) : null}

        {loading ? (
          <p style={{ color: GOLD, margin: 0 }}>Cargando…</p>
        ) : (
          <>
            <div
              style={{
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={() => void handleTestNotification()}
                disabled={testingNotification}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.5)',
                  borderRadius: 8,
                  color: '#c9a84c',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  cursor: testingNotification ? 'wait' : 'pointer',
                  opacity: testingNotification ? 0.6 : 1,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {testingNotification ? 'Enviando…' : '◆ Probar notificación'}
              </button>
              {testResult ? (
                <span
                  role="status"
                  style={{
                    fontSize: 13,
                    fontFamily: "'Manrope', sans-serif",
                    color: testResult.ok ? '#3ca671' : '#f87171',
                    lineHeight: 1.4
                  }}
                >
                  {testResult.message}
                </span>
              ) : null}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: narrow ? 12 : 12,
                marginBottom: 20,
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: narrow ? '1.4rem' : '1.75rem', fontWeight: 700, color: '#fff' }}>{counts.total}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4, lineHeight: 1.3 }}>Total de reservaciones</div>
              </div>
              <div>
                <div style={{ fontSize: narrow ? '1.4rem' : '1.75rem', fontWeight: 700, color: GOLD }}>{counts.pendientes}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>Pendientes</div>
              </div>
              <div>
                <div style={{ fontSize: narrow ? '1.4rem' : '1.75rem', fontWeight: 700, color: GREEN_SUMMARY }}>{counts.confirmadas}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>Confirmadas</div>
              </div>
              <div>
                <div style={{ fontSize: narrow ? '1.4rem' : '1.75rem', fontWeight: 700, color: RED_SUMMARY }}>{counts.canceladas}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>Canceladas</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 24,
                justifyContent: narrow ? 'stretch' : 'flex-start'
              }}
            >
              {filterBtn('todas', 'Todas')}
              {filterBtn('pendientes', 'Pendientes')}
              {filterBtn('confirmadas', 'Confirmadas')}
              {filterBtn('canceladas', 'Canceladas')}
            </div>

            {filtered.length === 0 ? (
              <p style={{ color: '#888', margin: 0 }}>No hay reservaciones con este filtro.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filtered.map((r) => {
                  const expanded = expandedIds.has(r.id);
                  const horaFmt = formatHoraInicio(r.hora_inicio);
                  const fechaFmt = formatFechaEvento(r.fecha_evento);
                  const avItems = parseAvItems(r.av_items);
                  const wa = hasText(r.telefono_whatsapp) ? whatsappDigits(r.telefono_whatsapp) : '';
                  const showContacto =
                    hasText(r.correo) || (hasText(r.telefono_whatsapp) && wa.length > 0);
                  const showServicios =
                    hasText(r.needs_av) ||
                    hasText(r.media_interest) ||
                    avItems.length > 0 ||
                    hasText(r.av_notes) ||
                    hasText(r.media_notes);
                  const showNotas = hasText(r.notes);
                  const createdFmt = formatCreatedAt(r.created_at);
                  const showMeta = hasText(r.evento_id) || createdFmt !== null;

                  return (
                    <div
                      key={r.id}
                      style={{
                        background: CARD_BG,
                        borderLeft: `4px solid ${statusLeftBorder(r.status)}`,
                        borderRadius: 8,
                        padding: narrow ? 16 : 20,
                        border: `1px solid ${BORDER}`,
                        borderLeftWidth: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = CARD_HOVER;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = CARD_BG;
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: narrow ? '1fr' : '1fr 1fr',
                          gap: narrow ? 14 : 20,
                          alignItems: 'start'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div
                            style={{
                              fontFamily: "'Playfair Display', Georgia, serif",
                              fontSize: narrow ? 16 : 18,
                              color: '#fff',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 8
                            }}
                          >
                            <span>{r.nombre_completo ?? '—'}</span>
                            {r.es_urgente ? (
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  letterSpacing: '0.5px',
                                  textTransform: 'uppercase',
                                  background: 'rgba(201,168,76,0.15)',
                                  color: '#c9a84c',
                                  border: '1px solid rgba(201,168,76,0.5)',
                                  borderRadius: 999,
                                  fontFamily: "'Manrope', sans-serif"
                                }}
                              >
                                ◆ Urgente · próximos 30 días
                              </span>
                            ) : null}
                          </div>
                          <div style={{ fontSize: narrow ? 13 : 14, color: '#ccc' }}>Evento: {r.tipo_evento ?? '—'}</div>
                          <div style={{ fontSize: narrow ? 13 : 14, color: GOLD }}>
                            Fecha: {fechaFmt}
                            {horaFmt ? ` · ${horaFmt}` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: narrow ? 15 : 16,
                              color: '#fff',
                              fontWeight: 600
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" style={{ opacity: 0.85 }}>
                              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
                            </svg>
                            Invitados: {r.cantidad_invitados ?? '—'}
                          </div>
                          <div style={{ fontSize: narrow ? 13 : 14, color: '#ccc' }}>
                            Área: {hasText(r.area_preferida) ? r.area_preferida : '—'}
                          </div>
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 999,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'lowercase',
                                ...statusBadgeStyle(r.status)
                              }}
                            >
                              {statusLabel(r.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: `1px solid ${BORDER}`,
                          display: 'flex',
                          flexDirection: narrow ? 'column' : 'row',
                          flexWrap: 'wrap',
                          alignItems: narrow ? 'stretch' : 'center',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpanded(r.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: GOLD,
                            fontFamily: "'Manrope', system-ui, sans-serif",
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: narrow ? 'left' : 'left',
                            padding: 0
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {expanded ? 'Ocultar detalles ▲' : 'Ver detalles ▼'}
                        </button>
                        {isPendiente(r.status) ? (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: narrow ? 'column' : 'row',
                              gap: 8
                            }}
                          >
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => void setStatus(r.id, 'confirmada')}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: 'none',
                                background: 'rgba(76, 175, 80, 0.85)',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: busyId === r.id ? 'wait' : 'pointer',
                                fontFamily: 'inherit'
                              }}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => void setStatus(r.id, 'cancelada')}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: 'none',
                                background: 'rgba(229, 115, 115, 0.35)',
                                color: '#ffcdd2',
                                fontWeight: 600,
                                cursor: busyId === r.id ? 'wait' : 'pointer',
                                fontFamily: 'inherit'
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <AnimatePresence initial={false}>
                        {expanded ? (
                          <motion.div
                            key={`${r.id}-detail`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ paddingTop: 8 }}>
                              {showContacto ? (
                                <>
                                  <SectionDivider />
                                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 8 }}>
                                    Contacto
                                  </div>
                                  {hasText(r.correo) ? (
                                    <div style={{ marginBottom: 8 }}>
                                      <a href={`mailto:${r.correo.trim()}`} style={{ color: GOLD, textDecoration: 'none' }}>
                                        📧 {r.correo}
                                      </a>
                                    </div>
                                  ) : null}
                                  {hasText(r.telefono_whatsapp) && wa.length > 0 ? (
                                    <div>
                                      <a
                                        href={`https://wa.me/${wa}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: GOLD, textDecoration: 'none' }}
                                      >
                                        📱 {r.telefono_whatsapp}
                                      </a>
                                    </div>
                                  ) : null}
                                </>
                              ) : null}

                              {showServicios ? (
                                <>
                                  <SectionDivider />
                                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 8 }}>
                                    Servicios
                                  </div>
                                  {hasText(r.needs_av) ? (
                                    <div style={{ color: '#ccc', marginBottom: 8 }}>
                                      🎵 Necesidades AV: {r.needs_av}
                                    </div>
                                  ) : null}
                                  {hasText(r.media_interest) ? (
                                    <div style={{ color: '#ccc', marginBottom: 8 }}>
                                      🎬 Interés en media: {r.media_interest}
                                    </div>
                                  ) : null}
                                  {avItems.length > 0 ? (
                                    <div style={{ marginBottom: 8 }}>
                                      <div style={{ color: '#ccc', marginBottom: 6 }}>🔊 Equipo AV:</div>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {avItems.map((item) => (
                                          <span
                                            key={item}
                                            style={{
                                              padding: '4px 10px',
                                              borderRadius: 6,
                                              background: '#333',
                                              color: '#ccc',
                                              fontSize: '0.8rem'
                                            }}
                                          >
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                  {hasText(r.av_notes) ? (
                                    <div style={{ color: '#ccc', marginBottom: 8 }}>
                                      📝 Notas AV: {r.av_notes}
                                    </div>
                                  ) : null}
                                  {hasText(r.media_notes) ? (
                                    <div style={{ color: '#ccc' }}>📸 Notas media: {r.media_notes}</div>
                                  ) : null}
                                </>
                              ) : null}

                              {showNotas ? (
                                <>
                                  <SectionDivider />
                                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 8 }}>
                                    Notas generales
                                  </div>
                                  <div style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: 1.5 }}>📋 {r.notes}</div>
                                </>
                              ) : null}

                              {showMeta ? (
                                <>
                                  <SectionDivider />
                                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 8 }}>
                                    Metadata
                                  </div>
                                  {hasText(r.evento_id) ? (
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 6 }}>ID del evento: {r.evento_id}</div>
                                  ) : null}
                                  {createdFmt ? (
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Creada el: {createdFmt}</div>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
