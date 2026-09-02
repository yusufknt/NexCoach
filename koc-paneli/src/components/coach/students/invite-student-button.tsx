'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { InviteStudentModal } from './invite-student-modal'

export function InviteStudentButton({ packages = [] }: { packages?: { id: string; name: string; price: number }[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Öğrenci Davet Et
      </Button>
      <InviteStudentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        packages={packages}
      />
    </>
  )
}
