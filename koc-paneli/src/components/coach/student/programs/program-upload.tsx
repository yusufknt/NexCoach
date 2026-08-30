'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, Upload } from 'lucide-react'
import { uploadProgram } from '@/lib/coach/program-actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast-provider'
import { cn } from '@/lib/utils'

type ProgramUploadProps = {
  coachStudentId: string
  studentId: string
}

export function ProgramUpload({ coachStudentId, studentId }: ProgramUploadProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFile = useCallback((selected: File | null) => {
    if (!selected) return
    if (
      selected.type !== 'application/pdf' &&
      !selected.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Sadece PDF dosyası yükleyebilirsiniz.')
      return
    }
    setError(null)
    setFile(selected)
    if (!title) {
      setTitle(selected.name.replace(/\.pdf$/i, ''))
    }
  }, [title])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!file || !title.trim()) {
      setError('Başlık ve PDF dosyası zorunludur.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('coachStudentId', coachStudentId)
    formData.append('studentId', studentId)
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('file', file)

    const result = await uploadProgram(formData)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setFile(null)
    setTitle('')
    setDescription('')
    showToast('success', 'Program öğrenci paneline yüklendi.')
    router.refresh()
  }

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Upload className="size-4 text-primary" />
          Program Yükle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFile(e.dataTransfer.files?.[0] ?? null)
            }}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200',
              isDragging
                ? 'border-primary/60 bg-primary/10'
                : 'border-border/80 bg-muted/30 hover:border-primary/50'
            )}
          >
            <FileUp className="mb-3 size-10 text-primary" />
            <p className="text-sm font-medium text-foreground">
              PDF dosyasını sürükleyip bırakın
            </p>
            <p className="mt-1 text-xs text-muted-foreground">veya dosya seçin</p>
            <label className="mt-4 cursor-pointer">
              <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Dosya Seç
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <p className="mt-3 text-sm text-primary">{file.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-title">Başlık</Label>
            <Input
              id="program-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn. 4. Hafta Antrenman Programı"
              className="input-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-desc">Açıklama</Label>
            <Textarea
              id="program-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="İsteğe bağlı açıklama"
              className="input-surface"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {isSubmitting ? 'Yükleniyor...' : 'Programı Yükle'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
