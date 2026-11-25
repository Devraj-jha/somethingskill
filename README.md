# SkillPath – Skill Development and Industry Requirements Alignment (SIH26134)

## Run locally
`node server.js` → http://localhost:3000 (Node 18+, no npm install).
Demo logins: student@skillpath.demo / Student@123 · admin@skillpath.demo / Admin@123
Live demo (no login): http://localhost:3000/demo.html

## Deploy on Vercel
1. Push this folder to GitHub (or run `npx vercel` inside it).
2. Import the repo in Vercel. Framework preset: **Other**. No build command. Leave the output directory empty.
3. Add an environment variable `SESSION_SECRET` (any long random string).
Static pages are served from `public/`; `/api/*` is handled by `api/index.js` (same server code).

**Important:** Vercel's filesystem is not persistent. On Vercel the JSON data is kept in `/tmp`, so new accounts and profile edits
can reset after a while. The demo accounts are re-created automatically, and **demo.html needs no backend at all**, so it always works.
For permanent storage, host `server.js` on Render/Railway/a VPS, or swap the load/save helpers in `server.js` for a database (e.g. Vercel Postgres/KV).
