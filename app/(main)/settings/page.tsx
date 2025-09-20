'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Settings, ExternalLink, Phone, Clock } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
    const [isConnected, setIsConnected] = useState(false);

    const [apiKey, setApiKey] = useState("")
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)

    const [checkupCalls, setCheckupCalls] = useState({
        enabled: false,
        morningTime: "09:00",
        eveningTime: "17:00",
        enableMorning: true,
        enableEvening: false,
    })

    const handleSaveCheckupSettings = () => {
        // In a real app, this would save to backend
        console.log("Checkup call settings saved:", checkupCalls)
        // Show success message or update UI
    }

    const handleSaveApiKey = () => {
        // In a real app, this would save to secure storage
        console.log("API Key saved:", apiKey)
        // Show success message or update UI
    }

    const handleConnect = () => {
        // In a real app, this would redirect to GoHighLevel OAuth
        // For demo purposes, simulate connection
        setTimeout(() => setIsConnected(true), 2000)
    }

    const handleDisconnect = () => {
        setIsConnected(false)
        setApiKey("")
    }

    const handleCheckupCallUpdate = (field: string, value: any) => {
        setCheckupCalls((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <>
            <div className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Connection Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <span>Connection Settings</span>
                            </CardTitle>
                            <CardDescription>Manage your GoHighLevel integration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-semibold">GoHighLevel</p>
                                    <p className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge
                                        variant={isConnected ? "default" : "secondary"}
                                        className={isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                    >
                                        {isConnected ? "Active" : "Inactive"}
                                    </Badge>
                                    {isConnected && (
                                        <Button variant="outline" size="sm" onClick={handleDisconnect}>
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
                            <CardDescription>Manage your GoHighLevel API key</CardDescription>
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
                                    <Button variant="outline" size="sm" onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}>
                                        {isApiKeyVisible ? "Hide" : "Show"}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Your API key is encrypted and stored securely</p>
                            </div>

                            <Button onClick={handleSaveApiKey} className="w-full">
                                Save API Key
                            </Button>

                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium mb-1">How to get your API key:</p>
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
                                Configure automated checkup calls with your AI assistant (maximum 2 per day)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Enable/Disable Toggle */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-semibold">Enable AI Checkup Calls</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receive automated calls to discuss your business progress
                                    </p>
                                </div>
                                <Button
                                    variant={checkupCalls.enabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleCheckupCallUpdate("enabled", !checkupCalls.enabled)}
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
                                                <p className="text-sm text-muted-foreground">Start your day with business insights</p>
                                            </div>
                                            <Button
                                                variant={checkupCalls.enableMorning ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleCheckupCallUpdate("enableMorning", !checkupCalls.enableMorning)}
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
                                                    onChange={(e) => handleCheckupCallUpdate("morningTime", e.target.value)}
                                                    className="w-32"
                                                />
                                                <span className="text-sm text-muted-foreground">Daily call time</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Evening Call Settings */}
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Evening Checkup</p>
                                                <p className="text-sm text-muted-foreground">Review your day and plan ahead</p>
                                            </div>
                                            <Button
                                                variant={checkupCalls.enableEvening ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleCheckupCallUpdate("enableEvening", !checkupCalls.enableEvening)}
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
                                                    onChange={(e) => handleCheckupCallUpdate("eveningTime", e.target.value)}
                                                    className="w-32"
                                                />
                                                <span className="text-sm text-muted-foreground">Daily call time</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Call Topics */}
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm font-medium mb-2">What we'll discuss:</p>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Daily lead and opportunity updates</li>
                                            <li>• Conversion rate analysis and recommendations</li>
                                            <li>• Priority tasks and action items</li>
                                            <li>• Business performance insights</li>
                                            <li>• Strategic planning and goal tracking</li>
                                        </ul>
                                    </div>

                                    <Button onClick={handleSaveCheckupSettings} className="w-full">
                                        Save Checkup Call Settings
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}