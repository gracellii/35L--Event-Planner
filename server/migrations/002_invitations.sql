-- Story 3: invite event collaborators
CREATE TABLE IF NOT EXISTS invitations (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  invitee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Only one pending invite per person per event
CREATE UNIQUE INDEX IF NOT EXISTS one_pending_invite
  ON invitations (event_id, invitee_id) WHERE status = 'pending';