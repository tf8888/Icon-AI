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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageCircle, Loader2, Plus } from "lucide-react";
import { useProfile } from "@/lib/contexts/ProfileContext";
import { useGHLConversationsService } from "@/lib/services/ghlConversationsService";

interface Contact {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
}

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConversationCreated?: () => void;
}

export function NewConversationModal({
    isOpen,
    onClose,
    onConversationCreated,
}: NewConversationModalProps) {
    const { profile } = useProfile();
    const conversationsService = useGHLConversationsService(
        profile?.ghl_pit_token,
        profile?.ghl_location_id
    );

    const [step, setStep] = useState<"select-contact" | "create-message">("select-contact");
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Message form fields
    const [messageType, setMessageType] = useState<"SMS" | "Email">("SMS");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep("select-contact");
            setSelectedContact(null);
            setSearchTerm("");
            setMessage("");
            setSubject("");
            setError(null);
            fetchContacts();
        }
    }, [isOpen]);

    const fetchContacts = async () => {
        if (!profile?.ghl_pit_token || !profile?.ghl_location_id) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/ghl/contacts?access_token=${profile.ghl_pit_token}&location_id=${profile.ghl_location_id}&limit=100`);
            if (!response.ok) throw new Error('Failed to fetch contacts');

            const data = await response.json();
            setContacts(data.contacts || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchContacts = async () => {
        if (!profile?.ghl_pit_token || !profile?.ghl_location_id || !searchTerm.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/ghl/contacts?access_token=${profile.ghl_pit_token}&location_id=${profile.ghl_location_id}&query=${encodeURIComponent(searchTerm.trim())}&limit=50`);
            if (!response.ok) throw new Error('Failed to search contacts');

            const data = await response.json();
            setContacts(data.contacts || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error searching contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    // Search contacts when search term changes
    useEffect(() => {
        if (searchTerm.trim()) {
            const timeoutId = setTimeout(searchContacts, 300);
            return () => clearTimeout(timeoutId);
        } else {
            fetchContacts();
        }
    }, [searchTerm, profile]);

    const handleContactSelect = (contact: Contact) => {
        setSelectedContact(contact);
        setStep("create-message");
    };

    const handleCreateConversation = async () => {
        if (!selectedContact || !conversationsService) return;

        // Validate email requirements if sending an email message
        if (message.trim() && messageType === "Email") {
            if (!selectedContact.email) {
                setError("Cannot send email: Selected contact does not have an email address");
                return;
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(selectedContact.email)) {
                setError("Cannot send email: Contact's email address is invalid");
                return;
            }
        }

        setCreating(true);
        setError(null);

        try {
            // First create the conversation
            await conversationsService.createConversation({
                contactId: selectedContact.id,
            });

            // If there's a message, send it
            if (message.trim()) {
                const messageData = {
                    type: messageType,
                    contactId: selectedContact.id,
                    message: message.trim(),
                    ...(messageType === "Email" && subject.trim() && { subject: subject.trim() })
                };

                await conversationsService.createMessage(messageData);
            }

            // Reset form and close modal
            setStep("select-contact");
            setSelectedContact(null);
            setMessage("");
            setSubject("");
            onClose();

            // Notify parent component to refresh conversations list
            if (onConversationCreated) {
                onConversationCreated();
            }
        } catch (err: any) {
            // Handle specific case where conversation already exists
            if (err.message && err.message.startsWith('CONVERSATION_EXISTS:')) {
                const conversationId = err.message.split(':')[1];
                setError(`A conversation with ${getContactDisplayName(selectedContact)} already exists. You can find it in your conversations list.`);

                // If there's still a message to send, try sending it to the existing conversation
                if (message.trim()) {
                    try {
                        const messageData = {
                            type: messageType,
                            contactId: selectedContact.id,
                            message: message.trim(),
                            ...(messageType === "Email" && subject.trim() && { subject: subject.trim() })
                        };

                        await conversationsService.createMessage(messageData);

                        // Update error message to indicate message was sent
                        setError(`A conversation with ${getContactDisplayName(selectedContact)} already exists, but your message has been sent successfully!`);

                        // Reset form and close modal after a short delay
                        setTimeout(() => {
                            setStep("select-contact");
                            setSelectedContact(null);
                            setMessage("");
                            setSubject("");
                            setError(null);
                            onClose();

                            if (onConversationCreated) {
                                onConversationCreated();
                            }
                        }, 2000);
                    } catch (msgErr) {
                        const errorMessage = msgErr instanceof Error ? msgErr.message : String(msgErr);
                        let friendlyError = errorMessage;

                        // Parse specific error messages
                        if (errorMessage.includes("contact's e-mail is invalid")) {
                            friendlyError = "Cannot send email: Contact's email address is invalid or missing";
                        } else if (errorMessage.includes("Unable to send e-mail")) {
                            friendlyError = "Failed to send email: Contact's email is invalid";
                        }

                        setError(`Conversation already exists with ${getContactDisplayName(selectedContact)}, and failed to send message: ${friendlyError}`);
                    }
                }
            } else {
                // Parse specific error messages for better user experience
                let errorMessage = err.message;
                if (errorMessage.includes("contact's e-mail is invalid")) {
                    errorMessage = "Cannot send email: Contact's email address is invalid or missing";
                } else if (errorMessage.includes("Unable to send e-mail")) {
                    errorMessage = "Failed to send email: Contact's email is invalid";
                }

                setError(errorMessage);
            }
            console.error('Error creating conversation:', err);
        } finally {
            setCreating(false);
        }
    };

    const getContactDisplayName = (contact: Contact): string => {
        return contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email || contact.phone || 'Unknown Contact';
    };

    const getContactInitials = (contact: Contact): string => {
        const name = getContactDisplayName(contact);
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const filteredContacts = contacts.filter(contact =>
        getContactDisplayName(contact).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phone && contact.phone.includes(searchTerm))
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>
                        {step === "select-contact" ? "Start New Conversation" : "Create Message"}
                    </DialogTitle>
                </DialogHeader>

                {step === "select-contact" ? (
                    <>
                        <div className="flex-shrink-0 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search contacts by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            {error && (
                                <div className={`text-sm p-2 rounded ${error.includes('successfully') || error.includes('has been sent')
                                    ? 'text-green-700 bg-green-50 border border-green-200'
                                    : 'text-red-500 bg-red-50 border border-red-200'
                                    }`}>
                                    {error}
                                </div>
                            )}
                        </div>

                        <ScrollArea className="flex-1">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Loading contacts...</span>
                                </div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium mb-2">No contacts found</p>
                                    <p className="text-muted-foreground">
                                        {searchTerm.trim()
                                            ? `No contacts match "${searchTerm}"`
                                            : "No contacts available"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleContactSelect(contact)}
                                        >
                                            <Avatar>
                                                <AvatarImage src="/placeholder.svg" alt={getContactDisplayName(contact)} />
                                                <AvatarFallback>
                                                    {getContactInitials(contact)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{getContactDisplayName(contact)}</p>
                                                <div className="text-sm text-muted-foreground">
                                                    {contact.email && <p>{contact.email}</p>}
                                                    {contact.phone && <p>{contact.phone}</p>}
                                                </div>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </>
                ) : (
                    <>
                        <div className="flex-shrink-0">
                            {selectedContact && (
                                <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/25">
                                    <Avatar>
                                        <AvatarImage src="/placeholder.svg" alt={getContactDisplayName(selectedContact)} />
                                        <AvatarFallback>
                                            {getContactInitials(selectedContact)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{getContactDisplayName(selectedContact)}</p>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedContact.email && <span>{selectedContact.email}</span>}
                                            {selectedContact.phone && selectedContact.email && <span> • </span>}
                                            {selectedContact.phone && <span>{selectedContact.phone}</span>}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setStep("select-contact")}
                                    >
                                        Change Contact
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message-type">Message Type</Label>
                                <Select value={messageType} onValueChange={(value: "SMS" | "Email") => {
                                    // Only allow Email if contact has valid email
                                    if (value === "Email" && (!selectedContact?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedContact.email))) {
                                        return; // Don't change to Email if invalid
                                    }
                                    setMessageType(value);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SMS">SMS</SelectItem>
                                        <SelectItem
                                            value="Email"
                                            disabled={!selectedContact?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedContact?.email || "")}
                                        >
                                            Email
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {(!selectedContact?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedContact?.email || "")) && (
                                    <p className="text-xs text-yellow-600">
                                        ⚠️ Email unavailable - Contact has no valid email address
                                    </p>
                                )}
                            </div>

                            {messageType === "Email" && (
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Email subject..."
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder={`Type your ${messageType.toLowerCase()} message...`}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="min-h-[120px]"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to create a conversation without sending an initial message.
                                </p>
                            </div>

                            {error && (
                                <div className={`text-sm p-2 rounded ${error.includes('successfully') || error.includes('has been sent')
                                    ? 'text-green-700 bg-green-50 border border-green-200'
                                    : 'text-red-500 bg-red-50 border border-red-200'
                                    }`}>
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex-shrink-0 flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setStep("select-contact")}
                                disabled={creating}
                            >
                                Back
                            </Button>
                            <Button onClick={handleCreateConversation} disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Create Conversation
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}