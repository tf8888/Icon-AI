"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, UserPlus, Mail, Phone, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfile } from "@/lib/contexts/ProfileContext";
import { useGHLContactsService, GHLContact, GHLCreateContactData } from "@/lib/services/ghlContactsService";
import { ContactModal } from "@/components/contact-modal";
import { DeleteContactDialog } from "@/components/delete-contact-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ContactsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const ghlService = useGHLContactsService(profile?.ghl_pit_token, profile?.ghl_location_id);
    const { toast } = useToast();

    const [contacts, setContacts] = useState<GHLContact[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<GHLContact | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch contacts from GHL
    const fetchContacts = async () => {
        if (!ghlService) return;

        setLoading(true);
        try {
            const response = await ghlService.getContacts({ limit: 100 });
            setContacts(response.contacts || []);
            setCurrentPage(1); // Reset to first page when fetching new data
        } catch (error: any) {
            console.error('Error fetching contacts:', error);
            toast({
                title: "Error",
                description: "Failed to fetch contacts from GoHighLevel",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Search contacts
    const searchContacts = async (query: string) => {
        if (!ghlService || !query.trim()) {
            fetchContacts();
            return;
        }

        setLoading(true);
        try {
            const response = await ghlService.searchContacts(query, 100);
            setContacts(response.contacts || []);
            setCurrentPage(1); // Reset to first page when searching
        } catch (error: any) {
            console.error('Error searching contacts:', error);
            toast({
                title: "Error",
                description: "Failed to search contacts",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle contact creation
    const handleCreateContact = async (contactData: GHLCreateContactData) => {
        if (!ghlService) return;

        setActionLoading(true);
        try {
            await ghlService.createContact(contactData);
            toast({
                title: "Success",
                description: "Contact created successfully"
            });
            setTimeout(() => {
                fetchContacts()
            }, 5000)
        } catch (error: any) {
            console.error('Error creating contact:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to create contact",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Handle contact update
    const handleUpdateContact = async (contactData: GHLCreateContactData) => {
        if (!ghlService || !selectedContact?.id) return;

        setActionLoading(true);
        try {
            await ghlService.updateContact(selectedContact.id, {
                ...contactData,
                id: selectedContact.id
            });
            toast({
                title: "Success",
                description: "Contact updated successfully"
            });
            setTimeout(() => {
                fetchContacts()
            }, 3000)
        } catch (error: any) {
            console.error('Error updating contact:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to update contact",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Handle contact deletion
    const handleDeleteContact = async () => {
        if (!ghlService || !selectedContact?.id) return;

        setActionLoading(true);
        try {
            await ghlService.deleteContact(selectedContact.id);
            toast({
                title: "Success",
                description: "Contact deleted successfully"
            });

            setTimeout(() => {
                fetchContacts()
            }, 5000)
        } catch (error: any) {
            console.error('Error deleting contact:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete contact",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(contacts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentContacts = contacts.slice(startIndex, endIndex);

    // Effect to fetch contacts when GHL service is ready
    useEffect(() => {
        if (ghlService && !profileLoading) {
            fetchContacts();
        }
    }, [ghlService, profileLoading]);

    // Effect for search debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                searchContacts(searchTerm);
            } else {
                fetchContacts();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Listen for contact updates
    useEffect(() => {
        const handleContactUpdate = () => {
            // Add 3-second delay to allow GHL API to propagate changes
            setTimeout(() => {
                fetchContacts()
            }, 3000)
        }

        window.addEventListener('contactUpdated', handleContactUpdate)

        return () => {
            window.removeEventListener('contactUpdated', handleContactUpdate)
        }
    }, [])

    // Reset to valid page if current page exceeds total pages
    useEffect(() => {
        if (contacts.length > 0 && totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [contacts.length, totalPages, currentPage]);

    // Show loading state while profile is loading
    if (profileLoading || (!profile?.ghl_pit_token && !profileLoading)) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    {profileLoading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p>Loading profile...</p>
                        </>
                    ) : (
                        <>
                            <Users className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                GoHighLevel integration not configured. Please set up your GHL tokens in settings.
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const hotLeads = contacts.filter(contact =>
        contact.tags?.some(tag => tag.toLowerCase().includes('hot')) ||
        contact.source?.toLowerCase().includes('hot')
    ).length;

    const warmLeads = contacts.filter(contact =>
        contact.tags?.some(tag => tag.toLowerCase().includes('warm')) ||
        contact.source?.toLowerCase().includes('warm')
    ).length;

    const coldLeads = contacts.filter(contact =>
        contact.tags?.some(tag => tag.toLowerCase().includes('cold')) ||
        contact.source?.toLowerCase().includes('cold')
    ).length;

    // Pagination component
    const PaginationComponent = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-700">
                    <span>
                        Showing {startIndex + 1} to {Math.min(endIndex, contacts.length)} of {contacts.length} contacts
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>

                    {pageNumbers.map((pageNum) => (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                        >
                            {pageNum}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                                    <p className="text-2xl font-bold">{contacts.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Hot Leads</p>
                                    <p className="text-2xl font-bold">{hotLeads}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Warm Leads</p>
                                    <p className="text-2xl font-bold">{warmLeads}</p>
                                </div>
                                <UserPlus className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cold Leads</p>
                                    <p className="text-2xl font-bold">{coldLeads}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Contacts</CardTitle>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search contacts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-64"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setSelectedContact(null);
                                        setContactModalOpen(true);
                                    }}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Contact
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading contacts...</span>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'No contacts found matching your search.' : 'No contacts found. Create your first contact!'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {`${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">
                                                    {contact.firstName} {contact.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{contact.email}</p>
                                                <p className="text-sm text-muted-foreground">{contact.phone}</p>
                                                {contact.companyName && (
                                                    <p className="text-sm text-muted-foreground">{contact.companyName}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {contact.tags && contact.tags.length > 0 && (
                                                <div className="flex gap-1">
                                                    {contact.tags.slice(0, 2).map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setContactModalOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                            {/* {contact.phone && (
                                                <Button variant="outline" size="sm">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Call
                                                </Button>
                                            )}
                                            {contact.email && (
                                                <Button variant="outline" size="sm">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Email
                                                </Button>
                                            )} */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Always show pagination */}
                        {contacts.length > 0 && <PaginationComponent />}
                    </CardContent>
                </Card>
            </div>

            <ContactModal
                open={contactModalOpen}
                onOpenChange={setContactModalOpen}
                onSubmit={selectedContact ? handleUpdateContact : handleCreateContact}
                contact={selectedContact}
                loading={actionLoading}
            />

            <DeleteContactDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteContact}
                contact={selectedContact}
                loading={actionLoading}
            />
        </>
    );
}