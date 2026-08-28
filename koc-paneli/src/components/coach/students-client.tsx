'use client'

import { useCoachStudents } from '@/hooks/use-coach-students'
import { StudentList } from './student-list'
import { Skeleton } from '@/components/ui/skeleton'

export function CoachStudentsClient() {
  const { students, isLoading, error } = useCoachStudents()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Öğrenciler yüklenirken bir hata oluştu.
      </div>
    )
  }

  return <StudentList students={students} />
}
