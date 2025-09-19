"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DollarSign,
  Clock,
  Mic,
  Bot,
} from "lucide-react";
import { VoiceChatModal } from "./voice-chat-modal"; // Import voice chat modal
import { ConversationThreadModal } from "./conversation-thread-modal"; // Added conversation thread modal import
import { OpportunityModal } from "./opportunity-modal"; // Added opportunity modal import
import { ChatInterface } from "./chat-interface"; // Added AI Chat interface import

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
    setTimeout(() => setIsConnected(true), 2000);
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {"ICON AI Integration"}
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
            <Button onClick={handleConnect} className="w-full" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect ICON AI
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You&#39;ll be redirected to ICON to authorize this app
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">{"ICON AI"}</h1>
              <Badge
                variant="secondary"
                className="bg-accent text-accent-foreground"
              >
                Connected
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        {/* Main Content */}
        <Tabs defaultValue="contacts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="contacts">Attract</TabsTrigger>
            <TabsTrigger value="capture">Capture</TabsTrigger>
            <TabsTrigger value="conversations">Nurture</TabsTrigger>
            <TabsTrigger value="opportunities">Convert</TabsTrigger>
            <TabsTrigger value="ai-checkup">AI Checkup</TabsTrigger>
            <TabsTrigger value="chat">Action Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
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
                      <DollarSign className="h-4 w-4 mr-2" />
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
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
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
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            {" "}
            {/* Added AI Chat tab content */}
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
          </TabsContent>
        </Tabs>
      </div>

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
