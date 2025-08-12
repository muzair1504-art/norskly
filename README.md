# Norskly v6 — A1→B2 Norwegian (Web + Audio)

Norskly is a browser app (website) with:
- A1–B2 units (flashcards, quiz, dialogues, speaking, listening, grammar, reading, writing, conjugation)
- Server text‑to‑speech (OpenAI TTS) with caching and a voice picker
- Dashboard for mastery + SRS (Leitner), XP goals, streaks
- Audio preload per unit

## Local run
```bash
npm i
cp .env.example .env
# put your real key in .env
npm start
# opens http://localhost:3000
```

## Environment
Create an environment variable:
- `OPENAI_API_KEY` — your OpenAI API key (starts with `sk-`)

---

## One‑click deploy (Render)
1. Create a new GitHub repo and push these files.
2. Go to https://render.com → New → **Web Service** → Connect your repo.
3. Settings:
   - **Build Command:** `npm i`
   - **Start Command:** `npm start`
   - **Environment:** Add `OPENAI_API_KEY` (required)
4. Click **Create Web Service** → you get a public URL.

Alternatively, if you prefer **Blueprints**, keep this `render.yaml` in the repo and create from that file.

## Deploy to Glitch (mobile‑friendly)
1. Go to https://glitch.com → New Project → Import from GitHub → paste your repo URL.
2. Tools → **Secrets** → add `OPENAI_API_KEY`.
3. Glitch will auto‑run; if not, open Terminal and run `npm i && npm start`.

## Docker
```bash
docker build -t norskly .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-your-key norskly
# http://localhost:3000
```

## Files
- `server.js` — Express server + TTS + preload endpoint
- `public/` — Frontend (index.html, app.js, lessons.json, audio cache folder auto‑created)
- `render.yaml` — Render blueprint
- `Dockerfile` — container run
- `.env.example` — example env file

---

## What to tell an Agent (copy/paste)
> I have a Node.js website (Norskly v6) ready for GitHub. Please push it to a GitHub repo and deploy it for free using Render (or Glitch). Set the environment variable `OPENAI_API_KEY` with my key. After deploy, send me the public URL.

