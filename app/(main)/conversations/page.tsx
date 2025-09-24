'use client'

import { ConversationThreadModal } from "@/components/conversation-thread-modal";
import { NewConversationModal } from "@/components/new-conversation-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, TrendingUp, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfile } from "@/lib/contexts/ProfileContext";
import { useGHLConversationsService, GHLConversation } from "@/lib/services/ghlConversationsService";

export default function ConversationsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const conversationsService = useGHLConversationsService(
        profile?.ghl_pit_token,
        profile?.ghl_location_id
    );

    const [searchTerm, setSearchTerm] = useState("")
    const [conversations, setConversations] = useState<GHLConversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedConversation, setSelectedConversation] = useState<any>(null) // Added state for conversation thread modal
    const [isConversationThreadOpen, setIsConversationThreadOpen] = useState(false) // Added state for conversation thread modal
    const [isNewConversationOpen, setIsNewConversationOpen] = useState(false) // Added state for new conversation modal

    // Fetch conversations on mount and when service is ready
    useEffect(() => {
        if (conversationsService && !profileLoading) {
            fetchConversations();
        }
    }, [conversationsService, profileLoading]);

    // Search conversations when search term changes
    useEffect(() => {
        if (conversationsService && !profileLoading) {
            if (searchTerm.trim()) {
                searchConversations();
            } else {
                fetchConversations();
            }
        }
    }, [searchTerm, conversationsService, profileLoading]);

    const fetchConversations = async () => {
        if (!conversationsService) return;

        setLoading(true);
        setError(null);
        try {
            const response = await conversationsService.getConversations({
                limit: 50,
                sort: 'desc',
                sortBy: 'date_updated'
            });
            setConversations(response.conversations || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchConversations = async () => {
        if (!conversationsService || !searchTerm.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await conversationsService.searchConversationsByQuery(
                searchTerm.trim(),
                50
            );
            setConversations(response.conversations || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error searching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const getConversationStatus = (conversation: GHLConversation): string => {
        // Map GHL conversation data to our status system
        if (conversation.unreadCount && conversation.unreadCount > 0) {
            return "active";
        }
        if (conversation.assignedTo) {
            return "pending";
        }
        return "waiting";
    }

    const formatTimestamp = (dateString?: string): string => {
        if (!dateString) return "Unknown";

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return diffMins < 1 ? "Just now" : `${diffMins} mins ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return "1 day ago";
        } else {
            return `${diffDays} days ago`;
        }
    };

    const getInitials = (name?: string): string => {
        if (!name) return "??";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleReplyClick = (conversation: GHLConversation) => {
        // Added function to handle reply button click
        setSelectedConversation(conversation)
        setIsConversationThreadOpen(true)
    }

    const handleNewConversationClick = () => {
        setIsNewConversationOpen(true);
    }

    const handleConversationCreated = () => {
        // Refresh conversations list when a new conversation is created
        fetchConversations();
    }

    // Calculate stats from real data
    const totalConversations = conversations.length;

    const activeConversations = conversations.filter(c => getConversationStatus(c) === "active").length;
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading profile...</span>
            </div>
        );
    }

    if (!profile?.ghl_pit_token || !profile?.ghl_location_id) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-lg font-semibold mb-2">GHL Integration Required</h2>
                    <p className="text-muted-foreground">
                        Please configure your GoHighLevel token and location ID in settings to view conversations.
                    </p>
                </div>
            </div>
        );
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
                                    <p className="text-2xl font-bold">{totalConversations}</p>
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
                                    <p className="text-2xl font-bold">{activeConversations}</p>
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
                                    <p className="text-2xl font-bold">{totalUnread}</p>
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
                                <Button size="sm" onClick={handleNewConversationClick}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    New Message
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading conversations...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-500 mb-2">Error loading conversations</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={fetchConversations}
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-lg font-medium mb-2">No conversations found</p>
                                <p className="text-muted-foreground">
                                    {searchTerm.trim()
                                        ? `No conversations match "${searchTerm}"`
                                        : "No conversations available"
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {conversations.map((conversation) => {
                                    const status = getConversationStatus(conversation);
                                    const displayName = conversation.contactName || conversation.fullName || `Contact ${conversation.contactId}`;

                                    return (
                                        <div
                                            key={conversation.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <Avatar>
                                                        <AvatarImage src="/placeholder.svg" alt={displayName} />
                                                        <AvatarFallback>
                                                            {getInitials(displayName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {(conversation.unreadCount || 0) > 0 && (
                                                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                                            {conversation.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold">{displayName}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-md">
                                                        {conversation.lastMessageBody || "No messages yet"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTimestamp(conversation.lastMessageDate || conversation.dateUpdated)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getConversationStatusColor(status)}>{status}</Badge>
                                                <Button variant="outline" size="sm" onClick={() => handleReplyClick(conversation)}>
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Reply
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConversationThreadModal
                isOpen={isConversationThreadOpen}
                onClose={() => setIsConversationThreadOpen(false)}
                conversation={selectedConversation}
            />

            <NewConversationModal
                isOpen={isNewConversationOpen}
                onClose={() => setIsNewConversationOpen(false)}
                onConversationCreated={handleConversationCreated}
            />
        </>
    )
}