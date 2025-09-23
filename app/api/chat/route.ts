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

    // Dynamic import to avoid build-time issues
    const { generate } = await import('@genkit-ai/core');
    const { gemini15Flash } = await import('@genkit-ai/googleai');
    
    // Initialize Genkit configuration
    await import('@/lib/genkit');

    // Prepare messages with system prompt
    const formattedMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Get available tools from MCP server
    const availableTools = mcpServer.getAvailableTools();
    
    // Convert MCP tools to Genkit tool format
    const genkitTools = availableTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: async (input: any) => {
        const result = await mcpServer.executeTool(tool.name, input);
        return result.content[0]?.text || 'No result';
      }
    }));

    const response = await generate({
      model: gemini15Flash,
      messages: formattedMessages,
      tools: genkitTools,
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
        const text = response.text();
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
