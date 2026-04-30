// Edge Function: notify-reservation
// Disparada por un Database Webhook de Supabase ante INSERT en reservas_marlett.
// Envía un email vía Resend al admin con diseño Marlett y prioridad si es urgente.

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ReservationRecord {
  id: string;
  nombre_completo: string | null;
  telefono_whatsapp: string | null;
  correo: string | null;
  tipo_evento: string | null;
  fecha_evento: string | null;
  hora_inicio: string | null;
  cantidad_invitados: number | null;
  area_preferida: string | null;
  needs_av: string | null;
  media_interest: string | null;
  notes: string | null;
  es_urgente: boolean | null;
  created_at: string;
  // Campo opcional por si se agrega columna futura. Hoy se deriva desde notes.
  fecha_flexible?: boolean | null;
}

interface ReservationPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: ReservationRecord;
  old_record: null | Record<string, unknown>;
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const NOTIFICATION_TO_EMAIL = Deno.env.get('NOTIFICATION_TO_EMAIL') ?? 'miguel.donpule@gmail.com';
const NOTIFICATION_FROM_EMAIL = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'onboarding@resend.dev';
const ADMIN_PANEL_URL = Deno.env.get('ADMIN_PANEL_URL') ?? 'https://marlettprive.mx/admin/reservaciones';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FLEX_NOTE_MARKER = 'Fecha flexible';

function isFechaFlexible(record: ReservationRecord): boolean {
  if (record.fecha_flexible === true) return true;
  if (typeof record.notes === 'string' && record.notes.includes(FLEX_NOTE_MARKER)) return true;
  return false;
}

