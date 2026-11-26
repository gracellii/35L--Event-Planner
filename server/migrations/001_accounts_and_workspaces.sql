-- Stories 1 & 2 (Ananya): user accounts and event workspaces.
--
-- Run this AFTER server/schema.sql. It only ADDS to the existing tables, so
-- it is safe to run on a database that already has data, and safe to run
-- more than once.
--
--   psql -d event_planner -f server/migrations/001_accounts_and_workspaces.sql

-- Display name shown in the header ("Hey Ananya.")
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(60);

-- Event details shown on the dashboard and event page.
-- events.event_date (from schema.sql) holds the day; these hold the times.
-- start/end times are also what the calendar export (Story 11) needs.
ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME;

-- Who has access to each event, and their role:
--   'host'         created the event, full control (Story 2)
--   'collaborator' invited planning team member (Story 3)
--   'co-host'      collaborator who can also edit event details (Story 9)
CREATE TABLE IF NOT EXISTS event_members (
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'collaborator'
        CHECK (role IN ('host', 'co-host', 'collaborator')),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id)
);

-- Events that already exist (e.g. the dev/test event) get their creator as host.
INSERT INTO event_members (event_id, user_id, role)
SELECT id, user_id, 'host' FROM events WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;
