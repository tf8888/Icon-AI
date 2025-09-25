"use client"

import { OpportunityModal } from "@/components/opportunity-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CircleDollarSignIcon, TrendingUp, Calendar, Search, Clock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useProfile } from "@/lib/contexts/ProfileContext"
import { useToast } from "@/hooks/use-toast"

interface GHLOpportunity {
    id: string;
    name: string;
    monetaryValue?: number;
    pipelineStageId?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    lastActivityAt?: string;
    contact?: {
        id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
    };
    pipeline?: {
        id?: string;
        name?: string;
        stages?: Array<{
            id?: string;
            name?: string;
            position?: number;
        }>;
    };
}

interface OpportunitiesResponse {
    opportunities?: GHLOpportunity[];
    meta?: {
        total?: number;
        currentPage?: number;
        nextPage?: number | null;
        prevPage?: number | null;
        totalPages?: number;
    };
}

export default function OpportunitiesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [opportunities, setOpportunities] = useState<GHLOpportunity[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false)
    const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
    const [opportunityModalMode, setOpportunityModalMode] = useState<"create" | "edit">("create")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const { profile } = useProfile()
    const { toast } = useToast()

    // Pagination calculations
    const totalPages = Math.ceil(opportunities.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentOpportunities = opportunities.slice(startIndex, endIndex)

    // Pagination component
    const PaginationComponent = () => {
        const pageNumbers = []
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i)
        }

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-700">
                    <span>
                        Showing {startIndex + 1} to {Math.min(endIndex, opportunities.length)} of {opportunities.length} opportunities
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
        )
    }

    const fetchOpportunities = async () => {
        if (!profile?.ghl_pit_token || !profile?.ghl_location_id) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const params = new URLSearchParams({
                access_token: profile.ghl_pit_token,
                location_id: profile.ghl_location_id,
                limit: "100", // Fetch up to 100 opportunities
            })

            if (searchTerm) {
                params.append("query", searchTerm)
            }

            const response = await fetch(`/api/ghl/opportunities?${params}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch opportunities: ${response.status}`)
            }

            const data: OpportunitiesResponse = await response.json()
            setOpportunities(data.opportunities || [])
            setCurrentPage(1) // Reset to first page when fetching new data
        } catch (error) {
            console.error("Error fetching opportunities:", error)
            toast({
                title: "Error",
                description: "Failed to fetch opportunities from GoHighLevel",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOpportunities()
    }, [profile?.ghl_pit_token, profile?.ghl_location_id])

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            if (profile?.ghl_pit_token && profile?.ghl_location_id) {
                fetchOpportunities()
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchTerm])

    // Listen for opportunity updates
    useEffect(() => {
        const handleOpportunityUpdate = () => {
            // Add 3-second delay to allow GHL API to propagate changes
            setTimeout(() => {
                fetchOpportunities()
            }, 3000)
        }

        window.addEventListener('opportunityUpdated', handleOpportunityUpdate)

        return () => {
            window.removeEventListener('opportunityUpdated', handleOpportunityUpdate)
        }
    }, [])

    // Reset to valid page if current page exceeds total pages
    useEffect(() => {
        if (opportunities.length > 0 && totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [opportunities.length, totalPages, currentPage])

    const getOpportunityStageColor = (stage: string) => {
        const lowerStage = stage?.toLowerCase() || ""
        if (lowerStage.includes("qualify") || lowerStage.includes("lead")) {
            return "bg-blue-100 text-blue-800"
        } else if (lowerStage.includes("proposal") || lowerStage.includes("quote")) {
            return "bg-yellow-100 text-yellow-800"
        } else if (lowerStage.includes("negotiat") || lowerStage.includes("review")) {
            return "bg-orange-100 text-orange-800"
        } else if (lowerStage.includes("won") || lowerStage.includes("closed") || lowerStage.includes("complete")) {
            return "bg-green-100 text-green-800"
        } else if (lowerStage.includes("lost") || lowerStage.includes("dead")) {
            return "bg-red-100 text-red-800"
        } else {
            return "bg-gray-100 text-gray-800"
        }
    }

    const getContactName = (opportunity: GHLOpportunity) => {
        if (opportunity.contact?.name) {
            return opportunity.contact.name
        }
        if (opportunity.contact?.firstName || opportunity.contact?.lastName) {
            return `${opportunity.contact.firstName || ""} ${opportunity.contact.lastName || ""}`.trim()
        }
        return "Unknown Contact"
    }

    const getOpportunityStage = (opportunity: GHLOpportunity) => {
        // Try to find the stage name from pipeline stages
        if (opportunity.pipeline?.stages && opportunity.pipelineStageId) {
            const stage = opportunity.pipeline.stages.find(s => s.id === opportunity.pipelineStageId)
            if (stage?.name) {
                return stage.name
            }
        }
        return opportunity.status || "Unknown"
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        try {
            return new Date(dateString).toLocaleDateString()
        } catch {
            return "N/A"
        }
    }

    const calculateStats = () => {
        const totalValue = opportunities.reduce((sum, o) => sum + (o.monetaryValue || 0), 0)
        const wonOpportunities = opportunities.filter(o =>
            getOpportunityStage(o).toLowerCase().includes("won") ||
            getOpportunityStage(o).toLowerCase().includes("complete")
        )
        const winRate = opportunities.length > 0 ? Math.round((wonOpportunities.length / opportunities.length) * 100) : 0
        const thisMonthOpportunities = opportunities.filter(o => {
            if (!o.createdAt) return false
            const createdDate = new Date(o.createdAt)
            const now = new Date()
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
        })

        return { totalValue, winRate, thisMonthCount: thisMonthOpportunities.length }
    }

    const { totalValue, winRate, thisMonthCount } = calculateStats()

    const handleCreateOpportunity = () => {
        setSelectedOpportunity(null)
        setOpportunityModalMode("create")
        setIsOpportunityModalOpen(true)
    }

    const handleEditOpportunity = (opportunity: GHLOpportunity) => {
        setSelectedOpportunity(opportunity)
        setOpportunityModalMode("edit")
        setIsOpportunityModalOpen(true)
    }

    if (!profile?.ghl_pit_token || !profile?.ghl_location_id) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="p-6">
                    <CardHeader className="text-center">
                        <CardTitle>GoHighLevel Not Connected</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        <p>Please connect your GoHighLevel account to view opportunities.</p>
                        <p>Go to Settings to configure your GHL token and location ID.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Opportunities</p>
                                    <p className="text-2xl font-bold">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : opportunities.length}
                                    </p>
                                </div>
                                <CircleDollarSignIcon className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Value</p>
                                    <p className="text-2xl font-bold">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${totalValue.toLocaleString()}`}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Win Rate</p>
                                    <p className="text-2xl font-bold">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${winRate}%`}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-chart-3" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Created This Month</p>
                                    <p className="text-2xl font-bold">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : thisMonthCount}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-chart-4" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Opportunities</CardTitle>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search opportunities..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-64"
                                    />
                                </div>
                                <Button size="sm" onClick={handleCreateOpportunity}>
                                    <CircleDollarSignIcon className="h-4 w-4 mr-2" />
                                    New Opportunity
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading opportunities...</span>
                            </div>
                        ) : opportunities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CircleDollarSignIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                                <p>Get started by creating your first opportunity or check your GoHighLevel integration.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentOpportunities.map((opportunity) => (
                                    <div
                                        key={opportunity.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold">{opportunity.name}</h3>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">
                                                        ${(opportunity.monetaryValue || 0).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {opportunity.contact?.email && (
                                                            <span className="block">{opportunity.contact.email}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                <span>{getContactName(opportunity)}</span>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {formatDate(opportunity.createdAt)}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {opportunity.lastActivityAt
                                                        ? `Last activity: ${formatDate(opportunity.lastActivityAt)}`
                                                        : `Created: ${formatDate(opportunity.createdAt)}`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <Badge className={getOpportunityStageColor(getOpportunityStage(opportunity))}>
                                                {getOpportunityStage(opportunity)}
                                            </Badge>
                                            <Button variant="outline" size="sm" onClick={() => handleEditOpportunity(opportunity)}>
                                                <Clock className="h-4 w-4 mr-2" />
                                                Update
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Always show pagination */}
                        {opportunities.length > 0 && <PaginationComponent />}
                    </CardContent>
                </Card>
            </div>

            <OpportunityModal
                isOpen={isOpportunityModalOpen}
                onClose={() => setIsOpportunityModalOpen(false)}
                opportunity={selectedOpportunity}
                mode={opportunityModalMode}
                onSuccess={fetchOpportunities}
            />
        </>
    )
}