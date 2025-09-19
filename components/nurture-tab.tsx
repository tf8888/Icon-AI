"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Mail,
  Phone,
  GraduationCap,
  Activity,
  Plus,
  Send,
  MessageSquare,
  BookOpen,
  Eye,
  MousePointer,
  Clock,
  Users,
  TrendingUp,
  Play,
  Pause,
} from "lucide-react"

interface EmailSequence {
  id: string
  name: string
  type: "drip" | "follow-up" | "onboarding"
  subscribers: number
  openRate: number
  clickRate: number
  status: "active" | "paused" | "draft"
  emails: number
}

interface PersonalTouch {
  id: string
  contact: string
  type: "call" | "voice-drop" | "dm"
  status: "scheduled" | "completed" | "pending"
  scheduledDate: string
  notes: string
}

interface EducationResource {
  id: string
  title: string
  type: "video" | "article" | "webinar" | "course"
  views: number
  completionRate: number
  status: "published" | "draft"
}

interface EngagementData {
  id: string
  contact: string
  email: string
  lastActivity: string
  emailOpens: number
  linkClicks: number
  resourceViews: number
  engagementScore: number
}

const mockSequences: EmailSequence[] = [
  {
    id: "1",
    name: "Welcome Series",
    type: "onboarding",
    subscribers: 1240,
    openRate: 68.5,
    clickRate: 12.3,
    status: "active",
    emails: 5,
  },
  {
    id: "2",
    name: "Lead Nurture Campaign",
    type: "drip",
    subscribers: 890,
    openRate: 45.2,
    clickRate: 8.7,
    status: "active",
    emails: 8,
  },
  {
    id: "3",
    name: "Re-engagement Series",
    type: "follow-up",
    subscribers: 340,
    openRate: 32.1,
    clickRate: 5.4,
    status: "paused",
    emails: 3,
  },
  {
    id: "4",
    name: "Product Education",
    type: "drip",
    subscribers: 567,
    openRate: 58.9,
    clickRate: 15.2,
    status: "draft",
    emails: 6,
  },
]

const mockPersonalTouches: PersonalTouch[] = [
  {
    id: "1",
    contact: "Sarah Johnson",
    type: "call",
    status: "scheduled",
    scheduledDate: "Today 2:00 PM",
    notes: "Follow up on demo interest",
  },
  {
    id: "2",
    contact: "Mike Chen",
    type: "voice-drop",
    status: "completed",
    scheduledDate: "Yesterday",
    notes: "Sent personalized video message",
  },
  {
    id: "3",
    contact: "Emma Davis",
    type: "dm",
    status: "pending",
    scheduledDate: "Tomorrow",
    notes: "LinkedIn connection follow-up",
  },
]

const mockEducationResources: EducationResource[] = [
  {
    id: "1",
    title: "Marketing Fundamentals Course",
    type: "course",
    views: 2340,
    completionRate: 78.5,
    status: "published",
  },
  {
    id: "2",
    title: "Advanced Strategy Webinar",
    type: "webinar",
    views: 890,
    completionRate: 65.2,
    status: "published",
  },
  {
    id: "3",
    title: "Quick Tips Video Series",
    type: "video",
    views: 1560,
    completionRate: 45.8,
    status: "published",
  },
  {
    id: "4",
    title: "Industry Trends Report",
    type: "article",
    views: 670,
    completionRate: 82.1,
    status: "draft",
  },
]

const mockEngagementData: EngagementData[] = [
  {
    id: "1",
    contact: "Sarah Johnson",
    email: "sarah@example.com",
    lastActivity: "2 hours ago",
    emailOpens: 12,
    linkClicks: 5,
    resourceViews: 8,
    engagementScore: 85,
  },
  {
    id: "2",
    contact: "Mike Chen",
    email: "mike@example.com",
    lastActivity: "1 day ago",
    emailOpens: 8,
    linkClicks: 3,
    resourceViews: 4,
    engagementScore: 72,
  },
  {
    id: "3",
    contact: "Emma Davis",
    email: "emma@example.com",
    lastActivity: "3 days ago",
    emailOpens: 4,
    linkClicks: 1,
    resourceViews: 2,
    engagementScore: 45,
  },
  {
    id: "4",
    contact: "Alex Rodriguez",
    email: "alex@example.com",
    lastActivity: "5 hours ago",
    emailOpens: 15,
    linkClicks: 8,
    resourceViews: 12,
    engagementScore: 91,
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "active":
    case "published":
    case "completed":
      return "bg-green-500"
    case "scheduled":
    case "pending":
      return "bg-yellow-500"
    case "paused":
    case "draft":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
    case "published":
    case "completed":
      return "default"
    case "scheduled":
    case "pending":
      return "secondary"
    case "paused":
    case "draft":
      return "outline"
    default:
      return "outline"
  }
}

function getEngagementScoreColor(score: number) {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-gray-600"
}

function getPersonalTouchIcon(type: PersonalTouch["type"]) {
  switch (type) {
    case "call":
      return Phone
    case "voice-drop":
      return MessageSquare
    case "dm":
      return Send
    default:
      return MessageSquare
  }
}

function getResourceIcon(type: EducationResource["type"]) {
  switch (type) {
    case "video":
      return Play
    case "article":
      return BookOpen
    case "webinar":
      return Users
    case "course":
      return GraduationCap
    default:
      return BookOpen
  }
}

