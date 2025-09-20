import { Activity, Users, MessageCircle, CircleDollarSignIcon, Bot, Settings, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { useState } from "react";
import { Badge } from "./ui/badge";

const navigationItems = [
    { id: "activity", label: "Recent Activity", icon: Activity, href: "/activity" },
    { id: "contacts", label: "Contacts", icon: Users, href: "/contacts" },
    { id: "conversations", label: "Conversations", icon: MessageCircle, href: "/conversations" },
    { id: "opportunities", label: "Opportunities", icon: CircleDollarSignIcon, href: "/opportunities" },
    { id: "chat", label: "IconAI", icon: Bot, href: "/chat" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

export function AppSidebar() {
    const pathname = usePathname();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [theme, setTheme] = useState<"light" | "dark">("light")



    const handleThemeChange = () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }

    const getThemeIcon = () => {
        return theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
    }

    return (
        <aside
            className={`${isSidebarCollapsed ? "w-16" : "w-64"} border-r bg-card transition-all duration-300 flex flex-col`}
        >
            {/* Sidebar Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center space-x-2">
                            <Link href="/" className="flex items-center space-x-2 no-underline">
                                <h1 className="text-xl font-bold">{"ICON AI"}</h1>
                                <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                                    Connected
                                </Badge>
                            </Link>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="ml-auto"
                    >
                        {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-2">
                <div className={`${isSidebarCollapsed ? "flex flex-col items-center space-y-1" : "space-y-1"}`}>
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                        return (
                            <Button
                                asChild
                                key={item.id}
                                variant={isActive ? "default" : "ghost"}
                                className={`${isSidebarCollapsed ? "h-12 w-12 p-0 justify-center" : "w-full justify-start px-3"}`}
                            >
                                <Link href={item.href} className="flex items-center w-full">
                                    <Icon className={`h-4 w-4 ${isSidebarCollapsed ? "" : "mr-2"} flex-shrink-0`} />
                                    {!isSidebarCollapsed && <span>{item.label}</span>}
                                </Link>
                            </Button>
                        )
                    })}
                </div>
            </nav>

            {/* IconAI webinar cross-sell promotional box */}
            {!isSidebarCollapsed && (
                <div className="p-3 mx-2 mb-2">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Bot className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-sm">IconAI Masterclass</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Join our exclusive webinar: "10x Your Sales with AI Automation" - Learn advanced strategies to boost
                            conversions.
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
                    className={`w-full ${isSidebarCollapsed ? "h-12 w-12 p-0 justify-center mx-auto" : "justify-start px-3"}`}
                >
                    {getThemeIcon()}
                    {!isSidebarCollapsed && <span className="ml-2">Theme</span>}
                </Button>
            </div>
        </aside>
    )
}