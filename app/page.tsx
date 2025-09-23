'use client';

import { Suspense } from "react"
import { GoHighLevelApp } from "@/components/gohighlevel-app"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HomePage() {

  const router = useRouter();

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{"ICON AI Integration"}</CardTitle>
            <CardDescription>Connect your account to manage contacts and leads</CardDescription>
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
            <Button onClick={() => router.push("/activity")} className="w-full" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect ICON AI
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You&#39;ll be redirected to ICON to authorize this app
            </p>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
