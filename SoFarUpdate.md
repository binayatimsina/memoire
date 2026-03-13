# 💌 Memoire

A private social web app where two people share moments — a photo and a note — that get collected into a beautiful year-end memory book.

---

## 🌐 Live App

Deployed on Vercel — auto deploys on every push to `main`.

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL) |
| Image Storage | Supabase Storage |
| Hosting | Vercel |
| CI/CD | GitHub → Vercel (auto deploy) |

---

## 📁 Project Structure

```
memoire/
  app/
    page.js                   → Redirects to /login
    login/page.js             → Sign up & login page
    onboarding/page.js        → Set display name after signup
    home/page.js              → Main shared feed (server component)
    connect/
      invite/page.js          → Generate & share invite link
      [code]/page.js          → Accept an invite
    moment/
      new/page.js             → Post a new photo + note
  components/
    HomeClient.js             → Interactive home feed
    MomentCard.js             → Individual moment display card
  lib/
    supabase/
      client.js               → Browser Supabase client
      server.js               → Server Supabase client
  middleware.js               → Protects private routes
```

---

## 🗄️ Database Schema

### `profiles`
| Column | Type | Description |
|---|---|---|
| id | uuid | References auth.users |
| display_name | text | User's display name |
| bio | text | Short bio (optional) |
| avatar_url | text | Profile photo URL |
| updated_at | timestamp | Last updated |

### `connections`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| sender_id | uuid | User who sent the invite |
| receiver_id | uuid | User who accepted the invite |
| invite_code | text | Unique 8-char code |
| status | text | pending / active / disconnected |
| created_at | timestamp | Created date |
| expires_at | timestamp | 72 hours after creation |

### `moments`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| connection_id | uuid | References connections |
| author_id | uuid | References profiles |
| photo_url | text | Public image URL |
| note | text | Written note (max 300 chars) |
| created_at | timestamp | Posted date |

---

## ✅ Phase 1 Features

### Authentication
- Sign up and log in with email and password
- Auto profile creation on sign up
- Onboarding screen to set display name
- Protected routes — unauthenticated users redirected to login

### Connection System
- Generate a unique invite code and shareable link
- Invite expires after 72 hours
- Partner accepts via the link
- One active connection per user enforced

### Moment Posting
- Upload a photo from device or camera
- Image compressed before upload to save storage
- Write a note up to 300 characters
- Saved to database with timestamp and author info

### Shared Feed
- Both partners see the same feed
- Moments shown in reverse chronological order
- Each card shows photo, note, author name and date

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only see their own connection's moments
- Storage policies so only authenticated users can upload

---

## 🚀 Getting Started Locally

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/memoire.git
cd memoire
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file at the root of the project:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in **Supabase → Settings → API**.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

This app is deployed on **Vercel** with automatic deployments on every push to `main`.

To deploy manually:
1. Push your code to GitHub
2. Vercel detects the push and builds automatically
3. Live site updates in ~2 minutes

---

## 🗺️ Roadmap

### Phase 2 — Engagement
- [ ] Email/push notifications when partner posts
- [ ] Emoji reactions to moments
- [ ] Monthly recap cards
- [ ] Streaks for consistent sharing

### Phase 3 — Memory Book
- [ ] Generate a PDF of all moments from the year
- [ ] Cover page with both names and year
- [ ] One moment per page — photo, note, and date
- [ ] Download or share the PDF

### Phase 4 — Native Mobile
- [ ] React Native app
- [ ] Camera access and home screen widget
- [ ] Local push notifications

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase client |
| `@supabase/ssr` | Supabase SSR support for Next.js |
| `browser-image-compression` | Compress images before upload |
| `uuid` | Generate unique IDs |