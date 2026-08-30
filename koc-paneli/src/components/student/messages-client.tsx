'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Check, CheckCheck, MessageSquare } from 'lucide-react'
import { formatTime } from '@/lib/coach/format'
import { sendMessage, markAsRead, getMessages } from '@/lib/student/messages.client'
import { sendNewMessageNotification } from '@/lib/email/send'
import { cn } from '@/lib/utils'
import type { StudentMessage, CoachInfo } from '@/lib/student/types'

type MessagesClientProps = {
  studentId: string
  coach: CoachInfo
  initialMessages: StudentMessage[]
}

export function MessagesClient({ studentId, coach, initialMessages }: MessagesClientProps) {
  const [messages, setMessages] = useState<StudentMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Mark as read on mount
  useEffect(() => {
    markAsRead(studentId, coach.id)
  }, [studentId, coach.id])

  // Polling for new messages (Cloudflare D1)
  useEffect(() => {
    let isSubscribed = true
    const pollMessages = async () => {
      try {
        const newMessages = await getMessages(studentId, coach.id)
        if (!isSubscribed) return
        
        setMessages((prev) => {
          if (newMessages.length > prev.length) {
            // New messages arrived, mark as read if any incoming
            const incoming = newMessages.filter(m => m.receiver_id === studentId && !m.is_read)
            if (incoming.length > 0) {
              markAsRead(studentId, coach.id)
            }
            return newMessages
          }
          return prev
        })
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    const intervalId = setInterval(pollMessages, 3000)
    return () => {
      isSubscribed = false
      clearInterval(intervalId)
    }
  }, [studentId, coach.id])

  const handleSend = async () => {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')

    // Optimistic
    const tempId = `temp-${Date.now()}`
    const temp: StudentMessage = {
      id: tempId, sender_id: studentId, receiver_id: coach.id,
      content, is_read: false, created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, temp])

    const sent = await sendMessage(studentId, coach.id, content)
    if (sent) {
      setMessages((prev) => prev.map((m) => m.id === tempId ? sent : m))
      sendNewMessageNotification({ studentId, coachId: coach.id, messageContent: content })
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[620px] flex-col rounded-xl border border-border bg-muted/30 backdrop-blur-xl">
      {/* Header — Coach Profile */}
      <div className="flex shrink-0 items-center gap-4 border-b border-border/60 p-4">
        <Avatar className="h-11 w-11 border border-border/60">
          {coach.avatarUrl && <AvatarImage src={coach.avatarUrl} />}
          <AvatarFallback className="bg-muted text-foreground">
            {coach.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-foreground">{coach.fullName}</h2>
          {coach.bio && <p className="line-clamp-1 text-xs text-muted-foreground">{coach.bio}</p>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Aktif</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Koçunuzla mesajlaşmaya başlayın!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isStudent = msg.sender_id === studentId
            return (
              <div key={msg.id} className={cn(
                'flex flex-col max-w-[80%] space-y-1',
                isStudent ? 'ml-auto items-end' : 'mr-auto items-start'
              )}>
                <div className={cn(
                  'px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words',
                  isStudent
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm bg-muted text-foreground'
                )}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                  <span>{formatTime(msg.created_at)}</span>
                  {isStudent && (
                    msg.is_read
                      ? <CheckCheck className="h-3 w-3 text-primary" />
                      : <Check className="h-3 w-3" />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border/60 bg-[#0E0E10]/70 p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="coach-input max-h-[160px] min-h-[56px] resize-none"
            autoFocus
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="icon"
            className="h-[56px] w-[56px] shrink-0 bg-primary text-primary-foreground hover:bg-primary">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
