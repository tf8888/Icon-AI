"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Star,
  Gift,
  Bell,
  Plus,
  TrendingUp,
  Users,
  MousePointer,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface FormData {
  id: string
  name: string
  type: "landing-page" | "popup" | "embedded"
  views: number
  submissions: number
  conversionRate: number
  status: "active" | "draft" | "paused"
}

interface Lead {
  id: string
  name: string
  email: string
  source: string
  score: number
  status: "hot" | "warm" | "cold"
  timestamp: string
}

interface OptInOffer {
  id: string
  title: string
  type: "lead-magnet" | "giveaway" | "trial"
  signups: number
  conversionRate: number
  status: "active" | "paused"
}

interface Alert {
  id: string
  type: "new-lead" | "form-submission" | "high-score" | "chat"
  message: string
  timestamp: string
  read: boolean
}

const mockForms: FormData[] = [
  {
    id: "1",
    name: "Marketing Guide Landing Page",
    type: "landing-page",
    views: 2340,
    submissions: 187,
    conversionRate: 8.0,
    status: "active",
  },
  {
    id: "2",
    name: "Newsletter Signup Popup",
    type: "popup",
    views: 5670,
    submissions: 234,
    conversionRate: 4.1,
    status: "active",
  },
  {
    id: "3",
    name: "Contact Form",
    type: "embedded",
    views: 890,
    submissions: 67,
    conversionRate: 7.5,
    status: "active",
  },
  {
    id: "4",
    name: "Webinar Registration",
    type: "landing-page",
    views: 1200,
    submissions: 89,
    conversionRate: 7.4,
    status: "draft",
  },
]

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    source: "Google Ads",
    score: 85,
    status: "hot",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    source: "LinkedIn",
    score: 72,
    status: "warm",
    timestamp: "15 min ago",
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma@example.com",
    source: "Organic Search",
    score: 45,
    status: "cold",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    email: "alex@example.com",
    source: "Referral",
    score: 91,
    status: "hot",
    timestamp: "2 hours ago",
  },
]

const mockOptIns: OptInOffer[] = [
  {
    id: "1",
    title: "Ultimate Marketing Toolkit",
    type: "lead-magnet",
    signups: 1240,
    conversionRate: 12.5,
    status: "active",
  },
  { id: "2", title: "Free Strategy Session", type: "trial", signups: 340, conversionRate: 28.3, status: "active" },
  { id: "3", title: "Monthly Giveaway", type: "giveaway", signups: 890, conversionRate: 8.7, status: "paused" },
]

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "new-lead",
    message: "New high-score lead: Sarah Johnson (85 points)",
    timestamp: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "form-submission",
    message: "Marketing Guide form received 5 new submissions",
    timestamp: "15 min ago",
    read: false,
  },
  { id: "3", type: "chat", message: "New chat conversation started", timestamp: "1 hour ago", read: true },
  {
    id: "4",
    type: "high-score",
    message: "Lead Alex Rodriguez scored 91 points",
    timestamp: "2 hours ago",
    read: true,
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "active":
    case "hot":
      return "bg-green-500"
    case "warm":
      return "bg-yellow-500"
    case "cold":
    case "paused":
      return "bg-gray-500"
    case "draft":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
    case "hot":
      return "default"
    case "warm":
      return "secondary"
    case "cold":
    case "paused":
      return "outline"
    case "draft":
      return "outline"
    default:
      return "outline"
  }
}

function getLeadScoreColor(score: number) {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-gray-600"
}

function getAlertIcon(type: Alert["type"]) {
  switch (type) {
    case "new-lead":
      return Users
    case "form-submission":
      return FileText
    case "high-score":
      return Star
    case "chat":
      return Bell
    default:
      return AlertCircle
  }
}

