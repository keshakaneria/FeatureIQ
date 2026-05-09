# Feature ROI Prioritisation Tool

Feature ROI Prioritisation Tool is a table-first MVP for PMs and executives who need to compare feature bets across multiple products using concrete cost, savings, and breakeven data instead of speculative impact guesses.

The app consists of a React frontend and an Express REST API backend using a PostgreSQL database (Neon). If the backend is not reachable, the frontend falls back to a local demo mode using browser `localStorage` so the UI can still be explored.

## MVP scope

- Multi-product dashboards with isolated feature lists per product
- Live product summary bar with counts, time saved, net savings, and users impacted
- Feature form with required and optional sections plus live ROI preview
- Ongoing and backlog tables with sorting, filtering, search, row expansion, comments, and status movement between sections
- PostgreSQL persistence for products, features, and comments
- Express.js REST API backend

## Tech stack

- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React
- **Backend:** Express.js, PostgreSQL (via `pg` driver)
- **Database:** Neon Postgres

## Local setup

To run the application locally, you need to set up both the backend server and the frontend client.

### 1. Database Setup

1. Create a free PostgreSQL database on [Neon](https://console.neon.tech).
2. Copy your connection string (it looks like `postgresql://username:password@ep-...neon.tech/neondb?sslmode=require`).

### 2. Backend Setup

Open a terminal and set up the server:

1. Change directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create the environment file:
   ```bash
   cp .env.example .env
   ```

3. Open `server/.env` and paste your Neon connection string:
   ```
   DATABASE_URL=postgresql://username:password@...
   PORT=3001
   ```

4. Run the database migrations to create the tables:
   ```bash
   npm run migrate
   ```

5. (Optional) Seed the database with demo data:
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3001`.

### 3. Frontend Setup

Open a **new terminal window** and set up the client:

1. Change directory and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Start the frontend client:
   ```bash
   npm run dev
   ```

3. Open your browser:
   ```text
   http://localhost:5173
   ```
   *Note: In development, Vite automatically proxies `/api` requests to the backend at `localhost:3001`.*

If the backend is not running or unreachable, the frontend will show "Local Demo Mode" and use browser persistence only. When connected to the backend, it will show "Cloud Sync Active".

## Architecture notes

- The database schema is fully normalized into three tables: `products`, `features`, and `comments`.
- All database interactions go through a clean REST API in the Express backend.
- ROI scoring is centralized in a single utility in the frontend so weights can be tuned later.
- Comments are anonymous by design and only ask for free-text author names.
- The app is optimized for comparison speed on desktop first, but remains usable on mobile through horizontal table scrolling and stacked form sections.

## Out of scope for V1

- Authentication
- Email notifications
- Slack or Jira integrations
- CSV import
- Cross-product comparison views
- AI-generated prioritisation suggestions
