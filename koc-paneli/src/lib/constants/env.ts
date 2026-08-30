export const env = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
} as const

export const isDev = env.app.nodeEnv === 'development'
export const isProd = env.app.nodeEnv === 'production'
