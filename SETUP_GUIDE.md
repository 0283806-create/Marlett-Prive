# Quick Setup Guide

Follow these steps to get your reservation system up and running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** > **API** and copy:
   - Project URL
   - Anon Public Key

## Step 3: Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Reservation System
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Supabase Auth

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **GitHub**
3. Paste your GitHub Client ID and Client Secret
4. Save

## Step 5: Create Database Table

In Supabase, go to **SQL Editor** and run:

```sql
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

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservations"
  ON reservations FOR DELETE
  USING (auth.uid() = user_id);

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

## Step 6: Update app.js

Open `app.js` and replace these lines:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual credentials from Step 2.

## Step 7: Run the App

```bash
npm run dev
```

Your app will open at http://localhost:5173

## Step 8: Test It Out!

1. Click "Sign in with GitHub"
2. Authorize the application
3. Create your first reservation
4. Filter and manage your reservations

## Troubleshooting

**Can't sign in with GitHub?**
- Check that callback URL is exactly: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
- Verify GitHub OAuth settings in Supabase

**No reservations showing?**
- Make sure you ran all the SQL commands
- Check browser console for errors

**Database errors?**
- Verify RLS policies were created
- Check that table exists in Supabase

## Next Steps

- Deploy to Vercel or Netlify
- Customize the design
- Add more features!

Happy coding! 🚀

