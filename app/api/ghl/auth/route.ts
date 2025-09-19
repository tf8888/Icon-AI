import { type NextRequest, NextResponse } from "next/server"

// This would handle the OAuth callback from GoHighLevel
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.json({ error: "Authorization code not provided" }, { status: 400 })
  }

  try {
    // In a real implementation, you would:
    // 1. Exchange the authorization code for an access token
    // 2. Store the tokens securely (database, encrypted cookies, etc.)
    // 3. Redirect the user back to your app

    const tokenResponse = await fetch("https://services.leadconnectorhq.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GHL_CLIENT_ID || "",
        client_secret: process.env.GHL_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.GHL_REDIRECT_URI || "",
      }),
    })

    const tokens = await tokenResponse.json()

    // Store tokens securely here
    // For demo purposes, we'll just return success

    return NextResponse.redirect(new URL("/?connected=true", request.url))
  } catch (error) {
    console.error("OAuth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
