export const APP_CONFIG = {
  name: 'NexCoach',
  description: 'Koçluk yönetim platformu',
  version: '1.0.0',
} as const

export const ROUTES = {
  public: {
    home: '/',
    login: '/giris',
    register: '/kayit',
  },
  coach: {
    dashboard: '/coach/dashboard',
    students: '/coach/ogrenciler',
    messages: '/coach/mesajlar',
    calendar: '/coach/takvim',
    settings: '/coach/ayarlar',
  },
  student: {
    dashboard: '/student/dashboard',
    onboarding: '/student/onboarding',
    programs: '/student/programlar',
    progress: '/student/ilerleme',
    reports: '/student/raporlar',
    messages: '/student/mesajlar',
    calendar: '/student/takvim',
    profile: '/student/profil',
  },
} as const

export const CACHE_TAGS = {
  dashboard: 'dashboard',
  students: 'students',
  messages: 'messages',
  calendar: 'calendar',
  programs: 'programs',
  progress: 'progress',
  settings: 'settings',
} as const

export const CACHE_REVALIDATE = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
} as const

export { env, isDev, isProd } from './env'
