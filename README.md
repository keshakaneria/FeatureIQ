# Feature ROI Prioritisation Tool

Feature ROI Prioritisation Tool is a table-first MVP for PMs and executives who need to compare feature bets across multiple products using concrete cost, savings, and breakeven data instead of speculative impact guesses.

The app has:

- a React + Vite frontend in `client/`
- a Hono API in `server/`
- a Neon Postgres database
- Cloudflare as the intended deployment target:
  the frontend is designed for Cloudflare Pages and the API for Cloudflare Workers

If the backend is not reachable, the frontend falls back to a local demo mode using browser `localStorage` so the UI can still be explored.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Hono
- Database: Neon Postgres
- Deployment: Cloudflare Pages + Cloudflare Workers

## Local setup

### 1. Database setup

1. Create a PostgreSQL database in [Neon](https://console.neon.tech).
2. Copy the connection string.

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `server/.env`, then run:

```bash
npm run migrate
npm run dev
```

The local API runs on `http://localhost:3001`.

### 3. Frontend setup

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

In development, Vite proxies `/api` requests to `http://localhost:3001`.

## Cloudflare deployment

### API: Cloudflare Workers

1. Install dependencies in `server/`.
2. Authenticate Wrangler:
   ```bash
   npx wrangler login
   ```
3. Add the production database secret:
   ```bash
   cd server
   npx wrangler secret put DATABASE_URL
   ```
4. Deploy the API:
   ```bash
   npm run deploy
   ```

After deploy, note the Worker URL, such as `https://featureiq-api.<subdomain>.workers.dev`.

### Frontend: Cloudflare Pages

Create a Cloudflare Pages project with:

- Root directory: `client`
- Build command: `npm run build`
- Build output directory: `dist`

Set this environment variable in Pages:

```text
VITE_API_URL=https://featureiq-api.<subdomain>.workers.dev
```

The repo includes `client/public/_redirects` so SPA routes resolve correctly on Pages.

## Notes

- The backend uses the same Neon database locally and in Cloudflare.
- `client/src/config/api.js` uses `VITE_API_URL` in production and relative `/api` calls in local dev.
- Vite now builds with root-relative asset paths, which is safer for Cloudflare Pages SPA routing than the old GitHub Pages-style relative base.
