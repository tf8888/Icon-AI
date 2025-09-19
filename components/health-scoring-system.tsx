"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Lightbulb,
  ArrowRight,
} from "lucide-react"

interface HealthMetric {
  name: string
  value: number
  target: number
  trend: "up" | "down" | "stable"
  trendValue: number
  weight: number
}

interface HealthInsight {
  type: "success" | "warning" | "critical" | "info"
  title: string
  description: string
  action?: string
}

interface TabHealthData {
  score: number
  status: "excellent" | "good" | "warning" | "critical"
  metrics: HealthMetric[]
  insights: HealthInsight[]
  recommendations: string[]
}

const healthData: Record<string, TabHealthData> = {
  attract: {
    score: 85,
    status: "good",
    metrics: [
      { name: "Content Reach", value: 26300, target: 30000, trend: "up", trendValue: 18, weight: 0.3 },
      { name: "Click-Through Rate", value: 2.1, target: 2.5, trend: "up", trendValue: 12, weight: 0.25 },
      { name: "Cost Per Click", value: 1.82, target: 2.0, trend: "down", trendValue: -12, weight: 0.2 },
      { name: "Partnership Value", value: 8700, target: 10000, trend: "up", trendValue: 15, weight: 0.25 },
    ],
    insights: [
      {
        type: "success",
        title: "Strong Partnership Performance",
        description: "Partnership leads converting 24% higher than average",
      },
      {
        type: "warning",
        title: "Content Reach Below Target",
        description: "Need 3,700 more monthly reach to hit target",
        action: "Increase social media posting frequency",
      },
    ],
    recommendations: [
      "Increase LinkedIn posting frequency to 5x per week",
      "Launch referral program to boost partnership leads",
      "A/B test ad creative to improve CTR",
    ],
  },
  capture: {
    score: 72,
    status: "warning",
    metrics: [
      { name: "Form Conversion Rate", value: 5.7, target: 8.0, trend: "down", trendValue: -5, weight: 0.4 },
      { name: "Lead Quality Score", value: 73.2, target: 80, trend: "up", trendValue: 5, weight: 0.3 },
      { name: "Page Load Speed", value: 2.8, target: 2.0, trend: "up", trendValue: -8, weight: 0.15 },
      { name: "Mobile Conversion", value: 4.2, target: 6.0, trend: "stable", trendValue: 0, weight: 0.15 },
    ],
    insights: [
      {
        type: "critical",
        title: "Form Conversion Rate Declining",
        description: "5% drop in conversions over the last 2 weeks",
        action: "Optimize form design and reduce fields",
      },
      {
        type: "info",
        title: "Lead Quality Improving",
        description: "Average lead score increased by 5.3 points",
      },
    ],
    recommendations: [
      "Reduce contact form fields from 6 to 3",
      "Add social proof elements to landing pages",
      "Implement exit-intent popups",
      "Optimize mobile form experience",
    ],
  },
  nurture: {
    score: 91,
    status: "excellent",
    metrics: [
      { name: "Email Open Rate", value: 53.7, target: 45, trend: "up", trendValue: 8, weight: 0.25 },
      { name: "Click Rate", value: 10.4, target: 8, trend: "up", trendValue: 15, weight: 0.25 },
      { name: "Engagement Score", value: 73.2, target: 70, trend: "up", trendValue: 8, weight: 0.3 },
      { name: "Personal Touch Response", value: 67, target: 60, trend: "up", trendValue: 12, weight: 0.2 },
    ],
    insights: [
      {
        type: "success",
        title: "Exceptional Email Performance",
        description: "Open rates 19% above industry average",
      },
      {
        type: "success",
        title: "High Engagement Leads Ready",
        description: "28 leads with 80+ engagement scores ready for conversion",
        action: "Move to sales pipeline",
      },
    ],
    recommendations: [
      "Scale successful email templates to other sequences",
      "Increase personal touch frequency for hot leads",
      "Create advanced nurture track for highly engaged leads",
    ],
  },
  convert: {
    score: 68,
    status: "warning",
    metrics: [
      { name: "Close Rate", value: 68, target: 75, trend: "down", trendValue: -3, weight: 0.35 },
      { name: "Avg Deal Size", value: 15125, target: 18000, trend: "up", trendValue: 8, weight: 0.25 },
      { name: "Sales Cycle Length", value: 28, target: 21, trend: "up", trendValue: 15, weight: 0.2 },
      { name: "Proposal Accept Rate", value: 72, target: 80, trend: "stable", trendValue: 0, weight: 0.2 },
    ],
    insights: [
      {
        type: "warning",
        title: "Sales Cycle Too Long",
        description: "Average 28 days vs target of 21 days",
        action: "Streamline proposal process",
      },
      {
        type: "critical",
        title: "Close Rate Declining",
        description: "3% drop in close rate over last month",
        action: "Review objection handling process",
      },
    ],
    recommendations: [
      "Implement proposal templates to reduce creation time",
      "Add urgency elements to proposals (limited-time bonuses)",
      "Schedule follow-up calls within 24 hours of proposal send",
      "Create objection handling playbook for sales team",
    ],
  },
}

