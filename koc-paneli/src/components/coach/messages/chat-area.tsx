'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Check, CheckCheck, MessageSquare } from 'lucide-react'
import { formatTime } from '@/lib/coach/format'
import { cn } from '@/lib/utils'
import type { ChatSummary, Message } from '@/lib/coach/types'

type ChatAreaProps = {
  coachId: string
  studentSummary: ChatSummary | null
  messages: Message[]
  onSendMessage: (content: string) => void
  onBack?: () => void // For mobile
}

export function ChatArea({
  coachId,
  studentSummary,
  messages,
  onSendMessage,
  onBack
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!studentSummary) {
    return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Henüz mesaj yok</h3>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Mesajlaşmaya başlamak için sol taraftan bir öğrenci seçin.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-border/80 bg-card p-4">
        {onBack && (
          <Button variant="ghost" size="icon" className="text-muted-foreground md:hidden" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
        )}
        
        <Avatar className="h-10 w-10 border border-border">
          {studentSummary.avatarUrl && <AvatarImage src={studentSummary.avatarUrl} />}
          <AvatarFallback className="bg-muted text-foreground">
            {studentSummary.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-semibold text-foreground">{studentSummary.fullName}</h2>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Aktif</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Bu konuşmada henüz mesaj bulunmuyor. İlk mesajı siz gönderin!
          </div>
        ) : (
          messages.map((msg) => {
            const isCoach = msg.sender_id === coachId
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%] space-y-1",
                  isCoach ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words",
                    isCoach 
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-card text-foreground"
                  )}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                  <span>{formatTime(msg.created_at)}</span>
                  {isCoach && (
                    msg.is_read ? (
                      <CheckCheck className="h-3 w-3 text-success" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border/80 bg-card p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın... (Göndermek için Enter)"
            className="coach-input max-h-[160px] min-h-[60px] resize-none"
            autoFocus
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim()}
            size="icon"
            className="h-[60px] w-[60px] shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
