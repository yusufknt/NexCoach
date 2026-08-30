'use client'

import { useState, useRef } from 'react'
import { Camera, X, Trash2, Loader2 } from 'lucide-react'
import { SectionCard } from './profile-info-cards'
import { useToast } from '@/components/ui/toast-provider'
import { updateStudentOnboardingPhoto, deleteStudentOnboardingPhoto } from '@/lib/student/onboarding-actions'

type ProfilePhotosCardProps = {
  initialFrontPhoto: string | null
  initialSidePhoto: string | null
  initialBackPhoto: string | null
  isEditable?: boolean
}

export function ProfilePhotosCard({
  initialFrontPhoto,
  initialSidePhoto,
  initialBackPhoto,
  isEditable = false,
}: ProfilePhotosCardProps) {
  const { showToast } = useToast()

  const [frontPhoto, setFrontPhoto] = useState<string | null>(initialFrontPhoto)
  const [sidePhoto, setSidePhoto] = useState<string | null>(initialSidePhoto)
  const [backPhoto, setBackPhoto] = useState<string | null>(initialBackPhoto)

  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingSide, setUploadingSide] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)

  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; label: string } | null>(null)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const sideInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0]
    if (!file) return

    const setUploading = kind === 'front' ? setUploadingFront : kind === 'side' ? setUploadingSide : setUploadingBack
    const setPhoto = kind === 'front' ? setFrontPhoto : kind === 'side' ? setSidePhoto : setBackPhoto
    const label = kind === 'front' ? 'Ön' : kind === 'side' ? 'Yan' : 'Arka'

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const result = await updateStudentOnboardingPhoto(formData, kind)
      if (result.success && result.photoUrl) {
        setPhoto(result.photoUrl)
        showToast('success', `${label} fotoğrafı başarıyla güncellendi.`)
      } else {
        showToast('error', result.error ?? 'Fotoğraf güncellenemedi.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Bir hata oluştu.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handlePhotoDelete = async (e: React.MouseEvent, kind: 'front' | 'side' | 'back') => {
    e.stopPropagation()
    const label = kind === 'front' ? 'Ön' : kind === 'side' ? 'Yan' : 'Arka'
    if (!confirm(`${label} fotoğrafını silmek istediğinize emin misiniz?`)) {
      return
    }

    const setUploading = kind === 'front' ? setUploadingFront : kind === 'side' ? setUploadingSide : setUploadingBack
    const setPhoto = kind === 'front' ? setFrontPhoto : kind === 'side' ? setSidePhoto : setBackPhoto

    setUploading(true)
    try {
      const result = await deleteStudentOnboardingPhoto(kind)
      if (result.success) {
        setPhoto(null)
        showToast('success', `${label} fotoğrafı başarıyla silindi.`)
      } else {
        showToast('error', result.error ?? 'Fotoğraf silinemedi.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Fotoğraf silinirken hata oluştu.')
    } finally {
      setUploading(false)
    }
  }

  const renderPhotoSlot = (
    kind: 'front' | 'side' | 'back',
    label: string,
    photoUrl: string | null,
    uploading: boolean,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    if (!isEditable && !photoUrl) return null

    return (
      <div className="space-y-1.5 flex flex-col">
        <p className="coach-muted text-center text-xs font-semibold">{label}</p>
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 aspect-[3/4] group flex-1">
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : photoUrl ? (
            <>
              {isEditable && (
                <div className="absolute top-2 right-2 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      inputRef.current?.click()
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground border border-border shadow-sm hover:text-primary hover:scale-105 transition"
                    title={`${label} Fotoğrafını Değiştir`}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePhotoDelete(e, kind)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground border border-border shadow-sm hover:text-destructive hover:scale-105 transition"
                    title={`${label} Fotoğrafını Sil`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => setLightboxPhoto({ url: photoUrl, label: `Başlangıç ${label} Fotoğrafı` })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={`${label} fotoğrafı`}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                />
              </div>
            </>
          ) : isEditable ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full h-full flex-col items-center justify-center gap-2 border-2 border-dashed border-border/80 bg-muted/30 transition duration-200 hover:border-primary/50 hover:bg-primary/5"
            >
              <Camera className="h-6 w-6 text-muted-foreground/60 animate-pulse" />
              <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase">Fotoğraf Yükle</span>
            </button>
          ) : (
            <div className="flex w-full h-full items-center justify-center bg-muted/20">
              <span className="text-xs text-muted-foreground/40">Yüklenmemiş</span>
            </div>
          )}
          {isEditable && (
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoChange(e, kind)}
            />
          )}
        </div>
      </div>
    )
  }

  const hasAnyPhoto = frontPhoto || sidePhoto || backPhoto
  const showGrid = isEditable || hasAnyPhoto

  return (
    <>
      <SectionCard
        icon={<Camera className="h-4 w-4" />}
        title="Başlangıç Fotoğrafları"
      >
        {showGrid ? (
          <div className="grid grid-cols-3 gap-4">
            {renderPhotoSlot('front', 'Ön', frontPhoto, uploadingFront, frontInputRef)}
            {renderPhotoSlot('side', 'Yan', sidePhoto, uploadingSide, sideInputRef)}
            {renderPhotoSlot('back', 'Arka', backPhoto, uploadingBack, backInputRef)}
          </div>
        ) : (
          <p className="coach-muted text-xs">Başlangıç fotoğrafı yüklenmemiş.</p>
        )}
      </SectionCard>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-[90vw] max-h-[85vh] text-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.label}
              className="max-h-[80vh] mx-auto rounded-lg object-contain shadow-2xl border border-border"
            />
            <p className="mt-4 text-sm font-semibold text-foreground tracking-wide">{lightboxPhoto.label}</p>
          </div>
        </div>
      )}
    </>
  )
}
