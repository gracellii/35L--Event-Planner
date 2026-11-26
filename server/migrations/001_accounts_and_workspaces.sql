-- Stories 1 and 2: user accounts and event workspaces
-- Run after schema.sql. Only adds columns/tables, so it's safe on existing data
-- and safe to run more than once:
--   psql -d event_planner -f server/migrations/001_accounts_and_workspaces.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(60);

-- event_date (from schema.sql) is the day; these are the times
ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME;

-- Who can see each event, and their role
-- (host = creator, collaborator = invited in Story 3, co-host = Story 9)
CREATE TABLE IF NOT EXISTS event_members (
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'collaborator'
        CHECK (role IN ('host', 'co-host', 'collaborator')),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id)
);

-- Existing events that have an owner get that owner as host
INSERT INTO event_members (event_id, user_id, role)
SELECT id, user_id, 'host' FROM events WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;
