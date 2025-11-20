# Setup Guide for Marlett Reservations

## ✅ Quick Setup

### Step 1: Database Setup

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Create a **New Query**
4. Copy and paste the ENTIRE content of `database.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### Step 2: Install Dependencies (if not done already)

```bash
npm install
```

### Step 3: Run the App

```bash
npm run dev
```

The app will open at **http://localhost:5173**

### Step 4: Test It!

1. Fill out the reservation form
2. Click "Vista previa" to preview your data
3. Click "Enviar solicitud" to submit
4. You should see a success message ✅

### Step 5: View Your Data

1. Go to your Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. Click on **reservations** table
4. See all your submitted reservations! 🎉

## 📊 Database Fields

Your reservations table stores:

**Contact Info:**
- `name` - Full name
- `phone` - Phone/WhatsApp
- `email` - Email (optional)

**Event Details:**
- `date` - Event date
- `time` - Start time
- `guests` - Number of guests
- `event_type` - Type of event (Boda, XV, Cumpleaños, etc.)
- `venue_area` - Preferred area

**Audio/Visual:**
- `needs_av` - Yes/No/Not sure
- `av_items` - Selected AV items
- `av_notes` - AV details

**Media:**
- `media_interest` - Interest in photo/video
- `media_notes` - Media requirements

**Other:**
- `notes` - Additional notes
- `status` - Reservation status (default: 'upcoming')
- `created_at` - Submission timestamp
- `updated_at` - Last update timestamp

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub (already done!)
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Click Deploy
5. Done! 🎉

### Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Import from Git → GitHub
3. Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click Deploy!

## 🔒 Security

- **Public form submissions** - Anyone can submit a reservation
- **No authentication required** - Perfect for a public reservation form
- **Supabase RLS** - Enabled for future admin features
- **Anti-bot honeypot** - Built into the form

## 💡 Next Steps

Consider adding:
- Email notifications on new reservations
- WhatsApp integration for confirmations
- Admin dashboard to manage reservations
- Calendar view of all events
- Export reservations to CSV

## 🆘 Troubleshooting

**Form submission fails?**
- Check browser console for errors
- Verify database table was created
- Check Supabase credentials in `app.js`

**Database error?**
- Make sure you ran the SQL from `database.sql`
- Check that table exists in Table Editor
- Verify RLS policies are set

**Can't see reservations?**
- Refresh Supabase Table Editor
- Check for JavaScript errors in console
- Verify data was actually inserted

## 📞 Need Help?

Check the browser console (F12) for any errors and share them if you need assistance!

