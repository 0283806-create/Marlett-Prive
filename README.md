# Marlett - Sistema de Reservas de Eventos

Una aplicación web **innovadora y visualmente atractiva** para gestionar reservas de eventos de manera eficiente, construida con Next.js, TypeScript y Tailwind CSS.

## 🚀 Características
- Cliente minimalista con listado/detalle y reserva + descarga PDF
- Panel Admin con tabla, filtros, exportación CSV/XLSX y descarga de PDF
- Componentes reutilizables: `DownloadPDF`, `ExportData`, `ReservationsTable`
## 📦 Esquema de Base de Datos (Supabase)

Tablas sugeridas:
- `clientes` (id UUID PK, nombre, email, telefono, created_at, updated_at)
- `eventos` (id UUID PK, nombre, fecha, lugar, descripcion, created_at, updated_at)
- `reservas` (id UUID PK, cliente_id FK -> clientes.id, evento_id FK -> eventos.id, estado, invitados, total, created_at, updated_at)

Consulta recomendada para joins (pseudo):
`select reservas.*, clientes(name,email,phone), eventos(nombre,fecha,lugar) from reservas`.

SQL (referencia) para Supabase:
```sql
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  telefono text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha date not null,
  lugar text not null,
  descripcion text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  evento_id uuid references eventos(id) on delete cascade,
  fecha_reserva timestamptz default now(),
  estado text check (estado in ('pending','confirmed','cancelled','in-progress','completed')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```


### ✅ Funcionalidades Principales
- [x] **Sistema de precios por hora: $3,000 MX/hora para todos los eventos**
- [x] **Selección de fechas con calendario integrado y vista de reservas por día**
- [x] **Almacenamiento automático de reservas con persistencia de datos**
- [x] **Opción de eventos anónimos para proteger la privacidad del cliente**
- [x] **4 Salones configurables de 80 personas cada uno**
- [x] **Sistema de combinación de salones (1-4 salones = 80-400 personas)**
- [x] **Calculadora de precios en tiempo real con desglose detallado**
- [x] **Tipos de eventos personalizables - agregar eventos no mencionados**
- [x] Sistema de reservas para diferentes tipos de eventos
- [x] Gestión completa de reservas (crear, editar, eliminar)
- [x] Estados de reserva (Confirmado, Pendiente, Cancelado)
- [x] Búsqueda y filtrado por fecha y texto
- [x] **Interfaz moderna con Glassmorphism y efectos visuales avanzados**

### ✅ Tipos de Eventos Disponibles
- **Boda y Celebración**: $45/persona + $3,000 MX/hora (4-12 horas)
- **Evento Corporativo**: $35/persona + $3,000 MX/hora (2-8 horas)
- **Cena de Gala**: $60/persona + $3,000 MX/hora (3-8 horas)
- **Evento Privado**: $40/persona + $3,000 MX/hora (2-10 horas)
- **Cumpleaños**: $30/persona + $3,000 MX/hora (3-8 horas)
- **Aniversario**: $35/persona + $3,000 MX/hora (3-8 horas)
- **Eventos Personalizados**: $40/persona + $3,000 MX/hora (2-10 horas)

### 🏢 **Sistema de Salones Inteligente**
- **4 Salones Base**: 80 personas cada uno
- **Combinación Flexible**:
  - 1 Salón: Hasta 80 personas
  - 2 Salones: Hasta 200 personas
  - 3 Salones: Hasta 350 personas
  - 4 Salones: Hasta 400 personas
- **Descuento por Combinación**: 20% al fusionar salones

### 💰 **Sistema de Precios Transparente**
- **Tarifa Fija**: $3,000 MX por hora para todos los eventos
- **Precio Base**: Varía según el tipo de evento (por persona)
- **Costos Adicionales**:
  - Salones: $600-$900 por salón
  - Catering: $15 por persona
  - Decoración: $8 por persona
  - Audio/Visual: $5 por persona
  - Setup Especial: $200 (cuando aplique)
- **Calculadora en Tiempo Real**: Ve el precio total mientras llenas el formulario

### ✨ **Nuevo Diseño Innovador**
- **Header Glassmorphism**: Efectos de transparencia y desenfoque modernos
- **Gradientes Animados**: Colores vibrantes y transiciones suaves
- **Tarjetas Interactivas**: Efectos hover y animaciones de escala
- **Estadísticas Visuales**: Dashboard con métricas en tiempo real
- **Iconografía Moderna**: Iconos Lucide con efectos visuales
- **Responsive Design**: Adaptable a todos los dispositivos

