# Feature ROI Prioritisation Tool

Feature ROI Prioritisation Tool is a table-first MVP for PMs and executives who need to compare feature bets across multiple products using concrete cost, savings, and breakeven data instead of speculative impact guesses.

The app is built as a static React application hosted on GitHub Pages, with Firebase Firestore used directly from the client for persistent shared data. When Firebase variables are not configured, the app falls back to a local demo mode so the UI can still be explored immediately.

## MVP scope

- Multi-product dashboards with isolated feature lists per product
- Live product summary bar with counts, time saved, net savings, and users impacted
- Feature form with required and optional sections plus live ROI preview
- Ongoing and backlog tables with sorting, filtering, search, row expansion, comments, and status movement between sections
- Firestore persistence for products, features, and comments
- GitHub Pages deployment through GitHub Actions

## Tech stack

- React + Vite
- Tailwind CSS
- Firebase Firestore
- Framer Motion
- Recharts
- Lucide React
- GitHub Pages + GitHub Actions

## Local setup

1. Change dir and Install dependencies:

   ```bash
   cd client
   npm install
   ```

2. Copy the client environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in your Firebase web app variables in `.env`.

4. Start the client:

   ```bash
   npm run dev
   ```

5. Open:

   ```text
   http://localhost:5173
   ```

If Firebase is not configured, the app runs in demo mode with browser-local persistence only.

## Firebase setup

1. Create a Firebase project on the free tier.
2. Enable Firestore in production or test mode depending on your evaluation needs.
3. Create a Web App in Firebase and copy the config values into `.env`.
4. Add the same values as GitHub repository secrets for the deploy workflow:
   `VITE_FIREBASE_API_KEY`
   `VITE_FIREBASE_AUTH_DOMAIN`
   `VITE_FIREBASE_PROJECT_ID`
   `VITE_FIREBASE_STORAGE_BUCKET`
   `VITE_FIREBASE_MESSAGING_SENDER_ID`
   `VITE_FIREBASE_APP_ID`
   `VITE_FIRESTORE_PRODUCTS_COLLECTION`

Recommended Firestore rule for an open-link MVP:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /roiProducts/{document=**} {
      allow read, write: if true;
    }
  }
}
```

This is intentionally open because V1 has no authentication. Tighten it before any production usage with sensitive data.

## Build and deploy

- Local build:

  ```bash
  npm run build --workspace client
  ```

- Local lint:

  ```bash
  npm run lint --workspace client
  ```

- Automatic deploy:
  Push to `main` and the GitHub Actions workflow in [`.github/workflows/deploy.yml`](/Users/keshakaneria/Documents/New%20project/.github/workflows/deploy.yml) builds `client/dist` and publishes it to GitHub Pages.

## Architecture notes

Detailed architecture and tradeoff documentation lives in [docs/architecture.md](/Users/keshakaneria/Documents/New%20project/docs/architecture.md).

## Important MVP decisions

- Firestore stores one document per product with the product feature list embedded. This keeps the client simple and is enough for a lightweight portfolio MVP.
- ROI scoring is centralized in a single utility so weights can be tuned later without rewriting the UI.
- Comments are anonymous by design and only ask for free-text author names.
- The app is optimized for comparison speed on desktop first, but remains usable on mobile through horizontal table scrolling and stacked form sections.

## Out of scope for V1

- Authentication
- Email notifications
- Slack or Jira integrations
- CSV import
- Cross-product comparison views
- AI-generated prioritisation suggestions
