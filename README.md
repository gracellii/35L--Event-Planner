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

7. Run the accounts and events migration (adds user names, event location and times, and the `event_members` table for host and collaborator roles). It only adds to the tables, so it's safe on an existing database:

   ```bash
   psql -d event_planner -f server/migrations/001_accounts_and_workspaces.sql
   ```

8. Add `JWT_SECRET` to your `.env` (see `.env.example`). Any long random string works:

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

The account and event tests use a separate database so they never touch your data. Create it once, then run the tests:

```bash
createdb event_planner_test
npm test
```

## App Pages

| Page | URL | Story |
|---|---|---|
| Log in / Create account | `/login`, `/register` | 1 (Ananya) |
| Your events (dashboard) | `/dashboard` | 2 (Ananya) |
| Event page | `/events/:id` | 2 (Ananya), with cards for Stories 3–8 |
| Itinerary | `/events/:id/itinerary` | 4 (Natalie) |
| Planning checklist | `/events/:id/planning-checklist` | 5 (Natalie) |
| Budget tracker | `/events/:id/budget` | 6 (Natalie) |
| Supply list | `/events/:id/supplies` | 7 (Grace) |

All pages except log in and create account require being logged in.

## API

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | `{ email, password, name? }` creates an account |
| POST | `/api/auth/login` | `{ email, password }` logs in (sets an httpOnly cookie) |
| POST | `/api/auth/logout` | logs out |
| GET | `/api/auth/me` | the logged-in user |
| GET | `/api/events` | the logged-in user's events |
| POST | `/api/events` | `{ name, date?, startTime?, endTime?, location?, description? }` creates an event; the creator becomes its host |
| GET | `/api/events/:id` | one event (404 if you don't have access) |

To require login in other routes: `const { requireAuth } = require('./middleware/auth')`, then `router.use(requireAuth)` gives you `req.user`. To check access to an event: `const { canAccessEvent } = require('./routes/events')` returns the user's role (`'host'`, `'co-host'`, `'collaborator'`) or `null`.

## Design

The app uses the **Pastel Pass** design: purple `#4F4766`, pastel blue, soft gold, with Unbounded and Geist fonts (bundled, no internet needed). All colors and fonts are variables at the top of `client/src/index.css`. The original variable names (`--text`, `--accent`, `--border`, ...) still work and point at the new colors. Use the line icons in `client/src/components/Icons.jsx` rather than emoji.

## Team

Ananya Rai, Natalie Ngo, Mark Rivas, Grace Li