## 🎨 **Paleta de Colores Moderna**
- **Azules y Púrpuras**: Gradientes del header y elementos principales
- **Verdes y Esmeraldas**: Estados confirmados y elementos de éxito
- **Ámbar y Naranjas**: Estados pendientes y elementos de advertencia
- **Blancos Transparentes**: Efectos glassmorphism y tarjetas
- **Grises Suaves**: Textos y elementos secundarios

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS, CSS Modules
- **Componentes**: shadcn/ui, Lucide React Icons
- **Efectos**: Glassmorphism, Gradientes, Animaciones CSS
- **Responsive**: Mobile-first design

## 📱 Características del Diseño

### **Glassmorphism y Transparencias**
- Efectos de desenfoque (backdrop-blur)
- Bordes semi-transparentes
- Sombras suaves y elegantes

### **Animaciones y Transiciones**
- Hover effects con escala y sombras
- Transiciones suaves en todos los elementos
- Animaciones de carga y estados

### **Gradientes y Colores**
- Gradientes lineales y radiales
- Paleta de colores moderna y vibrante
- Contrastes optimizados para accesibilidad

## 🚀 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd marlett-reservations
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css          # Estilos globales y efectos
│   ├── layout.tsx           # Layout principal con metadatos
│   └── page.tsx             # Página principal de Marlett
├── components/
│   └── ui/                  # Componentes shadcn/ui
│       ├── button.tsx       # Botones con efectos modernos
│       ├── card.tsx         # Tarjetas glassmorphism
│       ├── input.tsx        # Campos de entrada estilizados
│       └── badge.tsx        # Badges con gradientes
└── lib/
    └── utils.ts             # Utilidades y helpers
```

## 🎯 Funcionalidades Destacadas

### **Dashboard de Estadísticas**
- Contador de reservas activas
- Reservas confirmadas vs pendientes
- Tipos de eventos disponibles
- Métricas en tiempo real

### **Sistema de Reservas**
- Formulario intuitivo y moderno
- Selección visual de tipos de evento
- Validación en tiempo real
- Estados visuales claros

### **Gestión de Reservas**
- Vista de tarjetas elegantes
- Acciones rápidas (editar/eliminar)
- Información detallada de cada evento
- Filtros y búsqueda avanzada

## 🌟 **Innovaciones del Diseño**

### **Efectos Visuales Avanzados**
- **Glassmorphism**: Efectos de cristal y transparencia
- **Gradientes Animados**: Colores que fluyen naturalmente
- **Sombras Dinámicas**: Profundidad y dimensión
- **Transiciones Suaves**: Movimientos fluidos y elegantes

### **Experiencia de Usuario**
- **Interacciones Intuitivas**: Feedback visual inmediato
- **Navegación Clara**: Estructura lógica y organizada
- **Accesibilidad**: Contraste y legibilidad optimizados
- **Responsive**: Adaptable a todos los dispositivos

## 🔧 Personalización

### **Colores y Temas**
- Paleta de colores personalizable
- Gradientes ajustables
- Efectos de transparencia configurables

### **Componentes**
- Sistema de componentes modular
- Estilos CSS reutilizables
- Configuración de Tailwind personalizada

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Tablet**: Adaptación para pantallas medianas
- **Desktop**: Experiencia completa en pantallas grandes
- **Touch Friendly**: Interacciones táctiles optimizadas

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
# Subir carpeta .next a Netlify
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🎉 **Características Destacadas del Nuevo Diseño**

### **Innovación Visual**
- **Glassmorphism**: Efectos de cristal modernos
- **Gradientes Dinámicos**: Colores que fluyen naturalmente
- **Animaciones Suaves**: Transiciones elegantes y fluidas
- **Efectos de Profundidad**: Sombras y capas visuales

### **Experiencia Moderna**
- **Dashboard Interactivo**: Métricas en tiempo real
- **Tarjetas Animadas**: Efectos hover y selección
- **Formularios Inteligentes**: Validación y feedback visual
- **Navegación Intuitiva**: Flujo de usuario optimizado

### **Tecnología de Vanguardia**
- **Next.js 14**: Framework más reciente
- **Tailwind CSS**: Utilidades CSS modernas
- **TypeScript**: Tipado estático robusto
- **Componentes Reutilizables**: Arquitectura modular

---

**Marlett** - Transformando la gestión de eventos con diseño innovador y tecnología de vanguardia. ✨