function calculateDaysUntilEvent(fechaEvento: string | null, fechaFlexible: boolean): number | null {
  if (fechaFlexible || !fechaEvento) return null;
  const event = new Date(`${fechaEvento}T12:00:00`);
  if (Number.isNaN(event.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = event.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatEventDate(fechaEvento: string | null, fechaFlexible: boolean): string {
  if (fechaFlexible) return 'Por definir';
  if (!fechaEvento) return 'Sin fecha';
  const date = new Date(`${fechaEvento}T12:00:00`);
  if (Number.isNaN(date.getTime())) return fechaEvento;
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailSubject(record: ReservationRecord, daysUntil: number | null): string {
  const cliente = record.nombre_completo?.trim() || 'Sin nombre';
  if (record.es_urgente && daysUntil !== null) {
    return `🔔 Reserva URGENTE en Marlett Privé — ${cliente} — en ${daysUntil} días`;
  }
  return `📩 Nueva reservación en Marlett Privé — ${cliente}`;
}

function buildRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(212,196,168,0.3);">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#8b6f3f;text-transform:uppercase;">
          ${escapeHtml(label)}
        </p>
        <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:15px;color:#2b2b2b;line-height:1.5;">
          ${escapeHtml(value)}
        </p>
      </td>
    </tr>
  `;
}

function buildEmailHtml(record: ReservationRecord, daysUntil: number | null, fechaFlexible: boolean): string {
  const isUrgent = Boolean(record.es_urgente);
  const accentColor = isUrgent ? '#c9a84c' : '#8b6f3f';
  const bannerBg = isUrgent
    ? 'linear-gradient(180deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)'
    : 'rgba(245, 239, 230, 0.5)';
  const bannerBorder = isUrgent ? 'rgba(201,168,76,0.5)' : 'rgba(212,196,168,0.5)';
  const bannerLabel = isUrgent ? '🔔 RESERVA URGENTE' : '📩 NUEVA RESERVACIÓN';
  const headline = isUrgent
    ? `Evento en ${daysUntil} días — requiere respuesta inmediata`
    : 'Nueva solicitud recibida vía formulario';

  const eventDate = formatEventDate(record.fecha_evento, fechaFlexible);
  const guests = record.cantidad_invitados
    ? `${record.cantidad_invitados} personas`
    : 'Por definir';
  const eventType = record.tipo_evento?.trim() || 'Por definir';
  const cliente = record.nombre_completo?.trim() || 'Sin nombre';
  const phone = record.telefono_whatsapp?.trim();
  const correo = record.correo?.trim();
  const contact = phone || correo || 'Sin contacto';
  const message = record.notes?.trim();
  const createdAt = new Date(record.created_at).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Nueva reservación Marlett Privé</title>
</head>
<body style="margin:0;padding:0;background:#f5efe6;font-family:Georgia,'Times New Roman',serif;color:#2b2b2b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5efe6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fafaf6;border:1px solid ${bannerBorder};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;border-bottom:1px solid rgba(212,196,168,0.4);">
              <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:28px;color:#8b6f3f;letter-spacing:1px;">
                Marlett <span style="color:${accentColor};">Privé</span>
              </p>
              <p style="margin:6px 0 0;font-size:10px;letter-spacing:3px;color:#5a5a5a;text-transform:uppercase;">
                Notificación interna
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:${bannerBg};border:1px solid ${bannerBorder};border-radius:8px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-weight:bold;font-size:13px;letter-spacing:2px;color:${accentColor};">
                      ${bannerLabel}
                    </p>
                    <p style="margin:6px 0 0;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#2b2b2b;line-height:1.5;">
                      ${escapeHtml(headline)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${buildRow('Cliente', cliente)}
                ${buildRow('Tipo de evento', eventType)}
                ${buildRow('Fecha del evento', eventDate)}
                ${daysUntil !== null ? buildRow('Días restantes', `${daysUntil} días`) : ''}
                ${buildRow('Invitados', guests)}
                ${buildRow('Contacto', contact)}
                ${correo ? buildRow('Email', correo) : ''}
                ${message ? buildRow('Mensaje', message) : ''}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 40px 32px;text-align:center;">
              <a href="${ADMIN_PANEL_URL}" style="display:inline-block;padding:14px 32px;background:${accentColor};color:#fafaf6;font-family:Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;letter-spacing:1px;">
                Ver en el panel →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;background:#f5efe6;border-top:1px solid rgba(212,196,168,0.4);text-align:center;">
              <p style="margin:0;font-size:11px;color:#5a5a5a;line-height:1.6;">
                Calle San José del Río 572, Col. San Juan<br>
                Zapotlanejo, Jalisco · CP 45430
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#8a8a8a;">
                Recibida ${escapeHtml(createdAt)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function logNotification(
  supabase: ReturnType<typeof createClient>,
  reservationId: string,
  recipientEmail: string,
  subject: string,
  isUrgent: boolean,
  status: 'sent' | 'failed',
  resendId: string | null,
  errorMessage: string | null,
): Promise<void> {
  try {
    const { error } = await supabase.from('notification_log').insert({
      reservation_id: reservationId,
      recipient_email: recipientEmail,
      subject,
      is_urgent: isUrgent,
      status,
      resend_id: resendId,
      error_message: errorMessage,
    });
    if (error) {
      // FK violation cuando reservation_id no existe (ej. payload de prueba); lo logueamos sin fallar.
      console.warn('notification_log insert error:', error.message);
    }
  } catch (e) {
    console.error('Failed to log notification:', e);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let payload: ReservationPayload;
  try {
    payload = (await req.json()) as ReservationPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (payload.type !== 'INSERT' || payload.table !== 'reservas_marlett') {
    return new Response(
      JSON.stringify({ skipped: true, reason: 'Not a reservation insert' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const record = payload.record;
  const fechaFlexible = isFechaFlexible(record);
  const daysUntil = calculateDaysUntilEvent(record.fecha_evento, fechaFlexible);
  const subject = buildEmailSubject(record, daysUntil);
  const html = buildEmailHtml(record, daysUntil, fechaFlexible);
  const isUrgent = Boolean(record.es_urgente);

  const recipients = NOTIFICATION_TO_EMAIL
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  if (recipients.length === 0) {
    return new Response(
      JSON.stringify({ error: 'NOTIFICATION_TO_EMAIL has no valid recipients' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Marlett Privé <${NOTIFICATION_FROM_EMAIL}>`,
        to: recipients,
        subject,
        html,
      }),
    });

    const resendData = (await resendResponse.json()) as { id?: string; message?: string } & Record<string, unknown>;

    if (!resendResponse.ok) {
      const errorMsg = resendData?.message || `Resend API error ${resendResponse.status}`;
      await logNotification(
        supabase,
        record.id,
        recipients.join(', '),
        subject,
        isUrgent,
        'failed',
        null,
        errorMsg,
      );
      console.error('Resend error:', resendData);
      return new Response(JSON.stringify({ error: errorMsg, details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await logNotification(
      supabase,
      record.id,
      recipients.join(', '),
      subject,
      isUrgent,
      'sent',
      resendData.id ?? null,
      null,
    );

    return new Response(
      JSON.stringify({ success: true, resend_id: resendData.id, urgent: isUrgent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    await logNotification(
      supabase,
      record.id,
      recipients.join(', '),
      subject,
      isUrgent,
      'failed',
      null,
      errorMsg,
    );
    console.error('Error sending email:', e);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
