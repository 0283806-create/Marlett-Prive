import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import MarlettPriveLabel from '../components/MarlettPriveLabel';

const BG = '#1a1a1a';
const GOLD = '#C8A96E';
const INPUT_BG = '#2a2a2a';
const BORDER = '#333';
const WARN_RED = '#e57373';
const STORAGE_KEY = 'marlett_admin_login_guard';

type GuardState = {
  failedAttempts: number;
  lockoutUntil: number | null;
};

function loadGuard(): GuardState {
  if (typeof sessionStorage === 'undefined') {
    return { failedAttempts: 0, lockoutUntil: null };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { failedAttempts: 0, lockoutUntil: null };
    const p = JSON.parse(raw) as Partial<GuardState>;
    const failedAttempts =
      typeof p.failedAttempts === 'number' && Number.isFinite(p.failedAttempts) && p.failedAttempts >= 0
        ? Math.floor(p.failedAttempts)
        : 0;
    let lockoutUntil: number | null =
      typeof p.lockoutUntil === 'number' && Number.isFinite(p.lockoutUntil) ? p.lockoutUntil : null;
    if (lockoutUntil !== null && lockoutUntil <= Date.now()) {
      lockoutUntil = null;
    }
    return { failedAttempts, lockoutUntil };
  } catch {
    return { failedAttempts: 0, lockoutUntil: null };
  }
}

