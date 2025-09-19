"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Heart, TrendingUp, Calendar, Mail, DollarSign, Settings, Bell } from "lucide-react"
import { AttractTab } from "./attract-tab"
import { CaptureTab } from "./capture-tab"
import { NurtureTab } from "./nurture-tab"
import { ConvertTab } from "./convert-tab"
import { HealthScoringSystem } from "./health-scoring-system"

type TabType = "attract" | "capture" | "nurture" | "convert"

interface HealthScore {
  score: number
  status: "excellent" | "good" | "warning" | "critical"
}

const healthScores: Record<TabType, HealthScore> = {
  attract: { score: 85, status: "good" },
  capture: { score: 72, status: "warning" },
  nurture: { score: 91, status: "excellent" },
  convert: { score: 68, status: "warning" },
}

const tabConfig = {
  attract: {
    icon: Target,
    label: "Attract",
    description: "Bring people into your world",
  },
  capture: {
    icon: Users,
    label: "Capture",
    description: "Turn attention into owned data",
  },
  nurture: {
    icon: Heart,
    label: "Nurture",
    description: "Deepen trust and move toward conversion",
  },
  convert: {
    icon: TrendingUp,
    label: "Convert",
    description: "Close deals and onboard clients",
  },
}

function getScoreColor(status: HealthScore["status"]) {
  switch (status) {
    case "excellent":
      return "bg-green-500"
    case "good":
      return "bg-blue-500"
    case "warning":
      return "bg-yellow-500"
    case "critical":
      return "bg-red-500"
  }
}

function getScoreBadgeVariant(status: HealthScore["status"]) {
  switch (status) {
    case "excellent":
      return "default"
    case "good":
      return "secondary"
    case "warning":
      return "outline"
    case "critical":
      return "destructive"
  }
}

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabType>("attract")

  const overallHealthScore = Math.round(Object.values(healthScores).reduce((acc, health) => acc + health.score, 0) / 4)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Customer Journey Control</h1>
            <Badge variant="outline" className="text-xs">
              Mission Control
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Overall Health: {overallHealthScore}%
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Journey Navigation */}
        <aside className="w-80 border-r border-border bg-sidebar p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-sidebar-foreground mb-6">Journey Stages</h2>

            {Object.entries(tabConfig).map(([key, config]) => {
              const tabKey = key as TabType
              const Icon = config.icon
              const health = healthScores[tabKey]
              const isActive = activeTab === tabKey

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(tabKey)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "hover:bg-sidebar-accent/10 text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{config.label}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getScoreColor(health.status)}`} />
                      <span className="text-sm font-medium">{health.score}%</span>
                    </div>
                  </div>
                  <p className="text-sm opacity-75">{config.description}</p>
                </button>
              )
            })}
          </div>

          {/* Overall Health Summary */}
          <Card className="mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Overall Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(healthScores).map(([key, health]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key}</span>
                    <Badge variant={getScoreBadgeVariant(health.status)} className="text-xs">
                      {health.score}%
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Overall</span>
                  <Badge variant="default" className="text-xs">
                    {overallHealthScore}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex">
          {/* Center Panel - Data & Controls */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const Icon = tabConfig[activeTab].icon
                  return <Icon className="h-6 w-6 text-accent" />
                })()}
                <h2 className="text-3xl font-bold text-foreground capitalize">{activeTab}</h2>
                <Badge variant={getScoreBadgeVariant(healthScores[activeTab].status)}>
                  {healthScores[activeTab].score}% Health Score
                </Badge>
              </div>
              <p className="text-muted-foreground">{tabConfig[activeTab].description}</p>
            </div>

            <div className="mb-6">
              <HealthScoringSystem activeTab={activeTab} />
            </div>

            {/* Tab Content */}
            {activeTab === "attract" && <AttractTab />}
            {activeTab === "capture" && <CaptureTab />}
            {activeTab === "nurture" && <NurtureTab />}
            {activeTab === "convert" && <ConvertTab />}
          </div>

          {/* Right Panel - Quick Actions */}
          <aside className="w-80 border-l border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-6">Quick Actions</h3>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Today's Focus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email Campaign
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Content
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Review New Leads
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-card-foreground">Conversion Rate Up</p>
                      <p className="text-muted-foreground">+12% from last week</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-card-foreground">New Leads</p>
                      <p className="text-muted-foreground">47 this week</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-card-foreground">Email Open Rate</p>
                      <p className="text-muted-foreground">68% average</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full" size="lg">
                <DollarSign className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
