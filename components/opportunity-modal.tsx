"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useProfile } from "@/lib/contexts/ProfileContext"
import { useToast } from "@/hooks/use-toast"
import type { GHLCustomField } from "@/lib/services/ghlOpportunitiesService"

interface OpportunityModalProps {
  isOpen: boolean
  onClose: () => void
  opportunity?: any
  mode: "create" | "edit"
  onSuccess?: () => void // Callback for successful create/update
}

interface Pipeline {
  id: string
  name: string
  stages?: Array<{
    id: string
    name: string
    position?: number
  }>
}

interface Contact {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
}

export function OpportunityModal({ isOpen, onClose, opportunity, mode, onSuccess }: OpportunityModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [loadingPipelines, setLoadingPipelines] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [contactSearchTerm, setContactSearchTerm] = useState("")
  const { profile } = useProfile()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "", // Changed from title to name to match GHL API
    contactId: "",
    monetaryValue: "", // Changed from value to monetaryValue to match GHL API
    pipelineId: "", // Added pipelineId as required field
    pipelineStageId: "", // Changed from stage to pipelineStageId
    status: "open", // Set default status as "open"
    assignedTo: "",
    source: "",
    notes: "", // Changed from description to notes to match GHL API
    customFields: [] as GHLCustomField[], // Added customFields support with proper typing
  })

  // Fetch pipelines and contacts when modal opens (both create and edit modes)
  useEffect(() => {
    if (isOpen && profile?.ghl_pit_token && profile?.ghl_location_id) {
      console.log(`Modal opened in ${mode} mode, fetching pipelines and contacts`)
      fetchPipelines()
      fetchContacts()
    }
  }, [isOpen, mode, profile?.ghl_pit_token, profile?.ghl_location_id])

  // Debounce contact search
  useEffect(() => {
    if (isOpen && profile?.ghl_pit_token && profile?.ghl_location_id) {
      const timeoutId = setTimeout(() => {
        fetchContacts(contactSearchTerm)
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [contactSearchTerm, isOpen, profile?.ghl_pit_token, profile?.ghl_location_id])

  const fetchPipelines = async () => {
    if (!profile?.ghl_pit_token || !profile?.ghl_location_id) {
      console.log("Missing GHL credentials:", { token: !!profile?.ghl_pit_token, locationId: !!profile?.ghl_location_id })
      return
    }

    try {
      setLoadingPipelines(true)
      const params = new URLSearchParams({
        access_token: profile.ghl_pit_token,
        location_id: profile.ghl_location_id,
      })

      console.log("Fetching pipelines with params:", params.toString())

      const response = await fetch(`/api/ghl/pipelines?${params}`)

      console.log("Pipeline API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Pipeline API error response:", errorText)
        throw new Error(`Failed to fetch pipelines: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Pipeline API response data:", data)

      // Handle different possible response structures
      let pipelinesArray = []
      if (data.pipelines) {
        pipelinesArray = data.pipelines
      } else if (Array.isArray(data)) {
        pipelinesArray = data
      } else if (data.data && Array.isArray(data.data)) {
        pipelinesArray = data.data
      }

      console.log("Processed pipelines array:", pipelinesArray)
      setPipelines(pipelinesArray)

      // Only auto-select pipeline for create mode
      if (mode === "create" && pipelinesArray.length === 1) {
        setFormData(prev => ({
          ...prev,
          pipelineId: pipelinesArray[0].id,
          // Set default stage to first stage if available
          pipelineStageId: pipelinesArray[0].stages?.[0]?.id || ""
        }))
      }

      // For edit mode, validate that the current pipelineId exists in loaded pipelines
      if (mode === "edit" && formData.pipelineId) {
        const existingPipeline = pipelinesArray.find(p => p.id === formData.pipelineId)
        if (!existingPipeline) {
          console.warn("Current pipeline ID not found in loaded pipelines:", formData.pipelineId)
        } else {
          console.log("Pipeline loaded successfully for edit mode:", existingPipeline.name)
        }
      }
    } catch (error) {
      console.error("Error fetching pipelines:", error)
      toast({
        title: "Error",
        description: `Failed to fetch pipelines from GoHighLevel: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoadingPipelines(false)
    }
  }

  const fetchContacts = async (searchQuery = "") => {
    if (!profile?.ghl_pit_token || !profile?.ghl_location_id) {
      console.log("Missing GHL credentials for contacts:", { token: !!profile?.ghl_pit_token, locationId: !!profile?.ghl_location_id })
      return
    }

    try {
      setLoadingContacts(true)
      const params = new URLSearchParams({
        access_token: profile.ghl_pit_token,
        location_id: profile.ghl_location_id,
        limit: "50", // Limit to 50 contacts for performance
      })

      if (searchQuery) {
        params.append("query", searchQuery)
      }

      console.log("Fetching contacts with params:", params.toString())

      const response = await fetch(`/api/ghl/contacts?${params}`)

      console.log("Contacts API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Contacts API error response:", errorText)
        throw new Error(`Failed to fetch contacts: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Contacts API response data:", data)

      // Handle different possible response structures
      let contactsArray = []
      if (data.contacts) {
        contactsArray = data.contacts
      } else if (Array.isArray(data)) {
        contactsArray = data
      } else if (data.data && Array.isArray(data.data)) {
        contactsArray = data.data
      }

      console.log("Processed contacts array:", contactsArray)
      setContacts(contactsArray)

    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Error",
        description: `Failed to fetch contacts from GoHighLevel: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoadingContacts(false)
    }
  }

  useEffect(() => {
    if (mode === "edit" && opportunity) {
      console.log("Setting form data for edit mode:", opportunity)
      setFormData({
        name: opportunity.name || "",
        contactId: opportunity.contactId || "",
        monetaryValue: opportunity.monetaryValue?.toString() || "",
        pipelineId: opportunity.pipelineId || "",
        pipelineStageId: opportunity.pipelineStageId || "",
        status: opportunity.status || "open",
        assignedTo: opportunity.assignedTo || "",
        source: opportunity.source || "",
        notes: opportunity.notes || "",
        customFields: opportunity.customFields || [],
      })
    } else if (mode === "create") {
      console.log("Setting form data for create mode")
      setFormData({
        name: "",
        contactId: "",
        monetaryValue: "",
        pipelineId: "",
        pipelineStageId: "",
        status: "open",
        assignedTo: "",
        source: "",
        notes: "",
        customFields: [],
      })
    }
  }, [mode, opportunity, isOpen])

  // Ensure pipelines are available for edit mode when form data is set
  useEffect(() => {
    if (mode === "edit" && opportunity && pipelines.length > 0 && formData.pipelineId) {
      // Verify the pipeline exists in the loaded pipelines
      const pipeline = pipelines.find(p => p.id === formData.pipelineId)
      if (pipeline) {
        console.log("Pipeline found for edit mode:", pipeline)
        // The form data is already set, but we can add any additional logic here if needed
      } else {
        console.warn("Pipeline not found in loaded pipelines for edit mode:", formData.pipelineId)
      }
    }
  }, [mode, opportunity, pipelines, formData.pipelineId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile?.ghl_pit_token || !profile?.ghl_location_id) {
      toast({
        title: "Error",
        description: "GoHighLevel credentials are missing. Please check your profile settings.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields for creation
    if (mode === "create" && (!formData.name || !formData.pipelineId || !formData.contactId)) {
      toast({
        title: "Validation Error",
        description: "Name, Pipeline, and Contact selection are required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const opportunityData = {
        name: formData.name,
        contactId: formData.contactId,
        monetaryValue: formData.monetaryValue ? parseFloat(formData.monetaryValue) : 0,
        pipelineId: formData.pipelineId,
        pipelineStageId: formData.pipelineStageId || undefined,
        status: formData.status,
        assignedTo: formData.assignedTo || undefined,
        source: formData.source || undefined,
        notes: formData.notes || undefined,
        customFields: formData.customFields.length > 0 ? formData.customFields : undefined,
      }

      console.log("Submitting opportunity data:", opportunityData)

      let requestBody, endpoint, method

      if (mode === "create") {
        requestBody = {
          accessToken: profile.ghl_pit_token,
          locationId: profile.ghl_location_id,
          opportunity: opportunityData,
        }
        endpoint = "/api/ghl/opportunities"
        method = "POST"
      } else {
        // For updates, send the opportunity data directly as updates
        requestBody = {
          accessToken: profile.ghl_pit_token,
          locationId: profile.ghl_location_id,
          opportunityId: opportunity.id,
          updates: opportunityData,
        }
        endpoint = "/api/ghl/opportunities"
        method = "PUT"
      }

      console.log("Request body:", requestBody)

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("API Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("API Response result:", result)
        toast({
          title: "Success",
          description: `Opportunity ${mode === "create" ? "created" : "updated"} successfully`,
        })
        onClose()
        // Refresh the parent component by dispatching a custom event
        window.dispatchEvent(new CustomEvent('opportunityUpdated'))
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("API Error:", errorData)
        toast({
          title: "Error",
          description: errorData.error || `Failed to ${mode} opportunity`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} opportunity:`, error)
      toast({
        title: "Error",
        description: `Error ${mode === "create" ? "creating" : "updating"} opportunity`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSelectedPipeline = () => {
    return pipelines.find(p => p.id === formData.pipelineId)
  }

  const getContactDisplayName = (contact: Contact) => {
    if (contact.name) {
      return contact.name
    }
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
    }
    return contact.email || contact.phone || "Unknown Contact"
  }

  const getSelectedContact = () => {
    return contacts.find(c => c.id === formData.contactId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Opportunity" : "Edit Opportunity"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new opportunity to track potential deals and revenue."
              : "Update the opportunity details and track progress."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Opportunity Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Redesign Project"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monetaryValue">Value ($) *</Label>
              <Input
                id="monetaryValue"
                type="number"
                value={formData.monetaryValue}
                onChange={(e) => setFormData({ ...formData, monetaryValue: e.target.value })}
                placeholder="15000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pipelineId">Pipeline *</Label>
              <Select
                value={formData.pipelineId}
                onValueChange={(value) => {
                  const selectedPipeline = pipelines.find(p => p.id === value)
                  setFormData({
                    ...formData,
                    pipelineId: value,
                    // Reset stage when pipeline changes
                    pipelineStageId: selectedPipeline?.stages?.[0]?.id || ""
                  })
                }}
                disabled={loadingPipelines}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPipelines ? "Loading pipelines..." : "Select pipeline"} />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((pipeline) => (
                    <SelectItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pipelineStageId">Stage</Label>
              <Select
                value={formData.pipelineStageId}
                onValueChange={(value) => setFormData({ ...formData, pipelineStageId: value })}
                disabled={!formData.pipelineId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {getSelectedPipeline()?.stages?.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactId">Contact *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search contacts..."
                  value={contactSearchTerm}
                  onChange={(e) => setContactSearchTerm(e.target.value)}
                  disabled={loadingContacts}
                />
                <Select
                  value={formData.contactId}
                  onValueChange={(value) => setFormData({ ...formData, contactId: value })}
                  disabled={loadingContacts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingContacts ? "Loading contacts..." : "Select contact"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{getContactDisplayName(contact)}</span>
                          {(contact.email || contact.phone) && (
                            <span className="text-xs text-muted-foreground">
                              {contact.email} {contact.email && contact.phone && "•"} {contact.phone}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {contacts.length === 0 && !loadingContacts && (
                      <SelectItem value="no-contacts-placeholder" disabled>
                        No contacts found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {getSelectedContact() && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    Selected: {getContactDisplayName(getSelectedContact()!)}
                    {getSelectedContact()?.email && ` (${getSelectedContact()?.email})`}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Website, Referral, Cold Call"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="User ID or email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details about this opportunity..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Opportunity" : "Update Opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
