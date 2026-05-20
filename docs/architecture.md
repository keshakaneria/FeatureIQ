# Feature ROI Prioritisation Tool Architecture

## Summary

This product is a single-page frontend backed by a lightweight REST API and a normalized PostgreSQL schema.

The current deployment target is Cloudflare:

- `client/` is intended for Cloudflare Pages
- `server/` is intended for Cloudflare Workers
- Neon provides the shared Postgres database

The design goal is still MVP simplicity, but with clearer separation between UI, API, and persistence than the older static-only approach.

## Runtime architecture

### Frontend

- React + Vite SPA in `client/`
- Tailwind CSS for layout and styling
- Framer Motion for interaction polish
- Recharts for product summary visualization

The frontend talks to the API through `client/src/config/api.js`.

- In local development it uses relative `/api` calls and Vite proxies them to `localhost:3001`
- In production it uses `VITE_API_URL`

### API

- Hono application in `server/src/app.js`
- Local Node server entrypoint in `server/src/index.js`
- Cloudflare Worker entrypoint via `server/wrangler.toml`

The API exposes:

- `GET /api/health`
- `GET /api/products`
- `POST /api/products`
- `DELETE /api/products/:id`
- `POST /api/products/:productId/features`
- `PATCH /api/features/:featureId/status`
- `POST /api/features/:featureId/comments`
- `DELETE /api/features/:id`
- `DELETE /api/comments/:id`

### Persistence

- Neon Postgres stores products, features, and comments
- The API uses SQL directly rather than an ORM
- Cloudflare Workers and local Node both use the same `DATABASE_URL`

## Data model

The schema is normalized into three tables:

- `products`
- `features`
- `comments`

Why this shape works for the product:

- product metadata stays simple
- features can be queried and updated independently
- comments do not bloat feature rows

The API assembles the nested client payload on read, which keeps the frontend model ergonomic without denormalizing storage.

## UI composition

### `App.jsx`

Owns the top-level product dashboard, layout state, and footer.

### `usePortfolioData`

Coordinates:

- loading product data
- fallback demo mode
- saving features and comments
- deleting records
- product selection flow

### `FeatureForm`

Handles feature creation/editing and live ROI preview.

### `FeatureTable`

Handles ranking, sections, comments, search, and status changes.

## Demo mode fallback

When the API cannot be reached, the frontend falls back to browser `localStorage`.

This keeps the product explorable even before infrastructure is configured, while making the distinction visible in the UI.

## Deployment model

### Cloudflare Workers

The API is deployed from `server/` using Wrangler.

- `wrangler.toml` points at `src/app.js`
- `DATABASE_URL` is provided as a Cloudflare secret
- the Worker connects directly to Neon

### Cloudflare Pages

The frontend is deployed from `client/`.

- build command: `npm run build`
- output directory: `dist`
- SPA routing is handled by `client/public/_redirects`
- `VITE_API_URL` points at the deployed Worker

## Tradeoffs

- Direct SQL keeps the backend small, but query logic is hand-maintained.
- The API reconstructs nested products in memory, which is fine for MVP-sized datasets but may need pagination later.
- Demo mode improves accessibility for reviewers, but it is intentionally not collaborative persistence.

## Out of scope

- authentication and authorization
- optimistic concurrency controls
- audit history
- CSV import/export
- cross-product analytics views
- AI-generated prioritisation recommendations
