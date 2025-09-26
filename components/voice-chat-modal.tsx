"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { getVapiClient } from "@/lib/vapiWeb";
import { useProfile } from "@/lib/contexts/ProfileContext";

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceChatModal({ isOpen, onClose }: VoiceChatModalProps) {
  const { profile } = useProfile();
  console.log("profile", profile);
  const vapiRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "agent"; message: string; timestamp: string }>
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      vapiRef.current = getVapiClient();
      const vapi = vapiRef.current;

      vapi.on("call-start", () => {
        setIsConnected(true);
      });
      vapi.on("call-end", () => {
        setIsConnected(false);
        setIsListening(false);
        setTranscript("");
      });
      vapi.on("speech-start", () => {
        setIsListening(true);
      });
      vapi.on("speech-end", () => {
        setIsListening(false);
      });
      vapi.on("message", (m: any) => {
        try {
          if (m?.type === "transcript") {
            const text = m?.text || m?.message?.content || "";
            if (m?.final) {
              if (text) {
                setConversation((prev) => [
                  ...prev,
                  {
                    role: (m?.role === "user" ? "user" : "agent") as
                      | "user"
                      | "agent",
                    message: String(text),
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              }
              setTranscript("");
            } else {
              setTranscript(String(text));
            }
            return;
          }

          const roleRaw = m?.message?.role || m?.role;
          const contentRaw = m?.message?.content ?? m?.content ?? m?.text;
          const content = Array.isArray(contentRaw)
            ? contentRaw
                .map((c: any) => (typeof c === "string" ? c : c?.text || ""))
                .filter(Boolean)
                .join(" ")
            : contentRaw;

          if (content) {
            const mappedRole: "user" | "agent" =
              roleRaw === "user" ? "user" : "agent";
            setConversation((prev) => [
              ...prev,
              {
                role: mappedRole,
                message: String(content),
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
          }
        } catch (e) {
          console.error("Failed to handle vapi message", e, m);
        }
      });
      vapi.on("error", (e: any) => {
        console.error(e);
      });
    } catch (e) {
      console.error(e);
    }

    return () => {
      // No explicit off() API—component unmount will end listeners on reload
    };
  }, []);

  const toggleConnection = async () => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    if (isConnected) {
      try {
        vapi.stop();
      } finally {
        setConversation([]);
      }
    } else {
      try {
        const res = await fetch("/api/vapi/assistants/in-app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callType: "checkup",
            ghl_pit_token: profile?.ghl_pit_token,
            ghl_location_id: profile?.ghl_location_id,
            model: { messages: [] },
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to create assistant");
        }
        const assistant = await res.json();
        setConversation([{
          role: "agent",
          message: "Connecting to voice assistant...",
          timestamp: new Date().toLocaleTimeString(),
        }]);
        vapi.start(assistant.id);
        const muted = vapi.isMuted();
        if (muted) vapi.setMuted(false);
        setIsMuted(vapi.isMuted());
      } catch (e: any) {
        console.error(e);
        setConversation([{
          role: "agent",
          message: e?.message || "Failed to connect to assistant",
          timestamp: new Date().toLocaleTimeString(),
        }]);
      }
    }
  };

  const toggleMute = () => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    const next = !isMuted;
    vapi.setMuted(next);
    setIsMuted(vapi.isMuted());
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

            {/* Mute Button */}
            {isConnected && (
              <Button
                onClick={toggleMute}
                size="lg"
                variant={isMuted ? "default" : "outline"}
                className={`h-16 w-16 rounded-full ${
                  isMuted
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {isMuted ? (
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
            ) : isMuted ? (
              <p className="text-white/70">Mic muted</p>
            ) : isListening ? (
              <p className="text-white/70">Listening...</p>
            ) : (
              <p className="text-white/70">Tap microphone to speak</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
