"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Kanban,
  FileText,
  CreditCard,
  CheckCircle,
  Plus,
  User,
  Send,
  Eye,
  Download,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

interface PipelineItem {
  id: string
  name: string
  company: string
  value: number
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
  probability: number
  lastActivity: string
  nextAction: string
}

interface Proposal {
  id: string
  client: string
  title: string
  value: number
  status: "draft" | "sent" | "viewed" | "signed" | "rejected"
  sentDate: string
  expiryDate: string
}

interface Payment {
  id: string
  client: string
  type: "invoice" | "subscription" | "one-time"
  amount: number
  status: "pending" | "paid" | "overdue" | "failed"
  dueDate: string
  method: string
}

interface CloseOutSequence {
  id: string
  client: string
  type: "onboarding" | "welcome" | "setup"
  progress: number
  status: "active" | "completed" | "paused"
  startDate: string
  steps: number
  completedSteps: number
}

const mockPipelineItems: PipelineItem[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    company: "TechCorp Inc",
    value: 15000,
    stage: "proposal",
    probability: 75,
    lastActivity: "2 hours ago",
    nextAction: "Follow up on proposal",
  },
  {
    id: "2",
    name: "Mike Chen",
    company: "StartupXYZ",
    value: 8500,
    stage: "negotiation",
    probability: 60,
    lastActivity: "1 day ago",
    nextAction: "Schedule pricing call",
  },
  {
    id: "3",
    name: "Emma Davis",
    company: "Enterprise Co",
    value: 25000,
    stage: "qualified",
    probability: 40,
    lastActivity: "3 days ago",
    nextAction: "Send proposal",
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    company: "Growth LLC",
    value: 12000,
    stage: "closed-won",
    probability: 100,
    lastActivity: "1 week ago",
    nextAction: "Begin onboarding",
  },
]

const mockProposals: Proposal[] = [
  {
    id: "1",
    client: "TechCorp Inc",
    title: "Marketing Strategy Package",
    value: 15000,
    status: "viewed",
    sentDate: "2024-01-10",
    expiryDate: "2024-01-24",
  },
  {
    id: "2",
    client: "StartupXYZ",
    title: "Growth Consulting",
    value: 8500,
    status: "sent",
    sentDate: "2024-01-12",
    expiryDate: "2024-01-26",
  },
  {
    id: "3",
    client: "Enterprise Co",
    title: "Full Service Package",
    value: 25000,
    status: "draft",
    sentDate: "",
    expiryDate: "2024-01-30",
  },
]

const mockPayments: Payment[] = [
  {
    id: "1",
    client: "Growth LLC",
    type: "invoice",
    amount: 12000,
    status: "paid",
    dueDate: "2024-01-15",
    method: "Bank Transfer",
  },
  {
    id: "2",
    client: "TechCorp Inc",
    type: "subscription",
    amount: 2500,
    status: "pending",
    dueDate: "2024-01-20",
    method: "Credit Card",
  },
  {
    id: "3",
    client: "StartupXYZ",
    type: "one-time",
    amount: 5000,
    status: "overdue",
    dueDate: "2024-01-10",
    method: "Credit Card",
  },
]

const mockCloseOutSequences: CloseOutSequence[] = [
  {
    id: "1",
    client: "Growth LLC",
    type: "onboarding",
    progress: 75,
    status: "active",
    startDate: "2024-01-08",
    steps: 8,
    completedSteps: 6,
  },
  {
    id: "2",
    client: "Previous Client A",
    type: "welcome",
    progress: 100,
    status: "completed",
    startDate: "2024-01-01",
    steps: 5,
    completedSteps: 5,
  },
  {
    id: "3",
    client: "Previous Client B",
    type: "setup",
    progress: 40,
    status: "paused",
    startDate: "2024-01-05",
    steps: 10,
    completedSteps: 4,
  },
]

const stageConfig = {
  lead: { label: "Lead", color: "bg-gray-500" },
  qualified: { label: "Qualified", color: "bg-blue-500" },
  proposal: { label: "Proposal", color: "bg-yellow-500" },
  negotiation: { label: "Negotiation", color: "bg-orange-500" },
  "closed-won": { label: "Closed Won", color: "bg-green-500" },
  "closed-lost": { label: "Closed Lost", color: "bg-red-500" },
}

function getStatusColor(status: string) {
  switch (status) {
    case "sent":
    case "active":
    case "paid":
      return "bg-blue-500"
    case "viewed":
    case "pending":
      return "bg-yellow-500"
    case "signed":
    case "completed":
      return "bg-green-500"
    case "rejected":
    case "failed":
    case "overdue":
      return "bg-red-500"
    case "draft":
    case "paused":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "sent":
    case "active":
    case "paid":
      return "default"
    case "viewed":
    case "pending":
      return "secondary"
    case "signed":
    case "completed":
      return "default"
    case "rejected":
    case "failed":
    case "overdue":
      return "destructive"
    case "draft":
    case "paused":
      return "outline"
    default:
      return "outline"
  }
}

