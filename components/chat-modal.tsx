"use client";

import { Button } from "@/components/ui/button";
import { X, Bot, Mic } from "lucide-react";
import { ChatInterface } from "./chat-interface";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToVoice: () => void;
}

export function ChatModal({ isOpen, onClose, onSwitchToVoice }: ChatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-card border rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Stratos AI Assistant</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToVoice}
              className="flex items-center space-x-2"
            >
              <Mic className="h-4 w-4" />
              <span>Switch to Voice</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
