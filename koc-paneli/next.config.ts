import type { NextConfig } from 'next'

import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudflare-image-loader.ts',
  },
}

export default nextConfig