export function ConvertTab() {
  const [activeSubsection, setActiveSubsection] = useState<"pipeline" | "proposals" | "payments" | "closeout">(
    "pipeline",
  )

  const subsections = [
    { key: "pipeline", label: "Pipeline View", icon: Kanban },
    { key: "proposals", label: "Proposals & Contracts", icon: FileText },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "closeout", label: "Close-Out Sequences", icon: CheckCircle },
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

      {/* Pipeline View */}
      {activeSubsection === "pipeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Kanban className="h-5 w-5" />
                  Sales Pipeline
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPipelineItems.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${stageConfig[item.stage].color}`} />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.value.toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.probability}% prob
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {stageConfig[item.stage].label}
                        </Badge>
                        <span className="text-muted-foreground">{item.lastActivity}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Next: {item.nextAction}</span>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3">
                        <Progress value={item.probability} className="h-2" />
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
                <CardTitle className="text-sm">Pipeline Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Total Pipeline Value</h4>
                    <p className="text-2xl font-bold text-accent">$60,500</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Weighted Value</h4>
                    <p className="text-2xl font-bold text-accent">$38,250</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Close Rate</h4>
                    <p className="text-2xl font-bold text-accent">68%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stage Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Qualified</span>
                    <span>1 deal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Proposal</span>
                    <span>1 deal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Negotiation</span>
                    <span>1 deal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Closed Won</span>
                    <span>1 deal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Proposals & Contracts */}
      {activeSubsection === "proposals" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Active Proposals
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProposals.map((proposal) => (
                  <div key={proposal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{proposal.title}</h4>
                        <p className="text-sm text-muted-foreground">{proposal.client}</p>
                      </div>
                      <Badge variant={getStatusBadge(proposal.status)} className="capitalize">
                        {proposal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-medium">${proposal.value.toLocaleString()}</span>
                      <span className="text-muted-foreground">Expires: {proposal.expiryDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proposal.status === "draft" ? (
                        <Button size="sm" className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
                Proposal Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Total Proposal Value</h4>
                  <p className="text-2xl font-bold text-accent">$48,500</p>
                  <p className="text-sm text-muted-foreground">3 active proposals</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Acceptance Rate</h4>
                  <p className="text-2xl font-bold text-accent">72%</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Avg. Response Time</h4>
                  <p className="text-2xl font-bold text-accent">3.2 days</p>
                  <p className="text-sm text-muted-foreground">From send to view</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Proposal Status</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Draft</span>
                      <span>1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sent</span>
                      <span>1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Viewed</span>
                      <span>1</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments */}
      {activeSubsection === "payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Tracking
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPayments.map((payment) => (
                    <div key={payment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(payment.status)}`} />
                          <div>
                            <h4 className="font-medium">{payment.client}</h4>
                            <Badge variant="outline" className="capitalize mt-1">
                              {payment.type.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(payment.status)} className="capitalize">
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-lg">${payment.amount.toLocaleString()}</span>
                        <span className="text-muted-foreground">Due: {payment.dueDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{payment.method}</span>
                        {payment.status === "overdue" && (
                          <Button size="sm" variant="outline">
                            Send Reminder
                          </Button>
                        )}
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
                <CardTitle className="text-sm">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Outstanding</h4>
                    <p className="text-2xl font-bold text-accent">$7,500</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Overdue</h4>
                    <p className="text-2xl font-bold text-red-600">$5,000</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">This Month</h4>
                    <p className="text-2xl font-bold text-green-600">$12,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bank Transfer</span>
                    <span>50%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Credit Card</span>
                    <span>50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Close-Out Sequences */}
      {activeSubsection === "closeout" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Client Onboarding
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Start Sequence
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCloseOutSequences.map((sequence) => (
                  <div key={sequence.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{sequence.client}</h4>
                        <Badge variant="outline" className="capitalize mt-1">
                          {sequence.type}
                        </Badge>
                      </div>
                      <Badge variant={getStatusBadge(sequence.status)} className="capitalize">
                        {sequence.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-muted-foreground">
                        {sequence.completedSteps} of {sequence.steps} steps
                      </span>
                      <span className="text-muted-foreground">Started: {sequence.startDate}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{sequence.progress}%</span>
                      </div>
                      <Progress value={sequence.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Onboarding Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Active Sequences</h4>
                  <p className="text-2xl font-bold text-accent">1</p>
                  <p className="text-sm text-muted-foreground">In progress</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Completion Rate</h4>
                  <p className="text-2xl font-bold text-accent">85%</p>
                  <p className="text-sm text-muted-foreground">Average across all sequences</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Avg. Time to Complete</h4>
                  <p className="text-2xl font-bold text-accent">12 days</p>
                  <p className="text-sm text-muted-foreground">For onboarding sequences</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Sequence Types</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Onboarding</span>
                      <span>1 active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Welcome</span>
                      <span>1 completed</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Setup</span>
                      <span>1 paused</span>
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
