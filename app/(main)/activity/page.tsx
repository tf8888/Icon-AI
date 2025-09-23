"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  CircleDollarSignIcon,
  Magnet,
  Mail,
  PenTool,
  Phone,
  Sprout,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

const stats = {
  totalContacts: 1247,
  newLeads: 23,
  conversionRate: 12.5,
  activeDeals: 8,
};

const recentActivities = [
  { id: 1, type: "call", contact: "Sarah Johnson", time: "2 hours ago" },
  { id: 2, type: "email", contact: "Mike Chen", time: "4 hours ago" },
  { id: 3, type: "meeting", contact: "Emily Davis", time: "1 day ago" },
  { id: 4, type: "call", contact: "Alex Rodriguez", time: "2 days ago" },
];

export default function ActivityPage() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Quick Actions */}
      <div className="px-6 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Attract */}
          <button
            type="button"
            className="flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors text-left bg-card"
          >
            <span className="h-9 w-9 rounded-lg bg-primary/90 text-primary-foreground flex items-center justify-center">
              <Magnet className="h-4 w-4" />
            </span>
            <span className="font-medium">Attract</span>
          </button>

          {/* Capture */}
          <button
            type="button"
            className="flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors text-left bg-card"
          >
            <span className="h-9 w-9 rounded-lg bg-primary/90 text-primary-foreground flex items-center justify-center">
              <PenTool className="h-4 w-4" />
            </span>
            <span className="font-medium">Capture</span>
          </button>

          {/* Nurture */}
          <button
            type="button"
            className="flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors text-left bg-card"
          >
            <span className="h-9 w-9 rounded-lg bg-primary/90 text-primary-foreground flex items-center justify-center">
              <Sprout className="h-4 w-4" />
            </span>
            <span className="font-medium">Nurture</span>
          </button>

          {/* Convert */}
          <button
            type="button"
            className="flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors text-left bg-card"
          >
            <span className="h-9 w-9 rounded-lg bg-primary/90 text-primary-foreground flex items-center justify-center">
              <CircleDollarSignIcon className="h-4 w-4" />
            </span>
            <span className="font-medium">Convert</span>
          </button>
        </div>
      </div>
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Contacts
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.totalContacts.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                  <p className="text-2xl font-bold">{stats.newLeads}</p>
                </div>
                <UserPlus className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Conversion Rate
                  </p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Deals</p>
                  <p className="text-2xl font-bold">{stats.activeDeals}</p>
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
            <CardTitle>Activity</CardTitle>
            <CardDescription>
              Latest interactions with your contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold capitalize">
                      {activity.type} with {activity.contact}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
