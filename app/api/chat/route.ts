import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are a helpful AI business assistant integrated with GoHighLevel CRM. You help users manage their business, analyze CRM data, provide insights, and answer questions about:

- Contact management and lead generation
- Sales opportunities and pipeline management
- Business strategy and growth
- Marketing automation and campaigns
- Customer relationship management
- General business advice

You have access to the user's GoHighLevel CRM data and can provide insights based on their contacts, opportunities, and business activities. Be helpful, professional, and provide actionable advice.

Keep responses concise but informative. If asked about specific CRM data, acknowledge that you can help analyze their business data and provide relevant insights.`,
        },
        ...messages,
      ],
      maxTokens: 500,
    })

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
