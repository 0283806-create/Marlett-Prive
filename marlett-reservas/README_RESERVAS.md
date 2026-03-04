# Sistema de Reservas Marlett con Supabase

Este sistema permite guardar las reservas del formulario en Supabase y exportarlas a Excel (CSV).

## 📋 Configuración Inicial

### 1. Crear la tabla en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Abre el **SQL Editor**
3. Abre el archivo `supabase_setup.sql` en este proyecto
4. Copia y pega todo el contenido en el SQL Editor
5. Haz clic en **Run** para ejecutar el script

Esto creará la tabla `reservas_marlett` con todos los campos necesarios y las políticas de seguridad.

### 2. Verificar la configuración

El archivo `app.js` ya está configurado con:
- URL de Supabase
- Anon Key de Supabase
- Mapeo de campos del formulario a la tabla

## 🎯 Funcionalidades

### Guardar Reservas

El formulario en `index.html` ahora guarda automáticamente cada reserva en Supabase cuando el usuario envía el formulario.

**Campos guardados:**
- Nombre completo
- Teléfono WhatsApp
- Correo electrónico (opcional)
- Área preferida
- Tipo de evento
- Fecha del evento
- Hora de inicio
- Cantidad de invitados
- Uso de visuales
- Interés en paquetes foto/video
- Notas adicionales

### Exportar a Excel (CSV)

1. Abre `admin.html` en tu navegador
2. Haz clic en el botón **"Descargar reservas en Excel"**
3. Se descargará un archivo CSV con todas las reservas
4. El archivo se puede abrir directamente en Excel, Google Sheets, etc.

**Formato del archivo:**
- Nombre: `reservas_marlett-YYYY-MM-DD_HH-mm-ss.csv`
- Encoding: UTF-8 con BOM (compatible con Excel)
- Separador: Coma (,)
- Encabezados incluidos

## 📁 Estructura de Archivos

```
marlett-reservas/
├── index.html          # Formulario principal de reservas
├── admin.html          # Página de administración para exportar
├── app.js              # Lógica del formulario y exportación
├── styles.css          # Estilos del sitio
├── supabase_setup.sql  # Script SQL para crear la tabla
└── README_RESERVAS.md  # Este archivo
```

## 🔒 Seguridad

El sistema usa **Row Level Security (RLS)** en Supabase:

- **INSERT**: Permitido para usuarios anónimos (para que el formulario funcione)
- **SELECT**: Permitido para usuarios anónimos (para la exportación)

**⚠️ Nota de Seguridad:**
Si quieres restringir el acceso a la exportación, puedes:
1. Eliminar la política de SELECT para `anon`
2. Crear una Edge Function en Supabase con autenticación
3. Usar Service Role Key solo en el servidor (si migras a Next.js)

## 🐛 Solución de Problemas

### Error: "relation 'reservas_marlett' does not exist"
- **Solución**: Ejecuta el script `supabase_setup.sql` en Supabase

### Error: "new row violates row-level security policy"
- **Solución**: Verifica que las políticas RLS estén creadas correctamente en Supabase

### El CSV no se descarga
- **Solución**: Verifica que tu navegador permita descargas automáticas
- Verifica la consola del navegador para errores de JavaScript

### Los datos no se guardan
- **Solución**: 
  1. Abre la consola del navegador (F12)
  2. Verifica que no haya errores de Supabase
  3. Verifica que la tabla `reservas_marlett` exista
  4. Verifica que las políticas RLS permitan INSERT

## 📊 Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único (generado automáticamente) |
| `created_at` | Timestamp | Fecha y hora de creación (automático) |
| `nombre_completo` | Text | Nombre completo del cliente (obligatorio) |
| `telefono_whatsapp` | Text | Teléfono de WhatsApp (obligatorio) |
| `correo` | Text | Correo electrónico (opcional) |
| `area_preferida` | Text | Área preferida para el evento |
| `tipo_evento` | Text | Tipo de evento |
| `fecha_evento` | Date | Fecha del evento (obligatorio) |
| `hora_inicio` | Text | Hora de inicio |
| `cantidad_invitados` | Integer | Número de invitados |
| `usa_visuales` | Text | "Sí", "No", "No estoy seguro" |
| `paquetes_foto_video` | Text | "Sí", "No", "Tal vez" |
| `notas_adicionales` | Text | Notas adicionales del cliente |

## 🚀 Próximos Pasos (Opcional)

### Subir CSV a Supabase Storage

Si quieres guardar los archivos CSV exportados en Supabase Storage:

1. Crea un bucket llamado `exports` en Supabase Storage
2. Modifica la función `exportarReservasCSV()` en `app.js` o `admin.html`
3. Usa el cliente de Supabase para subir el archivo:

```javascript
const { data, error } = await supabase.storage
  .from('exports')
  .upload(`reservas_marlett-${fecha}.csv`, blob, {
    contentType: 'text/csv',
    upsert: false
  });
```

### Migrar a Next.js (Opcional)

Si planeas migrar a Next.js en el futuro:

1. Los endpoints `/api/reservas` y `/api/reservas/export` pueden ser route handlers
2. Usa Service Role Key solo en el servidor para mayor seguridad
3. Implementa autenticación para la página de admin

## 📝 Notas

- El archivo CSV incluye un BOM (Byte Order Mark) para compatibilidad con Excel
- Los valores con comas, comillas o saltos de línea se escapan automáticamente
- El formulario se limpia automáticamente después de un envío exitoso
- Los mensajes de error y éxito se muestran al usuario de forma clara

---

**Desarrollado para Marlett Restaurante & Salón de eventos**



