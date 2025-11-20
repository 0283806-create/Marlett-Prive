# GitHub OAuth Setup Guide

## Step 1: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"** button (top right)
3. Fill in the form:

   **Application name**: `Reservation_Marlett` (or any name you like)
   
   **Homepage URL**: `http://localhost:5173`
   
   **Authorization callback URL**: `https://svserlrkymykmabvjclh.supabase.co/auth/v1/callback`
   
   ⚠️ **IMPORTANT**: The callback URL must be EXACTLY as shown above

4. Click **"Register application"**

5. Copy these two values:
   - **Client ID** (you'll see this immediately)
   - **Client Secret** (click "Generate a new client secret" if not shown)

## Step 2: Configure in Supabase

1. Go back to your Supabase project
2. Click on **"Authentication"** in the left sidebar
3. Click on **"Providers"** tab
4. Find **"GitHub"** in the list
5. Click to enable it
6. Paste your **Client ID** and **Client Secret** from Step 1
7. Click **"Save"**

## Step 3: Test the Setup

1. Run your app:
   ```bash
   npm install
   npm run dev
   ```

2. Open http://localhost:5173 in your browser
3. Click "Sign in with GitHub"
4. Authorize the app
5. You should be logged in! 🎉

## Need Help?

If you get an error, check:
- The callback URL is EXACTLY: `https://svserlrkymykmabvjclh.supabase.co/auth/v1/callback`
- GitHub OAuth is enabled in Supabase
- You copied the Client ID and Secret correctly
- The database table was created successfully

