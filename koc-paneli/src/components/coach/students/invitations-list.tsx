'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Copy, Check, Mail, Package, Clock } from 'lucide-react'
import { formatDate } from '@/lib/coach/format'
import { deleteInvitation } from '@/lib/coach/invite-actions'
import type { InvitationWithPackage } from '@/lib/coach/invite.server'

type InvitationsListProps = {
  invitations: InvitationWithPackage[]
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCopy = async (token: string, id: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteLink = `${baseUrl}/kayit?invite=${token}`
    await navigator.clipboard.writeText(inviteLink)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu daveti iptal etmek istediğinize emin misiniz?')) return
    
    setDeletingId(id)
    try {
      await deleteInvitation(id)
    } catch (error) {
      console.error('Failed to delete invitation:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (invitations.length === 0) {
    return (
      <p className="surface-card border-dashed p-8 text-center text-sm text-muted-foreground">
        Bekleyen davetiniz bulunmuyor.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((inv) => (
        <Card key={inv.id} className="coach-card overflow-hidden transition-all duration-200 hover:border-border hover:shadow-md">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {inv.email || 'Email belirtilmedi'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {inv.packageName && (
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    <span>{inv.packageName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Son Geçerlilik: {formatDate(inv.expiresAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(inv.token, inv.id)}
                className="flex-1 sm:flex-none gap-2 bg-background"
              >
                {copiedId === inv.id ? (
                  <>
                    <Check className="h-4 w-4" /> Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Linki Kopyala
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(inv.id)}
                disabled={deletingId === inv.id}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive px-3"
                title="Daveti İptal Et"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
