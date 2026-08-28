'use client'

import { useEffect, useState } from 'react'
import { StudentList } from './student-list'
import { ChatArea } from './chat-area'
import type { ChatSummary, Message } from '@/lib/coach/types'
import { getMessages, sendMessage, markAsRead } from '@/lib/coach/messages.client'
import { cn } from '@/lib/utils'

type MessageLayoutProps = {
  coachId: string
  initialSummaries: ChatSummary[]
}

export function MessageLayout({ coachId, initialSummaries }: MessageLayoutProps) {
  const [summaries, setSummaries] = useState<ChatSummary[]>(initialSummaries)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialSummaries.length > 0 ? initialSummaries[0].studentId : null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)

  // Fetch messages when selected student changes
  useEffect(() => {
    if (!selectedStudentId) return

    const loadMessages = async () => {
      const data = await getMessages(coachId, selectedStudentId)
      setMessages(data)
      
      // Mark as read when opening
      await markAsRead(coachId, selectedStudentId)
      
      // Update local unread count
      setSummaries(prev => prev.map(s => 
        s.studentId === selectedStudentId 
          ? { ...s, unreadCount: 0 } 
          : s
      ))
    }

    loadMessages()
  }, [coachId, selectedStudentId])

  // Polling for messages and summaries (Cloudflare D1)
  useEffect(() => {
    let isSubscribed = true
    const pollUpdates = async () => {
      try {
        if (!selectedStudentId) return
        
        const [newMessages, { getChatSummaries }] = await Promise.all([
          getMessages(coachId, selectedStudentId),
          import('@/lib/coach/messages.server')
        ])

        if (!isSubscribed) return

        // Update active chat messages
        setMessages(prev => {
          if (newMessages.length > prev.length) {
            // New incoming messages in active chat
            const incoming = newMessages.filter(m => m.receiver_id === coachId && !m.is_read)
            if (incoming.length > 0) {
              markAsRead(coachId, selectedStudentId)
            }
            return newMessages
          }
          return prev
        })

        // We ideally should poll summaries too, but for a lightweight approach,
        // we could just fetch them. But since this is a client component, 
        // calling a server action repeatedly might be heavy. Let's just poll summaries
        // less frequently or rely on local optimistic updates for now, but 
        // to fully replace realtime we can fetch summaries too.
        const newSummaries = await getChatSummaries(coachId)
        if (!isSubscribed) return
        setSummaries(newSummaries)

      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    const intervalId = setInterval(pollUpdates, 5000) // Poll every 5s for coach
    return () => {
      isSubscribed = false
      clearInterval(intervalId)
    }
  }, [coachId, selectedStudentId])

  const handleSendMessage = async (content: string) => {
    if (!selectedStudentId) return

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const newMsg: Message = {
      id: tempId,
      sender_id: coachId,
      receiver_id: selectedStudentId,
      content,
      created_at: new Date().toISOString(),
      is_read: false
    }

    setMessages(prev => [...prev, newMsg])
    
    // Update summary optimistically
    setSummaries(prev => {
      const index = prev.findIndex(s => s.studentId === selectedStudentId)
      if (index === -1) return prev
      const updated = { ...prev[index] }
      updated.lastMessage = {
        content,
        createdAt: newMsg.created_at,
        isRead: false,
        senderId: coachId
      }
      const newSummaries = [...prev]
      newSummaries.splice(index, 1)
      return [updated, ...newSummaries]
    })

    const sent = await sendMessage(coachId, selectedStudentId, content)
    if (sent) {
      // Replace temp with real
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m))
    } else {
      // Revert if failed
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id)
    setIsMobileChatOpen(true)
  }

  const selectedSummary = summaries.find(s => s.studentId === selectedStudentId) || null

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[620px] w-full overflow-hidden rounded-xl border border-[#27272A] bg-[#18181B]/80 shadow-black/20 backdrop-blur-xl">
      {/* Left Panel */}
      <div 
        className={cn(
          "w-full shrink-0 md:w-80 lg:w-96",
          isMobileChatOpen ? "hidden md:block" : "block"
        )}
      >
        <StudentList
          summaries={summaries}
          selectedStudentId={selectedStudentId}
          onSelectStudent={handleSelectStudent}
        />
      </div>

      {/* Right Panel */}
      <div 
        className={cn(
          "min-w-0 flex-1",
          !isMobileChatOpen ? "hidden md:block" : "block"
        )}
      >
        <ChatArea
          coachId={coachId}
          studentSummary={selectedSummary}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={() => setIsMobileChatOpen(false)}
        />
      </div>
    </div>
  )
}
