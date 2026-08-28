'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudentStatusBadge } from '@/components/coach/student-status-badge'
import { formatDate, formatRelativeTime } from '@/lib/coach/format'
import type { CoachStudentListItem } from '@/lib/coach/types'
import { Search } from 'lucide-react'

type StudentListProps = {
  students: CoachStudentListItem[]
}

export function StudentList({ students }: StudentListProps) {
  const [query, setQuery] = useState('')

  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr')
    if (!normalized) return students

    return students.filter((student) =>
      student.fullName.toLocaleLowerCase('tr').includes(normalized)
    )
  }, [query, students])

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Öğrenci ara..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="coach-input h-11 pl-10 shadow-xs"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="coach-card border-dashed p-8 text-center text-sm text-muted-foreground">
          {students.length === 0
            ? 'Henüz öğrenci bulunmuyor.'
            : 'Aramanızla eşleşen öğrenci yok.'}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Link
              key={student.id}
              href={`/coach/ogrenciler/${student.id}`}
              className="block group"
            >
              <Card className="coach-card h-full transition-all duration-200 hover:border-border hover:shadow-md">
                <CardContent className="flex items-center gap-3.5 p-4.5">
                  <Avatar className="h-11 w-11 border border-border">
                    {student.avatarUrl && (
                      <AvatarImage
                        src={student.avatarUrl}
                        alt={student.fullName}
                      />
                    )}
                    <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                      {student.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                        {student.fullName}
                      </p>
                      <StudentStatusBadge status={student.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {student.packageName ?? 'Paket atanmamış'} · {formatDate(student.startDate)}
                    </p>
                    {student.lastActivityAt && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                        {formatRelativeTime(student.lastActivityAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
