'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Trash2, CheckSquare, Square } from 'lucide-react'
import type { CalendarEventFormData, StudentOption } from '@/lib/coach/types'

type EventModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CalendarEventFormData) => void
  onDelete?: () => void
  students: StudentOption[]
  initialData?: Partial<CalendarEventFormData> & { id?: string }
  mode: 'create' | 'edit'
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  students,
  initialData,
  mode,
}: EventModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  // We keep eventType in state to know if it's 'session', 'available', etc. but we don't show the selector.
  const [eventType] = useState<'available' | 'session' | 'blocked'>(
    initialData?.event_type ?? 'session'
  )
  const [startTime, setStartTime] = useState(initialData?.start_time ?? '')
  const [endTime, setEndTime] = useState(initialData?.end_time ?? '')
  // For edit mode (single student)
  const [studentId, setStudentId] = useState(initialData?.student_id ?? '')
  // For create mode (multiple students)
  const [studentIds, setStudentIds] = useState<string[]>([])
  
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [meetingUrl, setMeetingUrl] = useState(initialData?.meeting_url ?? '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: title || (eventType === 'available' ? 'Müsait' : eventType === 'blocked' ? 'Bloklu' : 'Seans'),
      event_type: eventType,
      start_time: startTime,
      end_time: endTime,
      student_id: mode === 'edit' ? (studentId || null) : undefined,
      student_ids: mode === 'create' ? studentIds : undefined,
      description,
      meeting_url: meetingUrl,
    })
  }

  const toggleStudent = (id: string) => {
    setStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {mode === 'create' ? (eventType === 'available' ? 'Müsait Saat Ekle' : 'Yeni Etkinlik') : 'Etkinliği Düzenle'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="event-title" className="text-foreground">Başlık</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={eventType === 'session' ? 'Seans başlığı' : eventType === 'available' ? 'Müsait' : 'Bloklu'}
              className="coach-input mt-1.5"
            />
          </div>

          {/* Date / Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-time" className="text-foreground">Başlangıç</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="coach-input mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="end-time" className="text-foreground">Bitiş</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="coach-input mt-1.5"
              />
            </div>
          </div>

          {/* Student Selection */}
          {eventType === 'session' && (
            <div>
              <Label className="text-foreground mb-1.5 block">Öğrenci</Label>
              {mode === 'create' ? (
                <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-background p-2 space-y-1">
                  {students.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">Kayıtlı öğrenci bulunamadı.</p>
                  ) : (
                    students.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStudent(s.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                      >
                        {studentIds.includes(s.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-foreground">{s.fullName}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <select
                  id="student-select"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="coach-input mt-1.5 w-full rounded-xl px-3 py-2 text-sm text-foreground bg-background"
                >
                  <option value="">Öğrenci seçin...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="event-desc" className="text-foreground">Açıklama</Label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opsiyonel açıklama..."
              className="coach-input mt-1.5 min-h-[80px] resize-none"
            />
          </div>

          {/* Meeting URL */}
          {eventType === 'session' && (
            <div>
              <Label htmlFor="meeting-url" className="text-foreground">Görüşme Linki (Zoom/Meet)</Label>
              <Input
                id="meeting-url"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="coach-input mt-1.5"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="text-foreground hover:bg-muted">
                İptal
              </Button>
              <Button type="submit" className="bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                {mode === 'create' ? 'Oluştur' : 'Güncelle'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
