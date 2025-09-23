"use client"

import { OpportunityModal } from "@/components/opportunity-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CircleDollarSignIcon, TrendingUp, Calendar, Search, Clock } from "lucide-react"
import { useState } from "react"

const opportunities = [
    {
        id: 1,
        title: "Website Redesign Project",
        contact: "Sarah Johnson",
        value: 15000,
        stage: "proposal",
        probability: 75,
        closeDate: "2024-02-15",
        lastActivity: "Sent proposal",
    },
    {
        id: 2,
        title: "Marketing Automation Setup",
        contact: "Mike Chen",
        value: 8500,
        stage: "negotiation",
        probability: 60,
        closeDate: "2024-02-28",
        lastActivity: "Follow-up call scheduled",
    },
    {
        id: 3,
        title: "SEO Optimization Package",
        contact: "Emily Davis",
        value: 5000,
        stage: "qualification",
        probability: 40,
        closeDate: "2024-03-10",
        lastActivity: "Needs assessment completed",
    },
    {
        id: 4,
        title: "Social Media Management",
        contact: "Alex Rodriguez",
        value: 3000,
        stage: "closed-won",
        probability: 100,
        closeDate: "2024-01-30",
        lastActivity: "Contract signed",
    },
]

export default function OpportunitiesPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false) // Added opportunity modal state
    const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
    const [opportunityModalMode, setOpportunityModalMode] = useState<"create" | "edit">("create")

    const getOpportunityStageColor = (stage: string) => {
        switch (stage) {
            case "qualification":
                return "bg-blue-100 text-blue-800"
            case "proposal":
                return "bg-yellow-100 text-yellow-800"
            case "negotiation":
                return "bg-orange-100 text-orange-800"
            case "closed-won":
                return "bg-green-100 text-green-800"
            case "closed-lost":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const handleCreateOpportunity = () => {
        setSelectedOpportunity(null)
        setOpportunityModalMode("create")
        setIsOpportunityModalOpen(true)
    }

    const handleEditOpportunity = (opportunity: any) => {
        setSelectedOpportunity(opportunity)
        setOpportunityModalMode("edit")
        setIsOpportunityModalOpen(true)
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
                                    <p className="text-2xl font-bold">{opportunities.length}</p>
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
                                        ${opportunities.reduce((sum, o) => sum + o.value, 0).toLocaleString()}
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
                                        {Math.round(
                                            (opportunities.filter((o) => o.stage === "closed-won").length / opportunities.length) * 100,
                                        )}
                                        %
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
                                    <p className="text-sm text-muted-foreground">Closing This Month</p>
                                    <p className="text-2xl font-bold">
                                        {opportunities.filter((o) => o.closeDate.includes("2024-02")).length}
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
                        <div className="space-y-4">
                            {opportunities.map((opportunity) => (
                                <div
                                    key={opportunity.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">{opportunity.title}</h3>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">${opportunity.value.toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">{opportunity.probability}% probability</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <span>{opportunity.contact}</span>
                                            <span>•</span>
                                            <span className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {opportunity.closeDate}
                                            </span>
                                            <span>•</span>
                                            <span>{opportunity.lastActivity}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Badge className={getOpportunityStageColor(opportunity.stage)}>
                                            {opportunity.stage.replace("-", " ")}
                                        </Badge>
                                        <Button variant="outline" size="sm" onClick={() => handleEditOpportunity(opportunity)}>
                                            <Clock className="h-4 w-4 mr-2" />
                                            Update
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <OpportunityModal
                isOpen={isOpportunityModalOpen}
                onClose={() => setIsOpportunityModalOpen(false)}
                opportunity={selectedOpportunity}
                mode={opportunityModalMode}
            />
        </>
    )
}