'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Copy, Check, UserPlus } from 'lucide-react'
import { createInvitation } from '@/lib/coach/invite-actions'

type InviteStudentModalProps = {
  isOpen: boolean
  onClose: () => void
  packages: { id: string; name: string; price: number }[]
}

export function InviteStudentModal({
  isOpen,
  onClose,
  packages,
}: InviteStudentModalProps) {
  const [selectedPackage, setSelectedPackage] = useState('')
  const [email, setEmail] = useState('')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setInviteLink(null)

    const formData = new FormData()
    formData.append('packageId', selectedPackage)
    if (email.trim()) {
      formData.append('email', email.trim())
    }

    const result = await createInvitation(formData)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    setInviteLink(`${baseUrl}/kayit?invite=${result.token}`)
  }

  async function handleCopy() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setSelectedPackage('')
    setEmail('')
    setInviteLink(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C3F400]/10">
              <UserPlus className="h-5 w-5 text-[#C3F400]" />
            </div>
            <h2 className="text-lg font-bold text-white">Öğrenci Davet Et</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-[#C4C9AC] transition-colors hover:bg-[#2A2A2C] hover:text-[#E5E1E4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {inviteLink ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#C3F400]/20 bg-[#C3F400]/5 p-4">
              <p className="text-sm font-medium text-[#C3F400]">
                Davet linki oluşturuldu!
              </p>
              <p className="mt-1 text-xs text-[#C4C9AC]">
                Bu linki öğrencinize gönderin. Link 7 gün boyunca geçerlidir.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#C4C9AC]">Davet Linki</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="coach-input flex-1 font-mono text-xs"
                />
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="bg-[#C3F400] px-4 text-[#283500] hover:bg-[#ABD600]"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleClose}
                className="bg-[#C3F400] px-6 text-[#283500] hover:bg-[#ABD600]"
              >
                Kapat
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-package" className="text-[#C4C9AC]">
                Paket Seçin <span className="text-red-400">*</span>
              </Label>
              <select
                id="invite-package"
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="coach-input w-full rounded-xl px-3 py-2 text-sm"
                required
              >
                <option value="">Paket seçin...</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(pkg.price)}
                  </option>
                ))}
              </select>
              {packages.length === 0 && (
                <p className="text-xs text-[#C4C9AC]/70">
                  Davet oluşturmak için önce aktif bir paket eklemeniz gerekiyor.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-[#C4C9AC]">
                Öğrenci Emaili <span className="text-[#C4C9AC]/50">(opsiyonel)</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ogrenci@email.com"
                className="coach-input"
              />
              <p className="text-xs text-[#C4C9AC]/70">
                Email girerseniz, öğrenciye davet linki otomatik gönderilecek.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-[#C4C9AC] hover:bg-[#2A2A2C]"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || packages.length === 0}
                className="bg-[#C3F400] px-6 text-[#283500] hover:bg-[#ABD600]"
              >
                {isSubmitting ? 'Oluşturuluyor...' : 'Davet Linki Oluştur'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
