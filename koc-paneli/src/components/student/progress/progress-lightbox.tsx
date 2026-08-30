'use client'

import Image from 'next/image'
import { X } from 'lucide-react'

type ProgressLightboxProps = {
  url: string | null
  onClose: () => void
}

export function ProgressLightbox({ url, onClose }: ProgressLightboxProps) {
  if (!url) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md cursor-pointer"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-foreground transition hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="max-w-[90vw] max-h-[85vh] relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Image
          src={url}
          alt="Gelişim fotoğrafı büyük boy"
          width={1200}
          height={900}
          className="max-h-[85vh] w-auto object-contain rounded-lg"
          unoptimized
        />
      </div>
    </div>
  )
}
