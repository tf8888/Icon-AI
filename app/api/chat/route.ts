import { type NextRequest } from "next/server";

// System prompt for GoHighLevel CRM assistant
const SYSTEM_PROMPT = `You are a helpful AI business assistant integrated with GoHighLevel CRM and Exa AI search capabilities. You help users manage their business, analyze CRM data, provide insights, and answer questions about:

- Contact management and lead generation
- Sales opportunities and pipeline management
- Business strategy and growth
- Marketing automation and campaigns
- Customer relationship management
- General business advice
- Web search and research using Exa AI
- Code search and documentation lookup
- Company research and competitive analysis

You have access to the user's GoHighLevel CRM data through various tools and can provide insights based on their contacts, opportunities, and business activities. You also have access to Exa AI's powerful search capabilities for real-time web search, code context, company research, and more.

When users ask about specific CRM data, use the appropriate tools to fetch real information. For general questions, research, or when you need current information, use the Exa search tools. Keep responses concise but informative.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Import Genkit configuration and tools
    const { ai, getAllToolsWithMcp, getMcpResources } = await import('@/lib/genkit');
    
    // Prepare the prompt with system message and user messages
    const conversationHistory = messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');
    const prompt = `${SYSTEM_PROMPT}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;

    // Get all tools including MCP tools and resources
    const allToolsWithMcp = await getAllToolsWithMcp();
    const mcpResources = await getMcpResources();

    const response = await ai.generate({
      prompt,
      tools: allToolsWithMcp, // Provide all tools including MCP tools to the model
      resources: mcpResources, // Provide MCP resources
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
