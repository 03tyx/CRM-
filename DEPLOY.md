# ResourceIQ — Deployment Guide

Complete step-by-step to go from zero → live URL in ~15 minutes.

---

## What You Need (all free)

| Tool | Purpose |
|------|---------|
| [Supabase](https://supabase.com) | Database + realtime backend |
| [Vercel](https://vercel.com) | Hosting (free tier is perfect for internal tools) |
| [GitHub](https://github.com) | Code repository (Vercel deploys from here) |
| Node.js 18+ | Local development |

---

## STEP 1 — Set up Supabase (5 min)

1. Go to **https://supabase.com** → Sign up / Log in
2. Click **"New project"**
   - Name: `resourceiq`
   - Password: (save this somewhere)
   - Region: pick closest to your office (e.g. Singapore)
3. Wait ~2 minutes for the project to spin up

4. **Create the database table:**
   - In Supabase sidebar → **SQL Editor** → **New query**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it and click **Run**
   - You should see "Success. No rows returned"

5. **Get your API keys:**
   - Sidebar → **Project Settings** → **API**
   - Copy two values:
     - `Project URL` → looks like `https://abcdefgh.supabase.co`
     - `anon public` key → long string starting with `eyJ...`

---

## STEP 2 — Run locally first (2 min)

```bash
# In the resourceiq folder:
cp .env.example .env
```

Open `.env` and fill in your keys:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then:
```bash
npm install
npm run dev
```

Open http://localhost:5173 — you should see ResourceIQ with the seed data loaded from Supabase.

---

## STEP 3 — Push to GitHub (3 min)

1. Go to **https://github.com/new** → create repo named `resourceiq`
   - Keep it **Private** (internal tool)
   - Don't initialize with README

2. In your terminal:
```bash
git init
git add .
git commit -m "Initial ResourceIQ"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/resourceiq.git
git push -u origin main
```

> ⚠️ Make sure `.env` is in `.gitignore` — it is already. Never commit real keys.

---

## STEP 4 — Deploy to Vercel (3 min)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"** → Import your `resourceiq` repo
3. Vercel auto-detects Vite — no config needed
4. Before clicking Deploy, add **Environment Variables**:
   - Click **"Environment Variables"**
   - Add: `VITE_SUPABASE_URL` = your Supabase URL
   - Add: `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

Done! Vercel gives you a URL like:
```
https://resourceiq-yourname.vercel.app
```

Share this link with your IT team — everyone can open it from any browser, any device.

---

## STEP 5 — Share with your team

1. Send the Vercel URL to all IT members
2. Bookmark it (or add to browser homepage)
3. For biweekly meetings — open it on the projector, use the Timeline tab for the Gantt view

---

## Updating the Team Member List

Open `src/helpers.js` and edit the `IT_MEMBERS` array:

```js
export const IT_MEMBERS = [
  'Ahmad Farid',
  'Siti Nurhaliza',
  // ... add or remove names here
]
```

Then push to GitHub — Vercel auto-deploys in ~30 seconds.

---

## How Realtime Works

All browsers update automatically. If Ahmad updates his task progress on his laptop, your projector screen refreshes within seconds — no manual refresh needed. This uses Supabase Realtime (WebSocket under the hood).

---

## Local Development Workflow

```bash
npm run dev      # start dev server at localhost:5173
npm run build    # build for production (Vercel does this automatically)
npm run preview  # preview production build locally
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Failed to fetch" on load | Check `.env` values are correct, no trailing spaces |
| Tasks not saving | Check Supabase RLS policy — run the SQL again |
| Vercel build fails | Check env vars are set in Vercel dashboard |
| Realtime not updating | Check `supabase_realtime` publication was added in SQL |

---

## Folder Structure

```
resourceiq/
├── src/
│   ├── App.jsx          # Main app, routing between tabs
│   ├── useTasks.js      # Supabase CRUD + realtime hook
│   ├── supabase.js      # Supabase client
│   ├── helpers.js       # Shared utils, constants, DB mappers
│   ├── TaskForm.jsx     # Add/edit task form
│   ├── TaskTable.jsx    # Filterable, sortable task list
│   ├── GanttChart.jsx   # 8-week visual timeline
│   ├── Dashboard.jsx    # KPIs, availability, workload
│   └── main.jsx         # React entry point
├── supabase-schema.sql  # Run this in Supabase SQL editor
├── .env.example         # Copy to .env and fill in keys
├── .gitignore           # Keeps .env out of git
├── index.html
├── vite.config.js
└── package.json
```
