import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { GHLCreateContactData, GHLContact } from "@/lib/services/ghlContactsService"

interface ContactModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: GHLCreateContactData) => Promise<void>
    contact?: GHLContact | null
    loading?: boolean
}

export function ContactModal({
    open,
    onOpenChange,
    onSubmit,
    contact,
    loading = false
}: ContactModalProps) {
    const [formData, setFormData] = useState<GHLCreateContactData>({
        firstName: contact?.firstName || '',
        lastName: contact?.lastName || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        companyName: contact?.companyName || '',
        address1: contact?.address1 || '',
        city: contact?.city || '',
        state: contact?.state || '',
        postalCode: contact?.postalCode || '',
        country: contact?.country || '',
        website: contact?.website || '',
        source: contact?.source || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(formData)
        onOpenChange(false)
        // Reset form
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            companyName: '',
            address1: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            website: '',
            source: '',
        })
    }

    const handleChange = (field: keyof GHLCreateContactData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    useEffect(() => {
        if (contact) {
            setFormData(contact)
        }
    }, [contact])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {contact ? 'Edit Contact' : 'Add New Contact'}
                    </DialogTitle>
                    <DialogDescription>
                        {contact
                            ? 'Update the contact information below.'
                            : 'Fill in the contact information to create a new contact.'
                        }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName || ''}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName || ''}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            value={formData.companyName || ''}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="address1">Address</Label>
                        <Input
                            id="address1"
                            value={formData.address1 || ''}
                            onChange={(e) => handleChange('address1', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={formData.city || ''}
                                onChange={(e) => handleChange('city', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={formData.state || ''}
                                onChange={(e) => handleChange('state', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                                id="postalCode"
                                value={formData.postalCode || ''}
                                onChange={(e) => handleChange('postalCode', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={formData.country || ''}
                                onChange={(e) => handleChange('country', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website || ''}
                                onChange={(e) => handleChange('website', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="source">Source</Label>
                        <Input
                            id="source"
                            value={formData.source || ''}
                            onChange={(e) => handleChange('source', e.target.value)}
                            placeholder="e.g., Website, Referral, Social Media"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (contact ? 'Update Contact' : 'Create Contact')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}