function getScoreColor(status: string) {
  switch (status) {
    case "excellent":
      return "text-green-600"
    case "good":
      return "text-blue-600"
    case "warning":
      return "text-yellow-600"
    case "critical":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

function getScoreBgColor(status: string) {
  switch (status) {
    case "excellent":
      return "bg-green-500"
    case "good":
      return "bg-blue-500"
    case "warning":
      return "bg-yellow-500"
    case "critical":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return TrendingUp
    case "down":
      return TrendingDown
    default:
      return BarChart3
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
    case "up":
      return "text-green-600"
    case "down":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

function getInsightIcon(type: string) {
  switch (type) {
    case "success":
      return CheckCircle
    case "warning":
      return AlertTriangle
    case "critical":
      return AlertTriangle
    case "info":
      return Lightbulb
    default:
      return Lightbulb
  }
}

function getInsightColor(type: string) {
  switch (type) {
    case "success":
      return "text-green-600"
    case "warning":
      return "text-yellow-600"
    case "critical":
      return "text-red-600"
    case "info":
      return "text-blue-600"
    default:
      return "text-gray-600"
  }
}

interface HealthScoringSystemProps {
  activeTab: string
}

export function HealthScoringSystem({ activeTab }: HealthScoringSystemProps) {
  const [showDetails, setShowDetails] = useState(false)
  const tabData = healthData[activeTab]

  if (!tabData) return null

  const overallHealth = Object.values(healthData).reduce((acc, data) => acc + data.score, 0) / 4

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Health Score
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(tabData.status)}`}>{tabData.score}</div>
              <Badge variant="outline" className="capitalize">
                {tabData.status}
              </Badge>
            </div>
            <div className="flex-1">
              <Progress value={tabData.score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">Overall funnel health: {overallHealth.toFixed(0)}%</p>
            </div>
          </div>

          {showDetails && (
            <div className="space-y-4">
              {/* Key Metrics */}
              <div>
                <h4 className="font-medium mb-3">Key Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tabData.metrics.map((metric, index) => {
                    const TrendIcon = getTrendIcon(metric.trend)
                    const progress = (metric.value / metric.target) * 100

                    return (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                            <TrendIcon className="h-3 w-3" />
                            <span className="text-xs">
                              {metric.trend === "down" ? "" : "+"}
                              {metric.trendValue}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-bold">
                            {typeof metric.value === "number" && metric.value > 100
                              ? metric.value.toLocaleString()
                              : metric.value}
                            {metric.name.includes("Rate") || metric.name.includes("Score") ? "%" : ""}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Target: {metric.target}
                            {metric.name.includes("Rate") || metric.name.includes("Score") ? "%" : ""}
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-1" />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Insights */}
              <div>
                <h4 className="font-medium mb-3">Key Insights</h4>
                <div className="space-y-2">
                  {tabData.insights.map((insight, index) => {
                    const Icon = getInsightIcon(insight.type)
                    return (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <Icon className={`h-4 w-4 mt-0.5 ${getInsightColor(insight.type)}`} />
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{insight.title}</h5>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                            {insight.action && (
                              <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                                <ArrowRight className="h-3 w-3 mr-1" />
                                {insight.action}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {tabData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
