-- NexCoach D1 Schema Migration
-- PostgreSQL → SQLite/D1 uyumlu dönüşüm
-- 11 tablo, tüm ilişkiler korunmuş

PRAGMA foreign_keys = ON;

-- ============================================
-- 1. profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coach', 'student')),
  avatar_url TEXT,
  bio TEXT,
  notification_preferences TEXT DEFAULT '{"emailOnMessage":true,"emailOnNewStudent":true,"emailReminderBefore24h":true}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- 2. packages
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  duration_days INTEGER NOT NULL,
  features TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_packages_coach_id ON packages(coach_id);

-- ============================================
-- 3. coach_students
-- ============================================
CREATE TABLE IF NOT EXISTS coach_students (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id TEXT REFERENCES packages(id) ON DELETE SET NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE(coach_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_students_coach_id ON coach_students(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_students_student_id ON coach_students(student_id);

-- ============================================
-- 4. progress_entries
-- ============================================
CREATE TABLE IF NOT EXISTS progress_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight REAL,
  note TEXT,
  custom_metrics TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_progress_entries_student_id ON progress_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_coach_id ON progress_entries(coach_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON progress_entries(date);

-- ============================================
-- 5. programs
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_programs_coach_id ON programs(coach_id);
CREATE INDEX IF NOT EXISTS idx_programs_student_id ON programs(student_id);

-- ============================================
-- 6. messages
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ============================================
-- 7. calendar_events
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  event_type TEXT DEFAULT 'available' CHECK (event_type IN ('available', 'session', 'blocked')),
  meeting_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_coach_id ON calendar_events(coach_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- ============================================
-- 8. payments
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id TEXT REFERENCES packages(id) ON DELETE SET NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'TRY',
  payment_provider TEXT,
  provider_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending', 'refunded')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_coach_id ON payments(coach_id);

-- ============================================
-- 9. monthly_reports
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_reports (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_month TEXT NOT NULL,
  coach_comment TEXT,
  is_published INTEGER DEFAULT 0 NOT NULL,
  pdf_path TEXT,
  metrics_summary TEXT DEFAULT '{}' NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE(student_id, report_month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_reports_student_id ON monthly_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_coach_id ON monthly_reports(coach_id);

-- ============================================
-- 10. student_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  student_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  height_cm REAL,
  birth_date TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  experience TEXT CHECK (experience IN ('beginner', '1-3years', '3plus')),
  goal TEXT CHECK (goal IN ('muscle_gain', 'fat_loss', 'recomposition', 'strength')),
  initial_weight REAL,
  chest_cm REAL,
  waist_cm REAL,
  hip_cm REAL,
  neck_cm REAL,
  right_upper_arm_cm REAL,
  left_upper_arm_cm REAL,
  right_thigh_cm REAL,
  left_thigh_cm REAL,
  right_calf_cm REAL,
  left_calf_cm REAL,
  body_fat_percentage REAL,
  photo_front_path TEXT,
  photo_side_path TEXT,
  photo_back_path TEXT,
  injuries TEXT,
  supplements TEXT,
  onboarding_completed INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);

-- ============================================
-- 11. invitations
-- ============================================
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
  coach_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id TEXT REFERENCES packages(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  email TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_invitations_coach_id ON invitations(coach_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
