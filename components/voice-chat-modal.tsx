"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceChatModal({ isOpen, onClose }: VoiceChatModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "agent"; message: string; timestamp: string }>
  >([]);
  const recognitionRef = useRef<any | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);

          if (event.results[current].isFinal) {
            handleUserMessage(transcript);
            setTranscript("");
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }

      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleUserMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConversation((prev) => [...prev, { role: "user", message, timestamp }]);

    // Simulate AI agent response
    setTimeout(() => {
      const responses = [
        "I understand you're looking for information about your GoHighLevel account. How can I help you today?",
        "Let me check your contact database for that information.",
        "I can help you with managing your leads and opportunities. What specific area would you like to focus on?",
        "Based on your recent activity, I see you have several active conversations. Would you like me to summarize them?",
        "I can assist you with scheduling follow-ups or updating contact information. What would you prefer?",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      const agentTimestamp = new Date().toLocaleTimeString();

      setConversation((prev) => [
        ...prev,
        { role: "agent", message: response, timestamp: agentTimestamp },
      ]);

      // Speak the response
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        synthRef.current.speak(utterance);
      }
    }, 1500);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
      stopListening();
      setConversation([]);
    } else {
      setIsConnected(true);
      setConversation([
        {
          role: "agent",
          message:
            "Hello! I'm your GoHighLevel AI assistant. I can help you manage your contacts, opportunities, and answer questions about your CRM. How can I assist you today?",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      // Speak welcome message
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(
          "Hello! I'm your GoHighLevel AI assistant. How can I help you today?"
        );
        utterance.rate = 0.9;
        utterance.pitch = 1;
        synthRef.current.speak(utterance);
      }
    }
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-primary/50 to-accent/10 backdrop-blur-lg z-50 flex items-start justify-center transition-all duration-300 ${
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    }`}>
      <div
        className={`w-full h-full flex flex-col transform transition-all duration-300 ease-out ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">Voice Chat</h2>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={
                isConnected
                  ? "bg-primary/20 text-primary border-primary/30"
                  : ""
              }
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 text-white border border-white/20"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}

            {/* Live transcript */}
            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-primary/50 text-primary-foreground border border-primary/30">
                  <p className="text-sm opacity-80">{transcript}</p>
                  <p className="text-xs opacity-50">Speaking...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-center space-x-6">
            {/* Connection Button */}
            <Button
              onClick={toggleConnection}
              size="lg"
              className={`h-16 w-16 rounded-full ${
                isConnected
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isConnected ? (
                <PhoneOff className="h-8 w-8" />
              ) : (
                <Phone className="h-8 w-8" />
              )}
            </Button>

            {/* Microphone Button */}
            {isConnected && (
              <Button
                onClick={isListening ? stopListening : startListening}
                size="lg"
                variant={isListening ? "default" : "outline"}
                className={`h-16 w-16 rounded-full ${
                  isListening
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center mt-4">
            {!isConnected ? (
              <p className="text-white/70">Start voice chat?</p>
            ) : isListening ? (
              <p className="text-white/70">Listening... Speak now</p>
            ) : (
              <p className="text-white/70">Tap microphone to speak</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
