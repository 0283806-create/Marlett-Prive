# Edge Function — `notify-reservation`

Envía un email al admin de Marlett vía [Resend](https://resend.com) cada vez que entra una nueva reservación. El cuerpo y el asunto se diferencian según el flag `es_urgente` de la fila insertada en `reservas_marlett`.

## Mapeo de columnas (Supabase → email)

| Columna en `reservas_marlett` | Uso en el email |
|---|---|
| `nombre_completo` | Cliente |
| `telefono_whatsapp` | Contacto principal |
| `correo` | Email (si existe) |
| `tipo_evento` | Tipo de evento |
| `fecha_evento` | Fecha del evento + cálculo de días restantes |
| `cantidad_invitados` | Invitados |
| `notes` | Mensaje (también marcador `Fecha flexible:` deriva `fecha_flexible = true`) |
| `es_urgente` | Activa banner y asunto urgentes |
| `created_at` | Timestamp del footer |

## Deploy

```bash
# 1. Login (una vez)
npx supabase login

# 2. Vincular al proyecto si aún no lo está
npx supabase link --project-ref lbcaivpxzkcenfyxwydw

# 3. Desplegar la función
npx supabase functions deploy notify-reservation

# 4. (opcional) ver logs en vivo
npx supabase functions logs notify-reservation --tail
```

## Variables de entorno (Secrets)

Las cuatro variables siguientes se cargan como **Secrets** del proyecto Supabase (no se commitean ni viven en `.env`).

### Vía CLI

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
npx supabase secrets set NOTIFICATION_TO_EMAIL=miguel.donpule@gmail.com
npx supabase secrets set NOTIFICATION_FROM_EMAIL=onboarding@resend.dev
npx supabase secrets set ADMIN_PANEL_URL=https://marlettprive.mx/admin/reservaciones
```

### Vía Dashboard

Dashboard → Edge Functions → `notify-reservation` → Settings → Secrets → **Add new secret** (uno por uno).

### Secrets que ya existen automáticamente

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están preconfigurados por la plataforma. No los agregues manualmente.

## Personalizar el remitente

`NOTIFICATION_FROM_EMAIL=onboarding@resend.dev` funciona para pruebas pero llega marcado como "via resend". Para producción:

1. En Resend, ir a Domains → Add Domain (`marlettprive.mx`).
2. Pegar los registros DNS sugeridos (SPF, DKIM, DMARC) en el proveedor del dominio.
3. Esperar verificación.
4. Cambiar la secret: `npx supabase secrets set NOTIFICATION_FROM_EMAIL=reservas@marlettprive.mx`.

## Pruebas locales

```bash
npx supabase functions serve notify-reservation --env-file ./supabase/functions/notify-reservation/.env.local
```

(Requiere crear `.env.local` con las mismas claves que `.env.example`.)
