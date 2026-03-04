# Reservation System

A modern, full-featured web application for managing reservations with Supabase and GitHub OAuth integration.

## Features

- 🔐 **GitHub OAuth Authentication** - Sign in with your GitHub account
- 📅 **Reservation Management** - Create, view, and delete reservations
- 👥 **Guest Management** - Track number of guests for each reservation
- 📝 **Notes & Special Requests** - Add custom notes to reservations
- 🎨 **Modern UI** - Beautiful, responsive design
- 🚀 **Real-time Updates** - Instant feedback with toast notifications
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Supabase (Database + Authentication)
- **Authentication**: GitHub OAuth via Supabase Auth
- **Build Tool**: Vite

## Prerequisites

Before you begin, ensure you have the following:

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account ([sign up here](https://supabase.com))
- A GitHub account for OAuth

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Reservaciones
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** > **API** to get your credentials
3. Copy `URL` and `anon public` key

### 4. Configure GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: Reservation System (or your choice)
   - **Homepage URL**: Your deployed URL or `http://localhost:5173`
   - **Authorization callback URL**: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**

### 5. Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **GitHub** provider
3. Enter your GitHub **Client ID** and **Client Secret**
4. Save the configuration

### 6. Create Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  notes TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own reservations
CREATE POLICY "Users can view own reservations"
  ON reservations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can only create their own reservations
CREATE POLICY "Users can create own reservations"
  ON reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can only delete their own reservations
CREATE POLICY "Users can delete own reservations"
  ON reservations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 7. Configure Environment Variables

Update the `app.js` file with your Supabase credentials:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

Replace:
- `YOUR_SUPABASE_URL` with your Supabase project URL
- `YOUR_SUPABASE_ANON_KEY` with your Supabase anon public key

### 8. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Deployment

### Deploy with Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Vercel will automatically detect and deploy your app
4. Update your GitHub OAuth callback URL to your Vercel URL

### Deploy with Netlify

1. Build your project: `npm run build`
2. Push your code to GitHub
3. Go to [Netlify](https://netlify.com) and import your repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Update your GitHub OAuth callback URL to your Netlify URL

## Project Structure

```
Reservaciones/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js              # Main JavaScript application
├── package.json        # Dependencies and scripts
├── README.md           # This file
└── .gitignore          # Git ignore file
```

## Usage

1. **Sign In**: Click "Sign in with GitHub" and authorize the application
2. **Create Reservation**: Fill in the form with reservation details
3. **View Reservations**: See all your reservations in the list
4. **Filter Reservations**: Use the dropdown to filter by status
5. **Delete Reservation**: Click the delete button to remove a reservation

## Security

- All reservations are secured with Row Level Security (RLS)
- Users can only access their own reservations
- GitHub OAuth provides secure authentication
- All data is encrypted in transit via HTTPS

## Troubleshooting

### GitHub OAuth not working

- Verify your callback URL is correct in GitHub OAuth app settings
- Ensure your callback URL matches exactly: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
- Check that GitHub provider is enabled in Supabase Auth settings

### Can't see reservations

- Verify RLS policies are created correctly
- Check browser console for errors
- Ensure you're signed in with GitHub

### Database errors

- Verify the `reservations` table exists
- Check that all columns are created correctly
- Ensure your Supabase credentials are correct in `app.js`

## Dominios y redirecciones (Vercel)

1. En Vercel, abre tu proyecto `salon_de_eventos_marlett`.
2. Ve a **Settings → Domains** y haz clic en **Add Domain**.
3. Ingresa tu dominio principal (por ejemplo, `marlettprive.mx`) y confírmalo.
4. Cuando esté verificado, selecciónalo y elige **Set as Primary** para el entorno **Production**.
5. Agrega el dominio anterior (por ejemplo, `eventosmarlett.mx`) y en las acciones selecciona **Redirect to another domain**.
6. Configura el redireccionamiento como **301 Permanent** hacia el dominio principal nuevo.
7. Actualiza los registros DNS en tu proveedor para apuntar a los registros proporcionados por Vercel.
8. Añade o actualiza la variable `VITE_SITE_URL` en **Settings → Environment Variables** (Production y Preview) con la URL canónica, por ejemplo `https://marlettprive.mx`.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes.

## Support

If you encounter any issues, please check the troubleshooting section or open an issue on GitHub.

