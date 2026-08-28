import { User, Ruler, Heart, Camera, X } from 'lucide-react'

export const ONBOARDING_STEPS = [
  { id: 1, title: 'Kişisel Bilgiler', icon: User },
  { id: 2, title: 'Başlangıç Ölçüleri', icon: Ruler },
  { id: 3, title: 'Sağlık & Fotoğraflar', icon: Heart },
] as const

export type PhotoPreview = {
  file: File
  url: string
}

export function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[#C4C9AC]"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export function SelectButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200
        ${
          selected
            ? 'border-[#ABD600] bg-[#ABD600]/15 text-[#ABD600] shadow-[0_0_12px_rgba(171,214,0,0.15)]'
            : 'border-[#444933] bg-[#0E0E10] text-[#C4C9AC] hover:border-[#ABD600]/40 hover:text-[#E5E1E4]'
        }
      `}
    >
      {label}
    </button>
  )
}

export function PhotoUploadField({
  label,
  preview,
  inputRef,
  onChange,
  onRemove,
  inputId,
}: {
  label: string
  preview: PhotoPreview | null
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  inputId: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-medium text-[#C4C9AC]">{label}</p>
      {preview ? (
        <div className="group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt={`${label} fotoğrafı`}
            className="h-48 w-full rounded-xl border border-[#444933] object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#09090B]/80 text-[#C4C9AC] opacity-0 transition-all duration-200 hover:text-red-400 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#444933] bg-[#0E0E10]/50 transition-all duration-200 hover:border-[#ABD600]/50 hover:bg-[#ABD600]/5"
        >
          <Camera className="h-6 w-6 text-[#C4C9AC]/60" />
          <span className="text-xs text-[#C4C9AC]/60">Yükle</span>
        </button>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  )
}