export function NurtureTab() {
  const [activeSubsection, setActiveSubsection] = useState<"sequences" | "personal" | "education" | "engagement">(
    "sequences",
  )

  const subsections = [
    { key: "sequences", label: "Email/SMS Sequences", icon: Mail },
    { key: "personal", label: "Personal Touches", icon: Phone },
    { key: "education", label: "Education Hub", icon: GraduationCap },
    { key: "engagement", label: "Engagement Tracking", icon: Activity },
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

      {/* Email/SMS Sequences */}
      {activeSubsection === "sequences" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Active Sequences
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sequence
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSequences.map((sequence) => (
                    <div key={sequence.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(sequence.status)}`} />
                          <div>
                            <h4 className="font-medium">{sequence.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="capitalize">
                                {sequence.type.replace("-", " ")}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{sequence.emails} emails</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadge(sequence.status)} className="capitalize">
                            {sequence.status}
                          </Badge>
                          {sequence.status === "active" ? (
                            <Button size="sm" variant="ghost">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Subscribers</p>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {sequence.subscribers.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Open Rate</p>
                          <p className="font-medium flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {sequence.openRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Click Rate</p>
                          <p className="font-medium flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            {sequence.clickRate}%
                          </p>
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
                <CardTitle className="text-sm">Quick Create</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Sequence name..." />
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>Drip Campaign</option>
                  <option>Follow-up Series</option>
                  <option>Onboarding</option>
                </select>
                <Button className="w-full">Create Sequence</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Avg. Open Rate</h4>
                    <p className="text-2xl font-bold text-accent">53.7%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Avg. Click Rate</h4>
                    <p className="text-2xl font-bold text-accent">10.4%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Total Subscribers</h4>
                    <p className="text-2xl font-bold text-accent">3,037</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Personal Touches */}
      {activeSubsection === "personal" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Scheduled Touches
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Touch
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPersonalTouches.map((touch) => {
                  const Icon = getPersonalTouchIcon(touch.type)
                  return (
                    <div key={touch.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-muted`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{touch.contact}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{touch.type.replace("-", " ")}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(touch.status)} className="capitalize">
                          {touch.status}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{touch.scheduledDate}</span>
                        </div>
                        <p className="text-muted-foreground">{touch.notes}</p>
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
                <TrendingUp className="h-5 w-5" />
                Personal Touch Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">This Week's Touches</h4>
                  <p className="text-2xl font-bold text-accent">12</p>
                  <p className="text-sm text-muted-foreground">8 calls, 3 voice drops, 1 DM</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Response Rate</h4>
                  <p className="text-2xl font-bold text-accent">67%</p>
                  <p className="text-sm text-muted-foreground">Above average</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Rate</h4>
                  <p className="text-2xl font-bold text-accent">24%</p>
                  <p className="text-sm text-muted-foreground">Personal touches to sales</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Touch Types</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Phone Calls</span>
                      <span>67%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Voice Drops</span>
                      <span>25%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Direct Messages</span>
                      <span>8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Education Hub */}
      {activeSubsection === "education" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education Resources
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEducationResources.map((resource) => {
                    const Icon = getResourceIcon(resource.type)
                    return (
                      <div key={resource.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent/10">
                              <Icon className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                              <h4 className="font-medium">{resource.title}</h4>
                              <Badge variant="outline" className="capitalize mt-1">
                                {resource.type}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant={getStatusBadge(resource.status)} className="capitalize">
                            {resource.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Views</p>
                            <p className="font-medium text-lg">{resource.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completion Rate</p>
                            <p className="font-medium text-lg">{resource.completionRate}%</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress value={resource.completionRate} className="h-2" />
                        </div>
                      </div>
                    )
                  })}
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
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-medium">Industry Trends Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">82.1% completion rate</p>
                  <Button size="sm" className="w-full">
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resource Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Views</span>
                    <span className="font-medium">5,460</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Completion</span>
                    <span className="font-medium">67.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Resources</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Engagement Tracking */}
      {activeSubsection === "engagement" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Contact Engagement
              </CardTitle>
              <Button size="sm" variant="outline">
                Export Data
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEngagementData.map((contact) => (
                  <div key={contact.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{contact.contact}</h4>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getEngagementScoreColor(contact.engagementScore)}`}>
                          {contact.engagementScore} pts
                        </p>
                        <p className="text-sm text-muted-foreground">{contact.lastActivity}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email Opens</p>
                        <p className="font-medium">{contact.emailOpens}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Link Clicks</p>
                        <p className="font-medium">{contact.linkClicks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Resource Views</p>
                        <p className="font-medium">{contact.resourceViews}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={contact.engagementScore} className="h-2" />
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
                Engagement Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Avg. Engagement Score</h4>
                  <p className="text-2xl font-bold text-accent">73.2</p>
                  <p className="text-sm text-muted-foreground">+8.5 from last week</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Highly Engaged (80+)</h4>
                  <p className="text-2xl font-bold text-accent">28</p>
                  <p className="text-sm text-muted-foreground">Ready for conversion</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Response Rate</h4>
                  <p className="text-2xl font-bold text-accent">42%</p>
                  <p className="text-sm text-muted-foreground">Email interactions</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Engagement Levels</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>High (80+)</span>
                      <span>25%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medium (60-79)</span>
                      <span>45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Low (&lt;60)</span>
                      <span>30%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
