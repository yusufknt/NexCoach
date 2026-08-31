'use client'

export default function cloudflareLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const params = [`width=${width}`]
  if (quality) {
    params.push(`quality=${quality}`)
  }
  
  // If the image is already a full URL (e.g. R2 public bucket URL), use it.
  // Otherwise, it might be a relative path.
  // We use Cloudflare Image Resizing format: /cdn-cgi/image/width=...,quality=.../source-image
  
  const paramsString = params.join(',')
  
  return `/cdn-cgi/image/${paramsString}/${src}`
}
