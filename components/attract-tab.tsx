"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Megaphone,
  Download,
  Handshake,
  Plus,
  Eye,
  MousePointer,
  BarChart3,
} from "lucide-react"

interface ContentItem {
  id: string
  title: string
  type: "post" | "campaign" | "ad"
  platform: string
  scheduledDate: string
  status: "scheduled" | "published" | "draft"
}

interface TrafficDriver {
  id: string
  name: string
  type: "paid-ad" | "social" | "podcast" | "guest"
  reach: number
  clicks: number
  cost?: number
}

interface LeadMagnet {
  id: string
  title: string
  type: "ebook" | "webinar" | "template" | "course"
  downloads: number
  conversionRate: number
}

interface Partnership {
  id: string
  partner: string
  type: "jv" | "influencer" | "referral"
  status: "active" | "pending" | "completed"
  value: number
}

const mockContentItems: ContentItem[] = [
  {
    id: "1",
    title: "5 Marketing Tips for Small Business",
    type: "post",
    platform: "LinkedIn",
    scheduledDate: "2024-01-15",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Customer Success Stories Campaign",
    type: "campaign",
    platform: "Email",
    scheduledDate: "2024-01-18",
    status: "draft",
  },
  {
    id: "3",
    title: "Product Demo Video",
    type: "post",
    platform: "YouTube",
    scheduledDate: "2024-01-12",
    status: "published",
  },
]

const mockTrafficDrivers: TrafficDriver[] = [
  { id: "1", name: "Google Ads - Lead Gen", type: "paid-ad", reach: 12500, clicks: 340, cost: 850 },
  { id: "2", name: "Marketing Podcast Guest", type: "podcast", reach: 8200, clicks: 156 },
  { id: "3", name: "LinkedIn Sponsored Post", type: "social", reach: 5600, clicks: 89, cost: 200 },
]

const mockLeadMagnets: LeadMagnet[] = [
  { id: "1", title: "Ultimate Marketing Checklist", type: "ebook", downloads: 1240, conversionRate: 12.5 },
  { id: "2", title: "Growth Strategy Webinar", type: "webinar", downloads: 340, conversionRate: 28.3 },
  { id: "3", title: "Email Template Pack", type: "template", downloads: 890, conversionRate: 8.7 },
]

const mockPartnerships: Partnership[] = [
  { id: "1", partner: "TechInfluencer Pro", type: "influencer", status: "active", value: 2500 },
  { id: "2", partner: "Business Mentor Network", type: "jv", status: "pending", value: 5000 },
  { id: "3", partner: "Referral Partner Co", type: "referral", status: "active", value: 1200 },
]

function getStatusColor(status: string) {
  switch (status) {
    case "scheduled":
    case "active":
      return "bg-blue-500"
    case "published":
    case "completed":
      return "bg-green-500"
    case "draft":
    case "pending":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "scheduled":
    case "active":
      return "default"
    case "published":
    case "completed":
      return "secondary"
    case "draft":
    case "pending":
      return "outline"
    default:
      return "outline"
  }
}

export function AttractTab() {
  const [activeSubsection, setActiveSubsection] = useState<"calendar" | "traffic" | "magnets" | "partnerships">(
    "calendar",
  )

  const subsections = [
    { key: "calendar", label: "Content Calendar", icon: Calendar },
    { key: "traffic", label: "Traffic Drivers", icon: TrendingUp },
    { key: "magnets", label: "Lead Magnets", icon: Download },
    { key: "partnerships", label: "Partnerships", icon: Handshake },
  ]

  return (
    <div className="space-y-6">
      {/* Subsection Navigation */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {subsections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.key}
              onClick={() => setActiveSubsection(section.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubsection === section.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Content Calendar */}
      {activeSubsection === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Content
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Post
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockContentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.platform} • {item.scheduledDate}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(item.status)} className="capitalize">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Create</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Content title..." />
                <Textarea placeholder="Content description..." className="min-h-[100px]" />
                <Button className="w-full">Create & Schedule</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Week's Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Posts Scheduled</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Posts Published</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Engagement Rate</span>
                    <span className="font-medium">4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Traffic Drivers */}
      {activeSubsection === "traffic" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Active Campaigns
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrafficDrivers.map((driver) => (
                  <div key={driver.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{driver.name}</h4>
                      <Badge variant="outline" className="capitalize">
                        {driver.type.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reach</p>
                        <p className="font-medium flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {driver.reach.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicks</p>
                        <p className="font-medium flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {driver.clicks}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost</p>
                        <p className="font-medium">{driver.cost ? `$${driver.cost}` : "Free"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Total Reach This Month</h4>
                  <p className="text-2xl font-bold text-accent">26,300</p>
                  <p className="text-sm text-muted-foreground">+18% from last month</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Click-Through Rate</h4>
                  <p className="text-2xl font-bold text-accent">2.1%</p>
                  <p className="text-sm text-muted-foreground">Above industry average</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Cost Per Click</h4>
                  <p className="text-2xl font-bold text-accent">$1.82</p>
                  <p className="text-sm text-muted-foreground">-12% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lead Magnets */}
      {activeSubsection === "magnets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Lead Magnets Performance
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Magnet
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeadMagnets.map((magnet) => (
                    <div key={magnet.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{magnet.title}</h4>
                          <Badge variant="outline" className="capitalize mt-1">
                            {magnet.type}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Downloads</p>
                          <p className="font-medium text-lg">{magnet.downloads.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion Rate</p>
                          <p className="font-medium text-lg">{magnet.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Performer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Download className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-medium">Growth Strategy Webinar</h4>
                  <p className="text-sm text-muted-foreground mb-3">28.3% conversion rate</p>
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Downloads</span>
                    <span className="font-medium">2,470</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Conversion</span>
                    <span className="font-medium">16.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Magnets</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Partnerships */}
      {activeSubsection === "partnerships" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Active Partnerships
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Partnership
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPartnerships.map((partnership) => (
                  <div key={partnership.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{partnership.partner}</h4>
                      <Badge variant={getStatusBadge(partnership.status)} className="capitalize">
                        {partnership.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {partnership.type.replace("-", " ")} Partnership
                      </span>
                      <span className="font-medium">${partnership.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partnership Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Total Partnership Value</h4>
                  <p className="text-2xl font-bold text-accent">$8,700</p>
                  <p className="text-sm text-muted-foreground">Across 3 active partnerships</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Referral Leads</h4>
                  <p className="text-2xl font-bold text-accent">127</p>
                  <p className="text-sm text-muted-foreground">This quarter</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Rate</h4>
                  <p className="text-2xl font-bold text-accent">24.3%</p>
                  <p className="text-sm text-muted-foreground">From partnership leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
