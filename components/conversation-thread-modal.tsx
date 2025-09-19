"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Phone, Mail, MoreVertical } from "lucide-react"

interface Message {
  id: number
  sender: "user" | "contact"
  content: string
  timestamp: string
  type: "text" | "email" | "sms"
}

interface Conversation {
  id: number
  contact: string
  lastMessage: string
  timestamp: string
  unread: number
  status: string
  avatar: string
}

interface ConversationThreadModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation | null
}

export function ConversationThreadModal({ isOpen, onClose, conversation }: ConversationThreadModalProps) {
  const [newMessage, setNewMessage] = useState("")
  const [messageType, setMessageType] = useState<"text" | "email" | "sms">("text")

  // Mock conversation thread data
  const messages: Message[] = [
    {
      id: 1,
      sender: "contact",
      content: "Hi! I'm interested in your services. Can you tell me more about your pricing?",
      timestamp: "2 days ago",
      type: "email",
    },
    {
      id: 2,
      sender: "user",
      content:
        "Thanks for reaching out! I'd be happy to discuss our pricing. We have several packages available depending on your needs. Would you like to schedule a quick call?",
      timestamp: "2 days ago",
      type: "email",
    },
    {
      id: 3,
      sender: "contact",
      content: "That sounds great! I'm available tomorrow afternoon or Thursday morning.",
      timestamp: "1 day ago",
      type: "email",
    },
    {
      id: 4,
      sender: "user",
      content: "Perfect! Let's schedule for Thursday at 10 AM. I'll send you a calendar invite.",
      timestamp: "1 day ago",
      type: "email",
    },
    {
      id: 5,
      sender: "contact",
      content: "Thanks for the follow-up! I'm interested in learning more.",
      timestamp: "2 hours ago",
      type: "sms",
    },
  ]

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // In a real app, this would send the message via API
    console.log("[v0] Sending message:", { content: newMessage, type: messageType, to: conversation?.contact })
    setNewMessage("")
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "email":
        return "bg-blue-100 text-blue-800"
      case "sms":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "waiting":
        return "bg-blue-100 text-blue-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!conversation) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.contact} />
                <AvatarFallback>
                  {conversation.contact
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">{conversation.contact}</DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getStatusColor(conversation.status)}>{conversation.status}</Badge>
                  {conversation.unread > 0 && <Badge variant="secondary">{conversation.unread} unread</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className={`text-xs ${getMessageTypeColor(message.type)}`}>
                      {message.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs opacity-70">{message.timestamp}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Button
              variant={messageType === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageType("text")}
            >
              Text
            </Button>
            <Button
              variant={messageType === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageType("email")}
            >
              Email
            </Button>
            <Button
              variant={messageType === "sms" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageType("sms")}
            >
              SMS
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder={`Type your ${messageType} message...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