function saveGuard(s: GuardState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function lockoutDurationSecondsForAttemptCount(afterIncrement: number): number | null {
  if (afterIncrement < 3) return null;
  if (afterIncrement === 3) return 15;
  if (afterIncrement === 4) return 30;
  if (afterIncrement === 5) return 60;
  return 300;
}

export default function AdminLogin() {
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/reservaciones';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    const g = loadGuard();
    setFailedAttempts(g.failedAttempts);
    setLockoutUntil(g.lockoutUntil);
    saveGuard({ failedAttempts: g.failedAttempts, lockoutUntil: g.lockoutUntil });
  }, []);

  useEffect(() => {
    if (lockoutUntil === null) {
      setCooldownSeconds(0);
      return;
    }

    const until = lockoutUntil;

    const tick = () => {
      const now = Date.now();
      if (until <= now) {
        setCooldownSeconds(0);
        const g = loadGuard();
        saveGuard({ failedAttempts: g.failedAttempts, lockoutUntil: null });
        setLockoutUntil(null);
        return;
      }
      setCooldownSeconds(Math.max(0, Math.ceil((until - now) / 1000)));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lockoutUntil]);

  const lockActive =
    (lockoutUntil !== null && Date.now() < lockoutUntil) || (cooldownSeconds > 0 && lockoutUntil !== null);
  const fieldsFilled = email.trim().length > 0 && password.length > 0;
  const submitDisabled = submitting || loading || !fieldsFilled || lockActive;

  const registerFailure = useCallback(() => {
    console.warn('[AdminLogin] Failed login attempt', { ts: new Date().toISOString() });
    setFailedAttempts((prev) => {
      const next = prev + 1;
      const duration = lockoutDurationSecondsForAttemptCount(next);
      const until = duration !== null ? Date.now() + duration * 1000 : null;
      saveGuard({ failedAttempts: next, lockoutUntil: until });
      queueMicrotask(() => {
        setLockoutUntil(until);
      });
      return next;
    });
  }, []);

  const resetGuard = useCallback(() => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    setCooldownSeconds(0);
    saveGuard({ failedAttempts: 0, lockoutUntil: null });
  }, []);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate(from.startsWith('/admin') ? from : '/admin/reservaciones', { replace: true });
    }
  }, [loading, user, isAdmin, navigate, from]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const guard = loadGuard();
    const blockedUntil = guard.lockoutUntil;
    if (blockedUntil !== null && Date.now() < blockedUntil) {
      setLockoutUntil(blockedUntil);
      return;
    }
    if (lockoutUntil !== null && Date.now() < lockoutUntil) {
      return;
    }
    if (cooldownSeconds > 0 && lockoutUntil !== null) {
      return;
    }
    if (!fieldsFilled) {
      return;
    }

    setSubmitting(true);
    try {
      const { error: signErr } = await signIn(email, password);
      if (signErr) {
        setError(signErr.message || 'No se pudo iniciar sesión.');
        registerFailure();
        return;
      }
      const { data: authData } = await supabase.auth.getUser();
      const signedUser = authData.user;
      if (signedUser?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        setError('Esta cuenta no tiene permisos de administrador.');
        registerFailure();
        return;
      }
      resetGuard();
      navigate('/admin/reservaciones', { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  const showCooldownUi =
    (lockoutUntil !== null && Date.now() < lockoutUntil) || (cooldownSeconds > 0 && lockoutUntil !== null);
  const showHardBlockCopy = failedAttempts >= 6 && showCooldownUi;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        background: BG,
        color: 'rgba(242, 246, 241, 0.92)',
        fontFamily: "'Manrope', system-ui, sans-serif"
      }}
    >
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          fontSize: '0.85rem',
          color: '#888',
          textDecoration: 'none'
        }}
        onMouseEnter={(ev) => {
          ev.currentTarget.style.color = GOLD;
        }}
        onMouseLeave={(ev) => {
          ev.currentTarget.style.color = '#888';
        }}
      >
        ← Volver al sitio
      </Link>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <img src="/marlett_clean.png" alt="" width={48} height={48} style={{ display: 'block', height: 40, width: 'auto' }} />
          <div style={{ fontSize: '1.1rem', color: GOLD }}>
            <MarlettPriveLabel />
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 600,
            fontSize: 'clamp(1.5rem, 4vw, 1.85rem)',
            margin: '0 0 1.75rem',
            color: GOLD,
            textAlign: 'center',
            letterSpacing: '0.02em'
          }}
        >
          Acceso Administración
        </h1>

        <form
          onSubmit={onSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontFamily: "'Manrope', system-ui, sans-serif"
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>
              Correo
            </span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              maxLength={254}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: INPUT_BG,
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: "'Manrope', system-ui, sans-serif"
              }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              maxLength={128}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: INPUT_BG,
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: "'Manrope', system-ui, sans-serif"
              }}
            />
          </label>

          {error ? (
            <p
              role="alert"
              style={{
                margin: 0,
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(180, 60, 60, 0.18)',
                border: '1px solid rgba(220, 90, 90, 0.35)',
                fontSize: '0.9rem',
                color: '#f5b4b4',
                textAlign: 'center'
              }}
            >
              {error}
            </p>
          ) : null}

          {showCooldownUi ? (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: '0.9rem',
                color: WARN_RED,
                textAlign: 'center',
                lineHeight: 1.45
              }}
            >
              Demasiados intentos. Espera {cooldownSeconds} segundos.
            </p>
          ) : null}

          {showHardBlockCopy ? (
            <p
              style={{
                margin: 0,
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: '13px',
                color: '#b0b0b0',
                textAlign: 'center',
                lineHeight: 1.45
              }}
            >
              Por seguridad, el acceso ha sido temporalmente bloqueado.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitDisabled}
            className={`admin-login-submit${showCooldownUi ? ' admin-login-submit--cooldown' : ''}`}
            style={{
              marginTop: 8,
              padding: '14px 18px',
              borderRadius: 8,
              border: 'none',
              background: showCooldownUi ? '#444' : GOLD,
              color: showCooldownUi ? '#888' : '#1a1a1a',
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: submitDisabled ? 'not-allowed' : submitting ? 'wait' : 'pointer',
              opacity: submitting && !showCooldownUi ? 0.85 : 1,
              transition: 'background 0.2s ease, color 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {showCooldownUi ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7Z" />
                </svg>
                Espera {cooldownSeconds}s
              </>
            ) : submitting ? (
              'Ingresando…'
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <style>{`
          .admin-login-submit:hover:not(:disabled) {
            background: #d4b87e !important;
            color: #1a1a1a !important;
          }
          .admin-login-submit:disabled {
            cursor: not-allowed !important;
          }
          .admin-login-submit--cooldown:disabled:hover,
          .admin-login-submit--cooldown:disabled {
            background: #444 !important;
            color: #888 !important;
          }
        `}</style>
      </div>
    </div>
  );
}