export function CaptureTab() {
  const [activeSubsection, setActiveSubsection] = useState<"forms" | "scoring" | "offers" | "alerts">("forms")

  const subsections = [
    { key: "forms", label: "Forms & Landing Pages", icon: FileText },
    { key: "scoring", label: "Lead Scoring", icon: Star },
    { key: "offers", label: "Opt-In Offers", icon: Gift },
    { key: "alerts", label: "Instant Alerts", icon: Bell },
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

      {/* Forms & Landing Pages */}
      {activeSubsection === "forms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Active Forms & Pages
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockForms.map((form) => (
                    <div key={form.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(form.status)}`} />
                          <div>
                            <h4 className="font-medium">{form.name}</h4>
                            <Badge variant="outline" className="capitalize mt-1">
                              {form.type.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(form.status)} className="capitalize">
                          {form.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-medium flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {form.views.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submissions</p>
                          <p className="font-medium flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            {form.submissions}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion</p>
                          <p className="font-medium">{form.conversionRate}%</p>
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
                <CardTitle className="text-sm">Form Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Form name..." />
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>Landing Page</option>
                  <option>Popup Form</option>
                  <option>Embedded Form</option>
                </select>
                <Button className="w-full">Create Form</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Views</span>
                    <span className="font-medium">10,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Submissions</span>
                    <span className="font-medium">577</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Conversion</span>
                    <span className="font-medium">5.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Lead Scoring */}
      {activeSubsection === "scoring" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recent Leads
              </CardTitle>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeads.map((lead) => (
                  <div key={lead.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{lead.name}</h4>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                      </div>
                      <Badge variant={getStatusBadge(lead.status)} className="capitalize">
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Source: {lead.source}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getLeadScoreColor(lead.score)}`}>{lead.score} pts</span>
                        <span className="text-muted-foreground">{lead.timestamp}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={lead.score} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Scoring Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Average Lead Score</h4>
                  <p className="text-2xl font-bold text-accent">73.2</p>
                  <p className="text-sm text-muted-foreground">+5.3 from last week</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Hot Leads (80+)</h4>
                  <p className="text-2xl font-bold text-accent">24</p>
                  <p className="text-sm text-muted-foreground">This week</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Rate</h4>
                  <p className="text-2xl font-bold text-accent">18.5%</p>
                  <p className="text-sm text-muted-foreground">Hot leads to customers</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Lead Sources</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Google Ads</span>
                      <span>35%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Organic Search</span>
                      <span>28%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>LinkedIn</span>
                      <span>22%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Referral</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Opt-In Offers */}
      {activeSubsection === "offers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Active Opt-In Offers
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOptIns.map((offer) => (
                    <div key={offer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{offer.title}</h4>
                          <Badge variant="outline" className="capitalize mt-1">
                            {offer.type.replace("-", " ")}
                          </Badge>
                        </div>
                        <Badge variant={getStatusBadge(offer.status)} className="capitalize">
                          {offer.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Signups</p>
                          <p className="font-medium text-lg">{offer.signups.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion Rate</p>
                          <p className="font-medium text-lg">{offer.conversionRate}%</p>
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
                    <Gift className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-medium">Free Strategy Session</h4>
                  <p className="text-sm text-muted-foreground mb-3">28.3% conversion rate</p>
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Offer Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Signups</span>
                    <span className="font-medium">2,470</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Conversion</span>
                    <span className="font-medium">16.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Offers</span>
                    <span className="font-medium">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Instant Alerts */}
      {activeSubsection === "alerts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <Button size="sm" variant="outline">
                Mark All Read
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type)
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${!alert.read ? "bg-accent/5 border-accent/20" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${!alert.read ? "bg-accent/10" : "bg-muted"}`}>
                          <Icon className={`h-4 w-4 ${!alert.read ? "text-accent" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                            {!alert.read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!alert.read && (
                          <Button size="sm" variant="ghost">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alert Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Alert Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Unread Alerts</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today's Alerts</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span className="font-medium">34</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Alert Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New Leads</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Form Submissions</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Score Leads</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Chat Messages</span>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                  Configure Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
