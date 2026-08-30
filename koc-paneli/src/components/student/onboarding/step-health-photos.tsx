'use client'

import { FormField, PhotoUploadField, type PhotoPreview } from './onboarding-common'

type StepHealthPhotosProps = {
  injuries: string
  setInjuries: (val: string) => void
  supplements: string
  setSupplements: (val: string) => void
  photoFront: PhotoPreview | null
  setPhotoFront: (val: PhotoPreview | null) => void
  photoSide: PhotoPreview | null
  setPhotoSide: (val: PhotoPreview | null) => void
  photoBack: PhotoPreview | null
  setPhotoBack: (val: PhotoPreview | null) => void
  frontInputRef: React.RefObject<HTMLInputElement | null>
  sideInputRef: React.RefObject<HTMLInputElement | null>
  backInputRef: React.RefObject<HTMLInputElement | null>
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>, setter: (p: PhotoPreview | null) => void) => void
  onRemovePhoto: (setter: (p: PhotoPreview | null) => void, inputRef: React.RefObject<HTMLInputElement | null>) => void
}

export function StepHealthPhotos({
  injuries,
  setInjuries,
  supplements,
  setSupplements,
  photoFront,
  setPhotoFront,
  photoSide,
  setPhotoSide,
  photoBack,
  setPhotoBack,
  frontInputRef,
  sideInputRef,
  backInputRef,
  onPhotoChange,
  onRemovePhoto,
}: StepHealthPhotosProps) {
  return (
    <div className="space-y-6">
      <FormField label="Sakatlık / Kısıtlama" htmlFor="injuries">
        <textarea
          id="injuries"
          className="input-surface w-full resize-none px-4 py-2.5"
          rows={3}
          placeholder="Varsa sakatlık veya fiziksel kısıtlamalarınızı belirtin..."
          value={injuries}
          onChange={(e) => setInjuries(e.target.value)}
        />
      </FormField>

      <FormField label="Kullandığınız Supplement'ler" htmlFor="supplements">
        <textarea
          id="supplements"
          className="input-surface w-full resize-none px-4 py-2.5"
          rows={3}
          placeholder="Protein tozu, kreatin, vitamin D vb."
          value={supplements}
          onChange={(e) => setSupplements(e.target.value)}
        />
      </FormField>

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
          Başlangıç Fotoğrafları (opsiyonel)
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Ön, yan ve arka fotoğraflarınızı yükleyin. İlerlemenizi takip etmek için çok faydalı olacaktır.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PhotoUploadField
            label="Ön"
            preview={photoFront}
            inputRef={frontInputRef}
            onChange={(e) => onPhotoChange(e, setPhotoFront)}
            onRemove={() => onRemovePhoto(setPhotoFront, frontInputRef)}
            inputId="photoFront"
          />
          <PhotoUploadField
            label="Yan"
            preview={photoSide}
            inputRef={sideInputRef}
            onChange={(e) => onPhotoChange(e, setPhotoSide)}
            onRemove={() => onRemovePhoto(setPhotoSide, sideInputRef)}
            inputId="photoSide"
          />
          <PhotoUploadField
            label="Arka"
            preview={photoBack}
            inputRef={backInputRef}
            onChange={(e) => onPhotoChange(e, setPhotoBack)}
            onRemove={() => onRemovePhoto(setPhotoBack, backInputRef)}
            inputId="photoBack"
          />
        </div>
      </div>
    </div>
  )
}
