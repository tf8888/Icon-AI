"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Search,
  Settings,
  ExternalLink,
  MessageCircle,
  CircleDollarSignIcon,
  Clock,
  Mic,
  Bot,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Activity,
  Magnet,
  PenTool,
  Sprout,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { VoiceChatModal } from "./voice-chat-modal";
import { ConversationThreadModal } from "./conversation-thread-modal";
import { OpportunityModal } from "./opportunity-modal";
import { ChatInterface } from "./chat-interface";

export function GoHighLevelApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false); // Added voice chat modal state
  const [selectedConversation, setSelectedConversation] = useState<any>(null); // Added state for conversation thread modal
  const [isConversationThreadOpen, setIsConversationThreadOpen] =
    useState(false); // Added state for conversation thread modal
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false); // Added opportunity modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [opportunityModalMode, setOpportunityModalMode] = useState<
    "create" | "edit"
  >("create");
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [checkupCalls, setCheckupCalls] = useState({
    enabled: false,
    morningTime: "09:00",
    eveningTime: "17:00",
    enableMorning: true,
    enableEvening: false,
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState("activity");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Animate mount/unmount helpers for drawer
  const openDrawer = () => {
    setShowMobileNav(true);
    // next frame so transition runs
    requestAnimationFrame(() => setIsMobileNavOpen(true));
  };

  const closeDrawer = () => {
    setIsMobileNavOpen(false);
    // wait for transition to finish before unmount
    setTimeout(() => setShowMobileNav(false), 300);
  };

  // Close mobile nav on ESC key
  useEffect(() => {
    if (!showMobileNav) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showMobileNav]);

  // Mock data for demonstration
  const stats = {
    totalContacts: 1247,
    newLeads: 23,
    conversionRate: 12.5,
    activeDeals: 8,
  };

  const recentContacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 123-4567",
      status: "hot",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@example.com",
      phone: "(555) 234-5678",
      status: "warm",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "(555) 345-6789",
      status: "cold",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      email: "alex@example.com",
      phone: "(555) 456-7890",
      status: "hot",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ];

  const recentActivities = [
    { id: 1, type: "call", contact: "Sarah Johnson", time: "2 hours ago" },
    { id: 2, type: "email", contact: "Mike Chen", time: "4 hours ago" },
    { id: 3, type: "meeting", contact: "Emily Davis", time: "1 day ago" },
    { id: 4, type: "call", contact: "Alex Rodriguez", time: "2 days ago" },
  ];

  const conversations = [
    {
      id: 1,
      contact: "Sarah Johnson",
      lastMessage: "Thanks for the follow-up! I'm interested in learning more.",
      timestamp: "2 hours ago",
      unread: 3,
      status: "active",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      contact: "Mike Chen",
      lastMessage: "Can we schedule a call for next week?",
      timestamp: "5 hours ago",
      unread: 1,
      status: "pending",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      contact: "Emily Davis",
      lastMessage: "I'll get back to you with the details.",
      timestamp: "1 day ago",
      unread: 0,
      status: "waiting",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      contact: "Alex Rodriguez",
      lastMessage: "Perfect! Let's move forward with the proposal.",
      timestamp: "2 days ago",
      unread: 0,
      status: "closed",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ];

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
  ];

  const handleConnect = () => {
    // In a real app, this would redirect to GoHighLevel OAuth
    // For demo purposes, simulate connection
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-yellow-100 text-yellow-800";
      case "cold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const getConversationStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "waiting":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOpportunityStageColor = (stage: string) => {
    switch (stage) {
      case "qualification":
        return "bg-blue-100 text-blue-800";
      case "proposal":
        return "bg-yellow-100 text-yellow-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "closed-won":
        return "bg-green-100 text-green-800";
      case "closed-lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleReplyClick = (conversation: any) => {
    // Added function to handle reply button click
    setSelectedConversation(conversation);
    setIsConversationThreadOpen(true);
  };

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    setOpportunityModalMode("create");
    setIsOpportunityModalOpen(true);
  };

  const handleEditOpportunity = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setOpportunityModalMode("edit");
    setIsOpportunityModalOpen(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey("");
  };

  const handleSaveApiKey = () => {
    // In a real app, this would save to secure storage
    console.log("API Key saved:", apiKey);
    // Show success message or update UI
  };

  const handleCheckupCallUpdate = (field: string, value: any) => {
    setCheckupCalls((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveCheckupSettings = () => {
    // In a real app, this would save to backend
    console.log("Checkup call settings saved:", checkupCalls);
    // Show success message or update UI
  };

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getThemeIcon = () => {
    return theme === "light" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {"Stratos AI Integration"}
            </CardTitle>
            <CardDescription>
              Connect your account to manage contacts and leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What you'll get:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Contact management</li>
                <li>• Lead tracking</li>
                <li>• Activity monitoring</li>
                <li>• Basic analytics</li>
              </ul>
            </div>
            <Button
              onClick={handleConnect}
              className="w-full"
              size="lg"
              disabled={isConnecting}
              aria-busy={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect to Stratos AI
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You&#39;ll be redirected to Stratos AI to authorize this app
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    { id: "activity", label: "Activity", icon: Activity },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "conversations", label: "Conversations", icon: MessageCircle },
    { id: "opportunities", label: "Opportunities", icon: CircleDollarSignIcon },
    { id: "chat", label: "Stratos", icon: Bot },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-16" : "w-64"
        } border-r bg-card transition-all duration-300 flex-col hidden md:flex`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold">Stratos AI</h1>
                <Badge
                  variant="secondary"
                  className="bg-accent text-accent-foreground text-xs"
                >
                  Connected
                </Badge>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="ml-auto"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3">
          <div
            className={`${
              isSidebarCollapsed
                ? "flex flex-col items-center space-y-1"
                : "space-y-1"
            }`}
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`${
                    isSidebarCollapsed
                      ? "h-12 w-12 p-0 justify-center"
                      : "w-full justify-start px-3"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isSidebarCollapsed ? "" : "mr-2"
                    } flex-shrink-0`}
                  />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Stratos AI webinar cross-sell promotional box */}
        {!isSidebarCollapsed && (
          <div className="p-3 mx-2 mb-2">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">
                  Stratos AI Masterclass
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Join our exclusive webinar: "10x Your Sales with AI Automation"
                - Learn advanced strategies to boost conversions.
              </p>
              <Button size="sm" className="w-full text-xs h-8">
                Register Free
              </Button>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThemeChange}
            className={`${
              isSidebarCollapsed
                ? "h-12 w-12 p-0 justify-center mx-auto"
                : "justify-start px-3"
            }`}
          >
            {getThemeIcon()}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="h-14 px-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={openDrawer}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">Stratos AI</h1>
              <Badge
                variant="secondary"
                className="bg-accent text-accent-foreground text-[10px] leading-none py-0.5 px-1.5"
              >
                Connected
              </Badge>
            </div>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeChange}
                aria-label="Toggle theme"
              >
                {getThemeIcon()}
              </Button>
            </div>
          </div>
        </div>
        {/* Attract, Capture, Nurture, Convert Cards */}

        {/* Stats Overview */}
        {activeTab === "activity" && (
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

            {/* Existing Stats */}
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
                        <p className="text-sm text-muted-foreground">
                          New Leads
                        </p>
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
                        <p className="text-2xl font-bold">
                          {stats.conversionRate}%
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
                        <p className="text-sm text-muted-foreground">
                          Active Deals
                        </p>
                        <p className="text-2xl font-bold">
                          {stats.activeDeals}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-chart-4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Contacts Stats Overview */}
        {activeTab === "contacts" && (
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
                        {recentContacts.length}
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
                      <p className="text-sm text-muted-foreground">Hot Leads</p>
                      <p className="text-2xl font-bold">
                        {
                          recentContacts.filter((c) => c.status === "hot")
                            .length
                        }
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Warm Leads
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          recentContacts.filter((c) => c.status === "warm")
                            .length
                        }
                      </p>
                    </div>
                    <UserPlus className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Cold Leads
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          recentContacts.filter((c) => c.status === "cold")
                            .length
                        }
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Conversations Stats Overview */}
        {activeTab === "conversations" && (
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Conversations
                      </p>
                      <p className="text-2xl font-bold">
                        {conversations.length}
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Conversations
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          conversations.filter((c) => c.status === "active")
                            .length
                        }
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Unread Messages
                      </p>
                      <p className="text-2xl font-bold">
                        {conversations.reduce((sum, c) => sum + c.unread, 0)}
                      </p>
                    </div>
                    <Mail className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Response Rate
                      </p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-chart-3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Opportunities Stats Overview */}
        {activeTab === "opportunities" && (
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Opportunities
                      </p>
                      <p className="text-2xl font-bold">
                        {opportunities.length}
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
                      <p className="text-sm text-muted-foreground">
                        Total Value
                      </p>
                      <p className="text-2xl font-bold">
                        $
                        {opportunities
                          .reduce((sum, o) => sum + o.value, 0)
                          .toLocaleString()}
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
                          (opportunities.filter((o) => o.stage === "closed-won")
                            .length /
                            opportunities.length) *
                            100
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
                      <p className="text-sm text-muted-foreground">
                        Closing This Month
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          opportunities.filter((o) =>
                            o.closeDate.includes("2024-02")
                          ).length
                        }
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-chart-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "contacts" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle> Contacts</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={contact.avatar || "/placeholder.svg"}
                            alt={contact.name}
                          />
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {contact.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "conversations" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage
                              src={conversation.avatar || "/placeholder.svg"}
                              alt={conversation.contact}
                            />
                            <AvatarFallback>
                              {conversation.contact
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unread > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {conversation.contact}
                          </p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {conversation.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getConversationStatusColor(
                            conversation.status
                          )}
                        >
                          {conversation.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReplyClick(conversation)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "opportunities" && (
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
                            <p className="font-bold text-lg">
                              ${opportunity.value.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {opportunity.probability}% probability
                            </p>
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
                        <Badge
                          className={getOpportunityStageColor(
                            opportunity.stage
                          )}
                        >
                          {opportunity.stage.replace("-", " ")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOpportunity(opportunity)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "activity" && (
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
          )}

          {activeTab === "chat" && (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>AI Business Assistant</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVoiceChatOpen(true)}
                    className="flex items-center space-x-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Switch to Voice</span>
                  </Button>
                </div>
                <CardDescription>
                  Chat with AI about your business, get insights, and manage
                  your CRM
                </CardDescription>
              </CardHeader>
              <div className="flex-1 flex flex-col">
                <ChatInterface />
              </div>
            </Card>
          )}

          {activeTab === "settings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connection Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Connection Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your GoHighLevel integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">GoHighLevel</p>
                      <p className="text-sm text-muted-foreground">
                        {isConnected ? "Connected" : "Disconnected"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={isConnected ? "default" : "secondary"}
                        className={
                          isConnected
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {isConnected ? "Active" : "Inactive"}
                      </Badge>
                      {isConnected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDisconnect}
                        >
                          Disconnect
                        </Button>
                      )}
                    </div>
                  </div>

                  {!isConnected && (
                    <Button onClick={handleConnect} className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Reconnect to GoHighLevel
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* API Key Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>
                    Manage your GoHighLevel API key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="flex space-x-2">
                      <Input
                        type={isApiKeyVisible ? "text" : "password"}
                        placeholder="Enter your GoHighLevel API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                      >
                        {isApiKeyVisible ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>

                  <Button onClick={handleSaveApiKey} className="w-full">
                    Save API Key
                  </Button>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">
                      How to get your API key:
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-1">
                      <li>1. Log into your GoHighLevel account</li>
                      <li>2. Go to Settings → Integrations</li>
                      <li>3. Find "API Keys" section</li>
                      <li>4. Generate a new API key</li>
                      <li>5. Copy and paste it here</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>AI Checkup Calls</span>
                  </CardTitle>
                  <CardDescription>
                    Configure automated checkup calls with your AI assistant
                    (maximum 2 per day)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Enable AI Checkup Calls</p>
                      <p className="text-sm text-muted-foreground">
                        Receive automated calls to discuss your business
                        progress
                      </p>
                    </div>
                    <Button
                      variant={checkupCalls.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        handleCheckupCallUpdate(
                          "enabled",
                          !checkupCalls.enabled
                        )
                      }
                    >
                      {checkupCalls.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  {checkupCalls.enabled && (
                    <div className="space-y-4">
                      {/* Morning Call Settings */}
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Morning Checkup</p>
                            <p className="text-sm text-muted-foreground">
                              Start your day with business insights
                            </p>
                          </div>
                          <Button
                            variant={
                              checkupCalls.enableMorning ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleCheckupCallUpdate(
                                "enableMorning",
                                !checkupCalls.enableMorning
                              )
                            }
                          >
                            {checkupCalls.enableMorning ? "On" : "Off"}
                          </Button>
                        </div>
                        {checkupCalls.enableMorning && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="time"
                              value={checkupCalls.morningTime}
                              onChange={(e) =>
                                handleCheckupCallUpdate(
                                  "morningTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                            <span className="text-sm text-muted-foreground">
                              Daily call time
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Evening Call Settings */}
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Evening Checkup</p>
                            <p className="text-sm text-muted-foreground">
                              Review your day and plan ahead
                            </p>
                          </div>
                          <Button
                            variant={
                              checkupCalls.enableEvening ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleCheckupCallUpdate(
                                "enableEvening",
                                !checkupCalls.enableEvening
                              )
                            }
                          >
                            {checkupCalls.enableEvening ? "On" : "Off"}
                          </Button>
                        </div>
                        {checkupCalls.enableEvening && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="time"
                              value={checkupCalls.eveningTime}
                              onChange={(e) =>
                                handleCheckupCallUpdate(
                                  "eveningTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                            <span className="text-sm text-muted-foreground">
                              Daily call time
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Call Topics */}
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">
                          What we'll discuss:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Daily lead and opportunity updates</li>
                          <li>
                            • Conversion rate analysis and recommendations
                          </li>
                          <li>• Priority tasks and action items</li>
                          <li>• Business performance insights</li>
                          <li>• Strategic planning and goal tracking</li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleSaveCheckupSettings}
                        className="w-full"
                      >
                        Save Checkup Call Settings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Drawer */}
      {showMobileNav && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileNavOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-card border-r shadow-xl flex flex-col transform transition-transform duration-300 ${
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="h-14 px-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Navigation</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={closeDrawer}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-3 flex-1 overflow-auto">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start px-3"
                      onClick={() => {
                        setActiveTab(item.id);
                        closeDrawer();
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </nav>
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeChange}
                className="justify-start px-3"
              >
                {getThemeIcon()}
              </Button>
            </div>
          </div>
        </>
      )}

      <VoiceChatModal
        isOpen={isVoiceChatOpen}
        onClose={() => setIsVoiceChatOpen(false)}
      />

      <ConversationThreadModal
        isOpen={isConversationThreadOpen}
        onClose={() => setIsConversationThreadOpen(false)}
        conversation={selectedConversation}
      />

      <OpportunityModal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        opportunity={selectedOpportunity}
        mode={opportunityModalMode}
      />
    </div>
  );
}
