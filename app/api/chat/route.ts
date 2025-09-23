import { type NextRequest } from "next/server";
import { mcpServer } from '@/lib/mcp/server';

// System prompt for GoHighLevel CRM assistant
const SYSTEM_PROMPT = `You are a helpful AI business assistant integrated with GoHighLevel CRM. You help users manage their business, analyze CRM data, provide insights, and answer questions about:

- Contact management and lead generation
- Sales opportunities and pipeline management
- Business strategy and growth
- Marketing automation and campaigns
- Customer relationship management
- General business advice

You have access to the user's GoHighLevel CRM data through various tools and can provide insights based on their contacts, opportunities, and business activities. Be helpful, professional, and provide actionable advice.

Available tools:
- get_current_time: Get current date and time
- get_ghl_contact: Look up contact information from GoHighLevel CRM
- get_ghl_opportunity: Look up opportunity information from GoHighLevel CRM

When users ask about specific CRM data, use the appropriate tools to fetch real information. Keep responses concise but informative.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Import Genkit configuration
    const { ai } = await import('@/lib/genkit');

    // Prepare the prompt with system message and user messages
    const conversationHistory = messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');
    const prompt = `${SYSTEM_PROMPT}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;

    const response = await ai.generate({
      prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the response text as a stream
        const text = response.text;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    
    // Return error as JSON for non-streaming fallback
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
