"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, Mail, MoreVertical, Loader2 } from "lucide-react";
import { useProfile } from "@/lib/contexts/ProfileContext";
import { useGHLConversationsService, GHLConversation, GHLMessage } from "@/lib/services/ghlConversationsService";

interface ConversationThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: GHLConversation | null;
}

export function ConversationThreadModal({
  isOpen,
  onClose,
  conversation,
}: ConversationThreadModalProps) {
  const { profile } = useProfile();
  const conversationsService = useGHLConversationsService(
    profile?.ghl_pit_token,
    profile?.ghl_location_id
  );

  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"SMS" | "Email">("SMS");
  const [messages, setMessages] = useState<GHLMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation?.id && conversationsService && isOpen) {
      fetchMessages();
    }
  }, [conversation?.id, conversationsService, isOpen]);

  const fetchMessages = async () => {
    if (!conversation?.id || !conversationsService) return;

    setLoading(true);
    setError(null);
    try {
      const { messages: response } = await conversationsService.getConversationMessages(
        conversation.id,
        { limit: 50 }
      );
      console.log("GHL messages response:", response); // Debug log

      // Extract messages from response and sort by dateUpdated (oldest first)
      let messagesArray: GHLMessage[] = [];
      if (response && Array.isArray(response?.messages)) {
        messagesArray = response.messages.sort((a: GHLMessage, b: GHLMessage) => {
          const dateA = new Date(a.dateUpdated || a.dateAdded || 0).getTime();
          const dateB = new Date(b.dateUpdated || b.dateAdded || 0).getTime();
          return dateA - dateB; // Oldest first
        });
      }

      console.log("Sorted messages array:", messagesArray); // Debug log
      setMessages(messagesArray);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching messages:", err);
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation?.contactId || !conversationsService) return;

    // Validate email requirements
    if (messageType === "Email") {
      if (!conversation.contactEmail) {
        setError("Cannot send email: Contact does not have an email address");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(conversation.contactEmail)) {
        setError("Cannot send email: Contact's email address is invalid");
        return;
      }
    }

    setSending(true);
    setError(null);
    try {
      const messageData = {
        type: messageType,
        contactId: conversation.contactId!,
        message: newMessage.trim(),
        ...(messageType === "Email" && {
          subject: `Re: Conversation with ${conversation.contactName || conversation.fullName || 'Contact'}`
        })
      };

      // Send message using the global messages endpoint
      await conversationsService.createMessage(messageData);
      setNewMessage("");
      // Refetch messages to show the new one
      try {
        await fetchMessages();
      } catch (refreshErr) {
        console.warn("Failed to refresh messages after sending:", refreshErr);
      }
    } catch (err: any) {
      // Parse specific error messages
      let errorMessage = err.message;
      if (errorMessage.includes("contact's e-mail is invalid")) {
        errorMessage = "Cannot send email: Contact's email address is invalid or missing";
      } else if (errorMessage.includes("Unable to send e-mail")) {
        errorMessage = "Failed to send email: Contact's email is invalid";
      }

      setError(errorMessage);
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const getMessageTypeColor = (type: string | number) => {
    // Handle numeric type values from GHL API
    const typeStr = typeof type === 'number'
      ? getMessageTypeString(type)
      : (type?.toLowerCase() || 'unknown');

    switch (typeStr) {
      case "email":
        return "bg-blue-100 text-blue-800";
      case "sms":
      case "phone":
        return "bg-green-100 text-green-800";
      case "call":
        return "bg-purple-100 text-purple-800";
      case "facebook":
      case "messenger":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "group sms":
        return "bg-green-100 text-green-800";
      case "internal chat":
        return "bg-gray-100 text-gray-800";
      case "whatsapp":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMessageTypeString = (type: number): string => {
    switch (type) {
      case 1:
        return "phone";
      case 2:
        return "email";
      case 3:
        return "facebook";
      case 4:
        return "review";
      case 5:
        return "group sms";
      case 6:
        return "internal chat";
      default:
        return "unknown";
    }
  };

  const getMessageTypeDisplay = (type: string | number): string => {
    if (typeof type === 'number') {
      switch (type) {
        case 1:
          return "PHONE";
        case 2:
          return "EMAIL";
        case 3:
          return "FACEBOOK";
        case 4:
          return "REVIEW";
        case 5:
          return "GROUP SMS";
        case 6:
          return "INTERNAL CHAT";
        default:
          return "UNKNOWN";
      }
    }
    return (type || "TEXT").toUpperCase();
  };

  const getConversationStatus = (conversation: GHLConversation): string => {
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      return "active";
    }
    if (conversation.assignedTo) {
      return "pending";
    }
    return "waiting";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "waiting":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (dateString?: string): string => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? "Just now" : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "1d ago";
    } else {
      return `${diffDays}d ago`;
    }
  };

  if (!conversation) return null;

  const displayName = conversation.contactName || conversation.fullName || `Contact ${conversation.contactId}`;
  const status = getConversationStatus(conversation);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg"
                  alt={displayName}
                />
                <AvatarFallback>
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">
                  {displayName}
                </DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getStatusColor(status)}>
                    {status}
                  </Badge>
                  {(conversation.unreadCount || 0) > 0 && (
                    <Badge variant="secondary">
                      {conversation.unreadCount} unread
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {/* <div className="flex items-center space-x-2">
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
            </div> */}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading messages...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">Error loading messages</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchMessages}
              >
                Try Again
              </Button>
            </div>
          ) : !Array.isArray(messages) || messages.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-muted-foreground">
                Start the conversation by sending a message below.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {Array.isArray(messages) && messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${message.direction === "outbound"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getMessageTypeColor(message.type || "text")}`}
                      >
                        {getMessageTypeDisplay(message.type || "text")}
                      </Badge>
                      <span className="text-xs opacity-70">
                        {formatTimestamp(message.dateUpdated || message.dateAdded)}
                      </span>
                    </div>
                    <p className="text-sm">{message.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Button
              variant={messageType === "SMS" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageType("SMS")}
            >
              SMS
            </Button>
            <Button
              variant={messageType === "Email" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageType("Email")}
              disabled={!conversation?.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(conversation?.contactEmail || "")}
              title={!conversation?.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(conversation?.contactEmail || "")
                ? "Contact has no valid email address"
                : ""}
            >
              Email
            </Button>
            {(!conversation?.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(conversation?.contactEmail || "")) && (
              <span className="text-xs text-muted-foreground">
                Email unavailable - invalid contact email
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder={`Type your ${messageType.toLowerCase()} message...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !sending && handleSendMessage()}
              className="flex-1"
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
