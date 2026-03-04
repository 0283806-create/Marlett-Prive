# Deploy en Vercel - Instrucciones

## ✅ Pre-requisitos

1. **Cuenta de Vercel**: Crea una cuenta en [vercel.com](https://vercel.com) si no tienes una
2. **Repositorio Git**: Asegúrate de que tu código esté en GitHub, GitLab o Bitbucket

## 🚀 Opción 1: Deploy desde la CLI de Vercel (Recomendado)

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Iniciar sesión

```bash
vercel login
```

### 3. Hacer deploy

Desde la raíz del proyecto:

```bash
vercel
```

Sigue las instrucciones:
- ¿Set up and deploy? **Yes**
- ¿Which scope? Selecciona tu cuenta
- ¿Link to existing project? **No** (primera vez) o **Yes** (si ya tienes un proyecto)
- ¿What's your project's name? `reservaciones-marlett` (o el nombre que prefieras)
- ¿In which directory is your code located? **./** (presiona Enter)

### 4. Deploy a producción

```bash
vercel --prod
```

## 🌐 Opción 2: Deploy desde el Dashboard de Vercel

### 1. Conectar repositorio

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New..."** → **"Project"**
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Selecciona el repositorio `Reservaciones`

### 2. Configurar el proyecto

Vercel detectará automáticamente que es un proyecto Vite. La configuración debería ser:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Estos valores ya están configurados en `vercel.json`, así que Vercel los detectará automáticamente.

### 3. Variables de entorno (si las necesitas)

Si tu proyecto usa variables de entorno (como Supabase), agrégalas en:
- **Settings** → **Environment Variables**

Ejemplo:
- `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `tu-anon-key`

### 4. Deploy

Haz clic en **"Deploy"** y espera a que se complete el proceso.

## 📝 Configuración actual

El proyecto ya tiene configurado `vercel.json` con:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Esto asegura que:
- El build use `npm run build`
- Los archivos se generen en `dist/`
- Todas las rutas redirijan a `index.html` (SPA routing)

## ✅ Verificación

Después del deploy:

1. Vercel te dará una URL (ej: `https://reservaciones-marlett.vercel.app`)
2. Visita la URL y verifica que:
   - El componente Hero se muestra correctamente
   - El componente RandomPhrase muestra una frase aleatoria
   - Las imágenes se cargan correctamente
   - Los estilos CSS se aplican

## 🔄 Actualizaciones futuras

Cada vez que hagas `git push` a la rama principal, Vercel automáticamente:
1. Detectará los cambios
2. Ejecutará el build
3. Desplegará la nueva versión

## 🐛 Solución de problemas

### Error: "Build failed"
- Verifica que `npm run build` funcione localmente
- Revisa los logs en el dashboard de Vercel

### Las imágenes no se cargan
- Asegúrate de que las imágenes estén en `public/assets/`
- Verifica que las rutas en los componentes sean relativas (sin `/` inicial) o absolutas desde `public/`

### El componente RandomPhrase no muestra frases
- Verifica que React esté correctamente configurado
- Revisa la consola del navegador para errores

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/guides/deploying-vite-with-vercel)

