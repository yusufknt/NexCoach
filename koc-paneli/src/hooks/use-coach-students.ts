import useSWR from 'swr'
import type { CoachStudentListItem } from '@/lib/coach/types'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export function useCoachStudents() {
  const { data, error, isLoading, mutate } = useSWR<CoachStudentListItem[]>(
    '/api/coach/students',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  )

  return {
    students: data ?? [],
    error,
    isLoading,
    mutate,
  }
}
