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
}

export function InviteStudentModal({
  isOpen,
  onClose,
}: InviteStudentModalProps) {
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
    setEmail('')
    setInviteLink(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Öğrenci Davet Et</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {inviteLink ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-primary">
                Davet linki oluşturuldu!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bu linki öğrencinize gönderin. Link 7 gün boyunca geçerlidir.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Davet Linki</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="coach-input flex-1 font-mono text-xs"
                />
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="px-4"
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
                className="px-6"
              >
                Kapat
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-muted-foreground">
                Öğrenci Emaili <span className="text-muted-foreground/50">(opsiyonel)</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ogrenci@email.com"
                className="coach-input"
              />
              <p className="text-xs text-muted-foreground/70">
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
                className="text-muted-foreground hover:bg-muted"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6"
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
