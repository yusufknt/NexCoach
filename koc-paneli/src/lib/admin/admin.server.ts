import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedAdminId } from '@/lib/admin/auth'

export type AdminDashboardData = {
  totalCoaches: number
  activeCoaches: number
  inactiveCoaches: number
  totalStudents: number
  activeRelationships: number
  pendingInvitations: number
}

export type AdminCoachListItem = {
  id: string
  fullName: string
  email: string
  accessStatus: 'pending' | 'active' | 'expired' | 'suspended'
  startsAt: string | null
  endsAt: string | null
  studentCount: number
  activeStudentCount: number
  lastSessionAt: number | null
}

export type AdminInvitationListItem = {
  id: string
  fullName: string
  email: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  accessStartsAt: string
  accessEndsAt: string
  expiresAt: string
  createdAt: string
}

export async function getAdminDashboardData(): Promise<AdminDashboardData | null> {
  if (!await getAuthenticatedAdminId()) return null

  const row = await d1.first<{
    total_coaches: number
    active_coaches: number
    inactive_coaches: number
    total_students: number
    active_relationships: number
    pending_invitations: number
  }>(
    `SELECT
      (SELECT COUNT(*) FROM profiles WHERE role = 'coach') AS total_coaches,
      (SELECT COUNT(*) FROM coach_access WHERE status = 'active' AND (starts_at IS NULL OR datetime(starts_at) <= datetime('now')) AND (ends_at IS NULL OR datetime(ends_at) > datetime('now'))) AS active_coaches,
      (SELECT COUNT(*) FROM profiles p LEFT JOIN coach_access ca ON ca.coach_id = p.id
        WHERE p.role = 'coach' AND (ca.coach_id IS NULL OR ca.status != 'active' OR (ca.starts_at IS NOT NULL AND datetime(ca.starts_at) > datetime('now')) OR (ca.ends_at IS NOT NULL AND datetime(ca.ends_at) <= datetime('now')))) AS inactive_coaches,
      (SELECT COUNT(*) FROM profiles WHERE role = 'student') AS total_students,
      (SELECT COUNT(*) FROM coach_students WHERE status = 'active' AND (end_date IS NULL OR end_date >= date('now'))) AS active_relationships,
      (SELECT COUNT(*) FROM coach_invitations WHERE status = 'pending' AND expires_at > datetime('now')) AS pending_invitations`
  )

  if (!row) return null
  return {
    totalCoaches: Number(row.total_coaches),
    activeCoaches: Number(row.active_coaches),
    inactiveCoaches: Number(row.inactive_coaches),
    totalStudents: Number(row.total_students),
    activeRelationships: Number(row.active_relationships),
    pendingInvitations: Number(row.pending_invitations),
  }
}

export async function getAdminCoaches(): Promise<AdminCoachListItem[] | null> {
  if (!await getAuthenticatedAdminId()) return null

  const rows = await d1.query<{
    id: string
    full_name: string
    email: string
    access_status: AdminCoachListItem['accessStatus'] | null
    starts_at: string | null
    ends_at: string | null
    student_count: number
    active_student_count: number
    last_session_at: number | null
  }>(
    `SELECT p.id, p.full_name, u.email,
      COALESCE(ca.status, 'pending') AS access_status,
      ca.starts_at, ca.ends_at,
      COUNT(DISTINCT cs.student_id) AS student_count,
      COUNT(DISTINCT CASE WHEN cs.status = 'active' AND (cs.end_date IS NULL OR cs.end_date >= date('now')) THEN cs.student_id END) AS active_student_count,
      MAX(s.updatedAt) AS last_session_at
    FROM profiles p
    JOIN "user" u ON u.id = p.id
    LEFT JOIN coach_access ca ON ca.coach_id = p.id
    LEFT JOIN coach_students cs ON cs.coach_id = p.id
    LEFT JOIN session s ON s.userId = p.id
    WHERE p.role = 'coach'
    GROUP BY p.id, p.full_name, u.email, ca.status, ca.starts_at, ca.ends_at
    ORDER BY p.created_at DESC`
  )

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    accessStatus: row.access_status ?? 'pending',
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    studentCount: Number(row.student_count),
    activeStudentCount: Number(row.active_student_count),
    lastSessionAt: row.last_session_at == null ? null : Number(row.last_session_at),
  }))
}

export async function getAdminCoachInvitations(): Promise<AdminInvitationListItem[] | null> {
  if (!await getAuthenticatedAdminId()) return null

  const rows = await d1.query<{
    id: string
    full_name: string
    email: string
    status: AdminInvitationListItem['status']
    access_starts_at: string
    access_ends_at: string
    expires_at: string
    created_at: string
  }>(
    `SELECT id, full_name, email,
      CASE WHEN status = 'pending' AND expires_at <= datetime('now') THEN 'expired' ELSE status END AS status,
      access_starts_at, access_ends_at, expires_at, created_at
    FROM coach_invitations
    ORDER BY created_at DESC
    LIMIT 50`
  )

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    status: row.status,
    accessStartsAt: row.access_starts_at,
    accessEndsAt: row.access_ends_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }))
}

export async function getAdminCoachDetail(coachId: string) {
  if (!await getAuthenticatedAdminId()) return null

  const coach = await d1.first<{
    id: string
    full_name: string
    email: string
    bio: string | null
    access_status: AdminCoachListItem['accessStatus'] | null
    starts_at: string | null
    ends_at: string | null
    payment_note: string | null
    created_at: string
  }>(
    `SELECT p.id, p.full_name, u.email, p.bio, p.created_at,
      COALESCE(ca.status, 'pending') AS access_status,
      ca.starts_at, ca.ends_at, ca.payment_note
    FROM profiles p
    JOIN "user" u ON u.id = p.id
    LEFT JOIN coach_access ca ON ca.coach_id = p.id
    WHERE p.id = ? AND p.role = 'coach'
    LIMIT 1`,
    [coachId]
  )
  if (!coach) return null

  const students = await d1.query<{
    id: string
    full_name: string
    email: string
    status: string
    start_date: string
    end_date: string | null
    package_name: string | null
  }>(
    `SELECT p.id, p.full_name, u.email, cs.status, cs.start_date, cs.end_date, pkg.name AS package_name
    FROM coach_students cs
    JOIN profiles p ON p.id = cs.student_id
    JOIN "user" u ON u.id = p.id
    LEFT JOIN packages pkg ON pkg.id = cs.package_id
    WHERE cs.coach_id = ?
    ORDER BY cs.created_at DESC`,
    [coachId]
  )

  return {
    coach: {
      id: coach.id,
      fullName: coach.full_name,
      email: coach.email,
      bio: coach.bio,
      accessStatus: coach.access_status ?? 'pending',
      startsAt: coach.starts_at,
      endsAt: coach.ends_at,
      paymentNote: coach.payment_note,
      createdAt: coach.created_at,
    },
    students: students.map((student) => ({
      id: student.id,
      fullName: student.full_name,
      email: student.email,
      status: student.status,
      startDate: student.start_date,
      endDate: student.end_date,
      packageName: student.package_name,
    })),
  }
}
