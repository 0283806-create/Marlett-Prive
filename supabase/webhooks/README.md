# Database Webhook — `notify-reservation-on-insert`

Dispara la Edge Function [`notify-reservation`](../functions/notify-reservation/) cada vez que se inserta una fila en `reservas_marlett`.

## Pasos en el dashboard de Supabase

1. **Dashboard → Database → Webhooks → Create a new hook**
2. Configurar:
   - **Name:** `notify-reservation-on-insert`
   - **Table:** `public.reservas_marlett`
   - **Events:** ✅ Insert (NO marcar Update ni Delete)
   - **Type:** `Supabase Edge Functions`
   - **Edge Function:** `notify-reservation`
   - **HTTP Method:** `POST`
   - **HTTP Headers:** dejar el `Authorization: Bearer ...` que Supabase agrega automáticamente con el service-role key
   - **HTTP Params:** vacío
   - **Timeout:** 5000ms (default)
3. Click **Create webhook**.

## Validar que funciona

1. Insertar una reservación de prueba directamente en SQL:

   ```sql
   INSERT INTO reservas_marlett (
     nombre_completo, telefono_whatsapp, tipo_evento,
     fecha_evento, cantidad_invitados, status, es_urgente
   ) VALUES (
     'Test Webhook', '+523300000000', 'Boda',
     (CURRENT_DATE + INTERVAL '15 days')::date, 80, 'pendiente', TRUE
   );
   ```

2. **Edge Functions → Logs** → confirmar que `notify-reservation` corrió sin errores.
3. Revisar `miguel.donpule@gmail.com`.
4. Confirmar fila en `notification_log`:

   ```sql
   SELECT * FROM notification_log ORDER BY created_at DESC LIMIT 5;
   ```

## Atajo: probar sin INSERT

Usa el botón **◆ Probar notificación** en `/admin/reservaciones`. Llama directamente a la Edge Function con un payload simulado y NO inserta ninguna fila real en `reservas_marlett`.

## Reintento manual

Si una notificación falla, puedes re-disparar el webhook desde:
**Database → Webhooks → notify-reservation-on-insert → Recent deliveries → Resend**.
