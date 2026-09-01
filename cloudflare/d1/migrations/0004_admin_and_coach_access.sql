PRAGMA foreign_keys = ON;

-- Admins are kept outside profiles so the existing coach/student role constraint
-- and its foreign-key relationships remain untouched.
CREATE TABLE IF NOT EXISTS admins (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS coach_access (
  coach_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'suspended')),
  starts_at TEXT,
  ends_at TEXT,
  payment_note TEXT,
  activated_by_admin_id TEXT REFERENCES admins(user_id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_coach_access_status ON coach_access(status);
CREATE INDEX IF NOT EXISTS idx_coach_access_ends_at ON coach_access(ends_at);

-- Existing coaches keep working after this migration. Admin can set an expiry later.
INSERT OR IGNORE INTO coach_access (coach_id, status, starts_at)
SELECT id, 'active', created_at
FROM profiles
WHERE role = 'coach';

CREATE TABLE IF NOT EXISTS coach_invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  full_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  access_starts_at TEXT NOT NULL,
  access_ends_at TEXT NOT NULL,
  payment_note TEXT,
  invited_by_admin_id TEXT NOT NULL REFERENCES admins(user_id) ON DELETE RESTRICT,
  accepted_by_coach_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_coach_invitations_status ON coach_invitations(status);
CREATE INDEX IF NOT EXISTS idx_coach_invitations_email ON coach_invitations(email);
CREATE INDEX IF NOT EXISTS idx_coach_invitations_expires_at ON coach_invitations(expires_at);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES admins(user_id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
