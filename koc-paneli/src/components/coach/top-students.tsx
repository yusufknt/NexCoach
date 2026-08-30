import Link from 'next/link'
import { Card, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, ArrowUpRight } from 'lucide-react'
import type { TopActiveStudent } from '@/lib/coach/types'

type TopStudentsProps = {
  students: TopActiveStudent[]
}

export function TopStudents({ students }: TopStudentsProps) {
  const maxProgressCount = Math.max(...students.map((student) => student.progressCount), 1)

  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            En Aktif Danışanlar
          </CardTitle>
          <p className="text-xs text-muted-foreground">Son 7 günün aktivite liderleri</p>
        </div>
        <Link
          href="/coach/ogrenciler"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Tüm danışanlar"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="pt-4">
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Bu dönemde ilerleme kaydı bulunamadı.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {students.map((student, index) => (
              <Link
                key={student.studentId}
                href={`/coach/ogrenciler/${student.studentId}`}
                className="group block"
              >
                <li className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-2.5 transition-all hover:bg-muted/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                    {index + 1}
                  </span>
                  <Avatar className="h-9 w-9 border border-border">
                    {student.avatarUrl && <AvatarImage src={student.avatarUrl} alt={student.fullName} />}
                    <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                      {student.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                      {student.fullName}
                    </p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${(student.progressCount / maxProgressCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                    {student.progressCount} kayıt
                  </span>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
