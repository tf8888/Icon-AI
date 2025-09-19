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

interface OpportunityModalProps {
  isOpen: boolean
  onClose: () => void
  opportunity?: any
  mode: "create" | "edit"
}

export function OpportunityModal({ isOpen, onClose, opportunity, mode }: OpportunityModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    value: "",
    stage: "qualification",
    probability: "",
    closeDate: undefined as Date | undefined,
    description: "",
    source: "",
    assignedTo: "",
  })

  useEffect(() => {
    if (mode === "edit" && opportunity) {
      setFormData({
        title: opportunity.title || "",
        contactId: opportunity.contactId || "",
        value: opportunity.value?.toString() || "",
        stage: opportunity.stage || "qualification",
        probability: opportunity.probability?.toString() || "",
        closeDate: opportunity.closeDate ? new Date(opportunity.closeDate) : undefined,
        description: opportunity.description || "",
        source: opportunity.source || "",
        assignedTo: opportunity.assignedTo || "",
      })
    } else if (mode === "create") {
      setFormData({
        title: "",
        contactId: "",
        value: "",
        stage: "qualification",
        probability: "",
        closeDate: undefined,
        description: "",
        source: "",
        assignedTo: "",
      })
    }
  }, [mode, opportunity, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = mode === "create" ? "/api/ghl/opportunities" : `/api/ghl/opportunities/${opportunity.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          value: Number.parseFloat(formData.value) || 0,
          probability: Number.parseInt(formData.probability) || 0,
          closeDate: formData.closeDate?.toISOString(),
        }),
      })

      if (response.ok) {
        onClose()
        // In a real app, you'd refresh the opportunities list here
        console.log(`Opportunity ${mode === "create" ? "created" : "updated"} successfully`)
      } else {
        console.error(`Failed to ${mode} opportunity`)
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} opportunity:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const stages = [
    { value: "qualification", label: "Qualification" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed-won", label: "Closed Won" },
    { value: "closed-lost", label: "Closed Lost" },
  ]

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
              <Label htmlFor="title">Opportunity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Website Redesign Project"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value ($) *</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="15000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                placeholder="75"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closeDate">Expected Close Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.closeDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.closeDate ? format(formData.closeDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.closeDate}
                    onSelect={(date) => setFormData({ ...formData, closeDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Website, Referral, Cold Call"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactId">Contact ID</Label>
            <Input
              id="contactId"
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
              placeholder="Contact ID from GoHighLevel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
