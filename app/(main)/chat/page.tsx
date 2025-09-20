'use client';

import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VoiceChatModal } from "@/components/voice-chat-modal";
import { Bot, Mic } from "lucide-react";
import { useState } from "react";

export default function ChatPage() {
    const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false) // Added voice chat modal state

    return (
        <>
            <div className="flex-1 p-6 overflow-auto">
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Bot className="h-5 w-5 text-primary" />
                                <CardTitle>AI Business Assistant</CardTitle>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsVoiceChatOpen(true)}
                                className="flex items-center space-x-2"
                            >
                                <Mic className="h-4 w-4" />
                                <span>Switch to Voice</span>
                            </Button>
                        </div>
                        <CardDescription>Chat with AI about your business, get insights, and manage your CRM</CardDescription>
                    </CardHeader>
                    <div className="flex-1 flex flex-col">
                        <ChatInterface />
                    </div>
                </Card>
            </div>
            <VoiceChatModal isOpen={isVoiceChatOpen} onClose={() => setIsVoiceChatOpen(false)} />
        </>
    )
}