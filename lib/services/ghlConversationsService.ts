// GHL Conversation Types
export interface GHLMessage {
  id?: string;
  type?: string | number;
  body?: string;
  direction?: "inbound" | "outbound";
  status?: string;
  contactId?: string;
  userId?: string;
  dateAdded?: string;
  dateUpdated?: string;
  locationId?: string;
  contentType?: string;
  conversationId?: string;
  source?: string;
  messageType?: string;
  attachments?: any[];
  meta?: Record<string, any>;
}

export interface GHLConversation {
  id?: string;
  contactId?: string;
  locationId?: string;
  assignedTo?: string;
  lastMessageBody?: string;
  lastMessageType?: string | number;
  lastMessageDirection?: "inbound" | "outbound";
  inbox?: string;
  contactName?: string;
  contactNumber?: string;
  contactEmail?: string;
  unreadCount?: number;
  fullName?: string;
  lastMessageDate?: string;
  dateUpdated?: string;
  dateAdded?: string;
  messages?: GHLMessage[];
}

export interface GHLConversationsResponse {
  conversations: GHLConversation[];
  meta?: {
    total?: number;
    count?: number;
    nextPageUrl?: string;
    currentPage?: number;
    nextPage?: number;
    prevPage?: number;
  };
}

export interface GHLSearchConversationsParams {
  locationId?: string;
  limit?: number;
  skip?: number;
  startAfter?: string;
  startAfterId?: string;
  query?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
}

export interface GHLCreateMessageData {
  type?: "SMS" | "Email" | "Call" | "WhatsApp" | "GMB" | "FB";
  contactId: string;
  message?: string;
  subject?: string;
  attachments?: string[];
  emailFrom?: string;
  emailTo?: string;
  emailCc?: string[];
  emailBcc?: string[];
  html?: string;
  appointmentId?: string;
  replyMessageId?: string;
  templateId?: string;
  threadId?: string;
  scheduledTimestamp?: number;
  conversationProviderId?: string;
  emailReplyMode?: "reply" | "reply_all";
  fromNumber?: string;
  toNumber?: string;
  status?: string;
}

// GHL Conversations API Service
export class GHLConversationsService {
  private token: string;
  private locationId: string;
  private baseUrl = "https://services.leadconnectorhq.com";

  constructor(token: string, locationId: string) {
    this.token = token;
    this.locationId = locationId;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Version: "2021-04-15",
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Search conversations
  async searchConversations(
    params?: GHLSearchConversationsParams
  ): Promise<GHLConversationsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("locationId", params?.locationId || this.locationId);

    if (params?.limit) searchParams.append("limit", params.limit.toString());

    return this.makeRequest(`/conversations/search?${searchParams.toString()}`);
  }

  // Get all conversations (alias for searchConversations for consistency)
  async getConversations(
    params?: GHLSearchConversationsParams
  ): Promise<GHLConversationsResponse> {
    return this.searchConversations(params);
  }

  // Get a specific conversation by ID
  async getConversation(conversationId: string): Promise<GHLConversation> {
    return this.makeRequest(`/conversations/${conversationId}`);
  }

  // Get messages for a specific conversation
  async getConversationMessages(
    conversationId: string,
    params?: {
      limit?: number;
      skip?: number;
      lastMessageId?: string;
    }
  ): Promise<{ messages: GHLMessage[]; meta?: any }> {
    const searchParams = new URLSearchParams();

    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.skip) searchParams.append("skip", params.skip.toString());
    if (params?.lastMessageId)
      searchParams.append("lastMessageId", params.lastMessageId);

    const query = searchParams.toString();
    const endpoint = query
      ? `/conversations/${conversationId}/messages?${query}`
      : `/conversations/${conversationId}/messages`;

    return this.makeRequest(endpoint);
  }

  // Send a message to a conversation (using the messages endpoint)
  async sendMessage(
    conversationId: string,
    messageData: GHLCreateMessageData
  ): Promise<GHLMessage> {
    // Use the global messages endpoint as shown in the documentation
    return this.makeRequest("/conversations/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  // Create a new conversation directly
  async createConversation(data: {
    locationId?: string;
    contactId: string;
  }): Promise<GHLConversation> {
    // Use our API endpoint instead of direct GHL API call
    const response = await fetch("/api/ghl/conversations/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: this.token,
        locationId: data.locationId || this.locationId,
        contactId: data.contactId,
      }),
    });

    if (response.status === 409) {
      // Handle "conversation already exists" case
      const errorData = await response.json();
      throw new Error(`CONVERSATION_EXISTS:${errorData.conversationId}`);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Create a new message (same as sendMessage but clearer naming)
  async createMessage(messageData: GHLCreateMessageData): Promise<GHLMessage> {
    return this.makeRequest("/conversations/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  // Update conversation (mark as read, assign, etc.)
  async updateConversation(
    conversationId: string,
    updateData: {
      assigned?: boolean;
      assignedTo?: string;
      status?: string;
    }
  ): Promise<GHLConversation> {
    return this.makeRequest(`/conversations/${conversationId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await this.makeRequest(`/conversations/${conversationId}`, {
      method: "DELETE",
    });
  }

  // Search conversations by query
  async searchConversationsByQuery(
    query: string,
    limit?: number
  ): Promise<GHLConversationsResponse> {
    return this.searchConversations({ query, limit });
  }
}

// Hook to use GHL Conversations Service
import { useMemo } from "react";

export function useGHLConversationsService(
  token?: string | null,
  locationId?: string | null
) {
  return useMemo(() => {
    if (!token || !locationId) {
      return null;
    }
    return new GHLConversationsService(token, locationId);
  }, [token, locationId]);
}
