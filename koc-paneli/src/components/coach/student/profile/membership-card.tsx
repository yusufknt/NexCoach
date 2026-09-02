'use client'

import { useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CoachStudentDetail } from '@/lib/coach/types'
import { extendMembershipAction } from '@/lib/coach/student-actions'

type MembershipCardProps = {
  student: CoachStudentDetail
}

export function MembershipCard({ student }: MembershipCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const endDateStr = student.endDate
    ? new Date(student.endDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Belirtilmemiş veya süresi dolmuş'

  const isActive = student.endDate && new Date(student.endDate) > new Date()

  async function handleAddMonths(months: number) {
    setIsUpdating(true)
    setError(null)
    const result = await extendMembershipAction(student.coachStudentId, months)
    setIsUpdating(false)
    if (!result.success) {
      setError(result.error)
    }
  }

  async function handleSetCustomDate() {
    if (!customDate) return
    setIsUpdating(true)
    setError(null)
    const result = await extendMembershipAction(student.coachStudentId, undefined, customDate)
    setIsUpdating(false)
    if (!result.success) {
      setError(result.error)
    } else {
      setCustomDate('')
    }
  }

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">Üyelik Durumu</h3>
          <p className="text-sm text-muted-foreground">Öğrencinin kalan üyelik süresi</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bitiş Tarihi:</p>
          <p className={`text-lg font-bold ${isActive ? 'text-success' : 'text-destructive'}`}>
            {endDateStr}
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() => handleAddMonths(1)}
              className="text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> 1 Ay
            </Button>
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() => handleAddMonths(3)}
              className="text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> 3 Ay
            </Button>
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() => handleAddMonths(6)}
              className="text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> 6 Ay
            </Button>
          </div>
          
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="custom-date" className="text-xs text-muted-foreground">Özel Tarih</Label>
              <Input
                id="custom-date"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="coach-input h-8 text-xs"
              />
            </div>
            <Button
              disabled={isUpdating || !customDate}
              onClick={handleSetCustomDate}
              size="sm"
            >
              Uygula
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
