'use client'

import { ConversationThreadModal } from "@/components/conversation-thread-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, TrendingUp, Search, } from "lucide-react";
import { useState } from "react";

const conversations = [
    {
        id: 1,
        contact: "Sarah Johnson",
        lastMessage: "Thanks for the follow-up! I'm interested in learning more.",
        timestamp: "2 hours ago",
        unread: 3,
        status: "active",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: 2,
        contact: "Mike Chen",
        lastMessage: "Can we schedule a call for next week?",
        timestamp: "5 hours ago",
        unread: 1,
        status: "pending",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: 3,
        contact: "Emily Davis",
        lastMessage: "I'll get back to you with the details.",
        timestamp: "1 day ago",
        unread: 0,
        status: "waiting",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: 4,
        contact: "Alex Rodriguez",
        lastMessage: "Perfect! Let's move forward with the proposal.",
        timestamp: "2 days ago",
        unread: 0,
        status: "closed",
        avatar: "/placeholder.svg?height=32&width=32",
    },
]

export default function ConversationsPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const [selectedConversation, setSelectedConversation] = useState<any>(null) // Added state for conversation thread modal
    const [isConversationThreadOpen, setIsConversationThreadOpen] = useState(false) // Added state for conversation thread modal

    const getConversationStatusColor = (status: string) => {
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

    const handleReplyClick = (conversation: any) => {
        // Added function to handle reply button click
        setSelectedConversation(conversation)
        setIsConversationThreadOpen(true)
    }

    return (
        <>
            <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Conversations</p>
                                    <p className="text-2xl font-bold">{conversations.length}</p>
                                </div>
                                <MessageCircle className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Conversations</p>
                                    <p className="text-2xl font-bold">{conversations.filter((c) => c.status === "active").length}</p>
                                </div>
                                <MessageCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Unread Messages</p>
                                    <p className="text-2xl font-bold">{conversations.reduce((sum, c) => sum + c.unread, 0)}</p>
                                </div>
                                <Mail className="h-8 w-8 text-accent" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Response Rate</p>
                                    <p className="text-2xl font-bold">87%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-chart-3" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Conversations</CardTitle>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search conversations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-64"
                                    />
                                </div>
                                <Button size="sm">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    New Message
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.contact} />
                                                <AvatarFallback>
                                                    {conversation.contact
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            {conversation.unread > 0 && (
                                                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                                    {conversation.unread}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{conversation.contact}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-md">{conversation.lastMessage}</p>
                                            <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge className={getConversationStatusColor(conversation.status)}>{conversation.status}</Badge>
                                        <Button variant="outline" size="sm" onClick={() => handleReplyClick(conversation)}>
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Reply
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConversationThreadModal
                isOpen={isConversationThreadOpen}
                onClose={() => setIsConversationThreadOpen(false)}
                conversation={selectedConversation}
            />
        </>
    )
}