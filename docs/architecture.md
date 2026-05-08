# Feature ROI Prioritisation Tool Architecture

## Summary

This MVP is a static single-page application that lets anyone with the link manage multiple product roadmaps, estimate ROI from operational savings, and keep feature comments in a shared Firestore-backed workspace.

The design goal was minimum complexity with enough structure to make the product believable and extensible. That led to a client-first architecture with a deliberately small data model and centralised business-rule utilities.

## Runtime architecture

### Frontend

- React + Vite single-page app in `client/`
- Tailwind CSS for rapid layout and design system consistency
- Framer Motion for row movement, expansion, and new-item animation
- Recharts for a compact product summary chart

### Persistence

- Firebase Firestore used directly from the browser
- One Firestore collection for products
- One product document contains the product metadata plus its embedded feature list
- Each feature stores its own embedded comments

### Hosting

- GitHub Pages serves the built Vite bundle
- GitHub Actions builds and deploys on pushes to `main`

## Why this data model

The app stores one document per product instead of splitting features and comments across multiple collections.

Why this was chosen for MVP:

- It keeps read logic simple: one product selection gives the whole dashboard payload.
- It avoids additional query orchestration in a static client-only app.
- It is enough for a small, open-link portfolio tool where each product has a modest number of features.

Tradeoff:

- Large product portfolios will eventually need a normalized model with feature subcollections.
- Concurrent edits can overwrite each other at the product-document level because the current implementation rewrites the product’s feature array for simplicity.

That tradeoff is documented explicitly because it is the main architectural simplification in V1.

## UI composition

### `App.jsx`

Owns the top-level product experience:

- data loading mode
- selected product
- sorting state
- editing state

### `usePortfolioData`

Encapsulates data reads and writes:

- Firestore subscription when Firebase config exists
- browser-local demo fallback when Firebase config is missing
- product creation
- feature save and status update
- comment save

### `FeatureForm`

Handles:

- required field entry
- optional "Additional Details" section
- live ROI preview
- create and edit flows

### `FeatureTable`

Handles:

- ongoing and backlog sections
- sorting, search, and filter chips
- row expansion
- inline status changes
- comments
- risk tinting and new-row highlighting

### Utility modules

`src/utils/roi.js`

- contains the implementation cost, savings, breakeven, and ROI score formulas
- centralizes normalization logic so tuning does not require touching components

`src/utils/features.js`

- enriches raw features with computed metrics
- aggregates the summary bar
- filters and sorts table data

`src/utils/format.js`

- keeps all display formatting concerns out of business logic

## ROI score design

The raw values have different scales, so the score is normalized from `1` to `5`.

Current weighting:

- `35%` Monthly Net Savings
- `20%` Yearly Net Savings
- `25%` Breakeven period, where shorter is better
- `10%` Opportunity Cost, if provided
- `10%` Revenue Loss per Month, if provided

Normalization ranges are intentionally pragmatic fixed ranges because the MVP does not yet have enough historical portfolio data to calibrate dynamic benchmarks.

Why it is implemented this way:

- Easy to understand and explain
- Easy to tune later
- Avoids hidden weighting logic scattered across components

## Product summary bar

The summary bar is derived from the selected product’s features on every render.

It shows:

- ongoing feature count
- backlog count
- total monthly hours saved
- total monthly net savings
- total users impacted

These values are not stored separately in Firestore because they are deterministic outputs from the underlying feature list.

## Status-driven section movement

The product keeps a single feature list and derives sections from status:

- ongoing statuses appear in the main ranked table
- backlog statuses appear in the collapsible backlog table

Why this matters:

- changing a status automatically moves the item without additional workflow logic
- rank ordering remains consistent because both sections reuse the same enrichment and sorting pipeline

## Demo mode fallback

When Firebase environment variables are missing, the app loads seeded demo products and writes changes to browser local storage.

Why this exists:

- keeps the repository runnable without requiring immediate Firebase setup
- helps reviewers inspect the UX before configuring external services

The tradeoff is clear in the UI: demo mode is not permanent shared persistence.

## Deployment flow

1. `npm ci`
2. `npm run build --workspace client`
3. Upload `client/dist`
4. Deploy to GitHub Pages

The workflow reads Firebase values from GitHub Actions secrets so the Pages build can connect to the same Firestore project as local development.

## Out-of-scope architecture

Not included in V1:

- auth and role-based permissions
- optimistic concurrency handling
- audit trails
- CSV import/export pipelines
- cross-product reporting views
- backend services or serverless functions

Those are intentionally excluded to keep the MVP fast to ship and cheap to host.
