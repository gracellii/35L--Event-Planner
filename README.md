# Event Planner

This collaborative event-planning application helps hosts organize events in one shared workspace. Usually, planning events involves chaotic group chats, lost receipts, and a plethora of folders, documents, and spreadsheets, but our app will centralize the information all on one platform. Instead of juggling group chats, note sheets, spreadsheets, and scattered documents, users can manage event details, coordinate tasks, track expenses, and collaborate with others in one place. 

## Features

### Planned Features
- **User Authentication:** Register and log in to an account.
- **Event Workspaces:** Create and manage individual event workspaces.
- **Collaboration:** Invite other users to collaborate on an event.
- **Itinerary:** Create, edit, and organize event schedules.
- **Task Management:** Create planning checklists, assign tasks, and track their completion.
- **Budget Tracking:** Record expenses and calculate equal cost splits.
- **Supply Lists:** Organize supplies needed for each event.
- **RSVP Tracking:** Track attendee responses and attendance counts.
- **Calendar Overview:** View upcoming events in a calendar.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Database Connection:** Node.js `pg` package
- **Version Control:** Git and GitHub

## To Run the App

### Prerequisites
- Node.js
- npm
- Git
- PostgreSQL

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate into the project directory:

   ```bash
   cd 35l--event-planner
   ```

3. Install backend dependencies:

   ```bash
   npm install
   ```

4. Install frontend dependencies:

   ```bash
   cd client
   npm install
   cd ..
   ```

### Database Setup

For each developer to configure their own PostgreSQL database,

1. Create a PostgreSQL database named `event_planner`.

2. Create a `.env` file in the project root. See `.env.example` as a template.

3. Fill in your own PostgreSQL credentials

4. Initialize the database by running the SQL statements in `server/schema.sql` using pgAdmin or another PostgreSQL client.

5. Create a development event in the `events` table and use its returned ID for `TEST_EVENT_ID` in `server/index.js`.

6. Insert the four default categories into the `categories` table using that event ID.

7. Run the migration for accounts and events. It only adds columns and tables, so it's safe on an existing database:

   ```bash
   psql -d event_planner -f server/migrations/001_accounts_and_workspaces.sql
   ```

8. Add a `JWT_SECRET` line to your `.env` (see `.env.example`). Any long random string works, for example:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```


### Running the Application

From the root directory, run:

```bash
npm run client
```
to start the frontend

```bash
npm run server
```
to start the backend

```bash
npm run dev
```
to run both ends
 
### Running the Tests

The tests use their own database, so they don't touch your data. Create it once, then run them:

```bash
createdb event_planner_test
npm test
```
#### End-to-end tests

The end-to-end tests use [Playwright](https://playwright.dev/) to open a real browser and click through the app: signing up, logging in and out, creating an event, and searching. They start the server and client themselves, using a separate `event_planner_e2e` database. One-time setup:

```bash
createdb event_planner_e2e
npx playwright install chromium
```

Then stop `npm run dev` if it's running, and run:

```bash
npm run test:e2e
```

To watch the browser while the tests run, use `npx playwright test --headed`.

## App Pages

| Page | URL | Story |
|---|---|---|
| Log in / Create account | `/login`, `/register` | 1 (Ananya) |
| Your events (dashboard) | `/dashboard` | 2 (Ananya) |
| Event page | `/events/:id` | 2 (Ananya) |
| Itinerary | `/events/:id/itinerary` | 4 (Natalie) |
| Planning checklist | `/events/:id/planning-checklist` | 5 (Natalie) |
| Budget tracker | `/events/:id/budget` | 6 (Natalie) |
| Supply list | `/events/:id/supplies` | 7 (Grace) |

You need to be logged in to see every page except log in and create account.

## API

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | `{ email, password, name? }` creates an account |
| POST | `/api/auth/login` | `{ email, password }` logs in |
| POST | `/api/auth/logout` | logs out |
| GET | `/api/auth/me` | the logged-in user |
| GET | `/api/events` | the logged-in user's events ;  optional `q` filters by name, location or description |
| POST | `/api/events` | `{ name, date?, startTime?, endTime?, location?, description? }` creates an event, with you as host |
| GET | `/api/events/:id` | one event (404 if you don't have access) |

To require login on a route, add `router.use(requireAuth)` (from `server/middleware/auth.js`). Then `req.user` is the logged-in user. Who can see which event is stored in the `event_members` table.

## Design

The app uses the Pastel Pass design (purple, pastel blue and gold, with the Unbounded and Geist fonts). Colors and fonts are set at the top of `client/src/index.css`. The older variable names like `--text` and `--accent` still work, so existing pages use the new colors automatically.

## Team

Ananya Rai, Natalie Ngo, Mark Rivas, Grace Li