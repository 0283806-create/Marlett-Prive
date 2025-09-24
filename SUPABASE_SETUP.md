# Configuración de Supabase para Autenticación

## 🔧 Configuración en Supabase Dashboard

### 1. Deshabilitar Confirmación de Email (Para Desarrollo)

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication > Settings**
3. En la sección **Email Confirmation**, desactiva:
   - ✅ **Enable email confirmations** (desactivar)
   - ✅ **Enable email change confirmations** (desactivar)

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Crear Usuario Administrador

#### Opción A: Desde Supabase Dashboard
1. Ve a **Authentication > Users**
2. Haz clic en **Add user**
3. Ingresa email y contraseña
4. Haz clic en **Create user**

#### Opción B: Desde la Aplicación (si está habilitado)
1. Usa el formulario de registro en la aplicación
2. Confirma el email si está habilitado

### 4. Configuración de Seguridad (Opcional)

Para mayor seguridad, puedes configurar:

1. **Row Level Security (RLS)** en tus tablas
2. **Policies** para restringir acceso a datos
3. **Email templates** personalizados

### 5. Solución de Problemas

#### Error: "Email not confirmed"
- **Solución 1**: Deshabilitar confirmación de email en Supabase
- **Solución 2**: Confirmar el email desde el enlace enviado
- **Solución 3**: Usar el botón "Reenviar email de confirmación"

#### Error: "Invalid login credentials"
- Verificar que el email y contraseña sean correctos
- Verificar que el usuario existe en Supabase

#### Error: "User not found"
- Crear el usuario en Supabase Dashboard
- Verificar que el email esté correctamente escrito

## 🚀 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📝 Notas Importantes

- En **desarrollo**, es recomendable deshabilitar la confirmación de email
- En **producción**, mantén la confirmación de email habilitada
- Los usuarios se crean automáticamente al hacer login si no existen (dependiendo de la configuración)
- El sistema maneja automáticamente la autenticación y redirección
