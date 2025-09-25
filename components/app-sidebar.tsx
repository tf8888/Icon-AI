import {
  Users,
  MessageCircle,
  CircleDollarSignIcon,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { ChatModal } from "./chat-modal";
import { OpportunityModal } from "./opportunity-modal";
import { ConversationThreadModal } from "./conversation-thread-modal";
import { VoiceChatModal } from "./voice-chat-modal";
import { useRouter } from "next/navigation";

const navigationItems = [
  {
    id: "activity",
    label: "Dashboard",
    icon: Home,
    href: "/activity",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    href: "#",
  },
  { id: "contacts", label: "Contacts", icon: Users, href: "/contacts" },
  {
    id: "conversations",
    label: "Conversations",
    icon: MessageCircle,
    href: "/conversations",
  },
  {
    id: "opportunities",
    label: "Opportunities",
    icon: CircleDollarSignIcon,
    href: "/opportunities",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); // Added chat modal state
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false); // Added voice chat modal state
  const [selectedConversation, setSelectedConversation] = useState<any>(null); // Added state for conversation thread modal
  const [isConversationThreadOpen, setIsConversationThreadOpen] =
    useState(false); // Added state for conversation thread modal
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false); // Added opportunity modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [opportunityModalMode, setOpportunityModalMode] = useState<
    "create" | "edit"
  >("create");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <aside
      className={`${isSidebarCollapsed ? "w-16" : "w-64 "
        } border-r bg-card transition-all duration-300 flex-col hidden md:flex`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold">Stratos AI</h1>
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
      <nav className="flex-1 p-2 flex flex-col justify-between">
        <div
          className={`${isSidebarCollapsed
              ? "flex flex-col items-center space-y-1"
              : "space-y-1"
            }`}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Button
                asChild
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`${isSidebarCollapsed
                    ? "h-12 w-12 p-0 justify-center"
                    : "w-full justify-start px-3"
                  }`}
              >
                <Link href={item.href} className="flex items-center w-full">
                  <Icon
                    className={`h-4 w-4 ${isSidebarCollapsed ? "" : "mr-2"
                      } flex-shrink-0`}
                  />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </Button>
            );
          })}
        </div>
        {/* Stratos AI webinar cross-sell promotional box */}
        {!isSidebarCollapsed && (
          <div className="p-2 pb-0">
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
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8"
              >
                Register Free
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Send Check Up Call Button */}
      {/* {!isSidebarCollapsed && (
          <div className="p-3 mx-2 mb-2 text-center space-y-2">
            <Button
              className="w-full"
              onClick={() => sendCheckUpCall("location_id")}
            >
              <Phone className="mr-2" /> Send Check Up Call
            </Button>
            <hr className="my-2" />
            <div className="text-xs text-muted-foreground">
              Next checkup call: {checkupCalls.morningTime}
            </div>
          </div>
        )} */}

      {/* Floating Chat Button */}
      <div className="p-3 mx-auto mb-2 w-full">
        <Button
          onClick={() => setIsChatModalOpen(true)}
          className={`${isSidebarCollapsed
              ? "h-10 w-10 p-0 justify-center mx-auto rounded-full"
              : "w-full justify-center px-3 h-12 rounded-lg"
            } bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-200 hover:shadow-xl`}
        >
          <Bot
            className={`h-5 w-5 ${isSidebarCollapsed ? "" : "mr-0"
              } flex-shrink-0`}
          />
          {!isSidebarCollapsed && (
            <span className="font-medium">Launch Stratos AI</span>
          )}
        </Button>
      </div>
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onSwitchToVoice={() => {
          setIsChatModalOpen(false);
          setIsVoiceChatOpen(true);
        }}
      />

      {/* Bottom Section - Settings and Theme */}
      <div className="p-2 border-t space-y-1">
        {/* Settings Button */}
        <Button
          onClick={() => router.push("/settings")}
          size="sm"
          variant="ghost"
          className={`${isSidebarCollapsed
              ? "h-12 w-12 p-0 justify-center mx-auto"
              : "w-full justify-start px-3 justify-center"
            }`}
        >
          <Settings
            className={`h-4 w-4 ${isSidebarCollapsed ? "" : "mr-2"
              } flex-shrink-0`}
          />
          {!isSidebarCollapsed && "Manage Settings"}
        </Button>
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
    </aside>
  );
}
