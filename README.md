# ThumbSmith — Frontend (React + TypeScript + Vite)

A tiny, fast frontend for generating YouTube thumbnails against the ThumbGen FastAPI backend.
Built for speed (batching thumbnails) and portfolio clarity.

## Features
- Local **canvas preview** that mirrors server parameters
- **Generate → Preview → Download** flow (shows the returned image before saving)
- Type-safe form (Zod) and clean styling (no CSS framework)
- Works with API returning **image/png** *or* JSON `{ url }`
- Optional Vite **proxy** to avoid CORS in dev

## Tech
- React 18 + TypeScript, Vite, Zod
- Deployment: static files (e.g., Cloudflare Pages)
