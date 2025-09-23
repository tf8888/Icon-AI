import { defineFlow, streamFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/core';
import { gemini15Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

// Input schema for the chat flow
const ChatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
});

// System prompt for GoHighLevel CRM assistant
const SYSTEM_PROMPT = `You are a helpful AI business assistant integrated with GoHighLevel CRM. You help users manage their business, analyze CRM data, provide insights, and answer questions about:

- Contact management and lead generation
- Sales opportunities and pipeline management
- Business strategy and growth
- Marketing automation and campaigns
- Customer relationship management
- General business advice

You have access to the user's GoHighLevel CRM data and can provide insights based on their contacts, opportunities, and business activities. Be helpful, professional, and provide actionable advice.

Keep responses concise but informative. If asked about specific CRM data, acknowledge that you can help analyze their business data and provide relevant insights.`;

export const chatFlow = defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { messages } = input;
    
    // Prepare messages with system prompt
    const formattedMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await generate({
      model: gemini15Flash,
      messages: formattedMessages,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    return response.text();
  }
);

// Streaming version of the chat flow
export const chatStreamFlow = defineFlow(
  {
    name: 'chatStreamFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.any(), // For streaming response
  },
  async (input) => {
    const { messages } = input;
    
    // Prepare messages with system prompt
    const formattedMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await generate({
      model: gemini15Flash,
      messages: formattedMessages,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      streamingCallback: (chunk) => {
        // This will be handled by the streaming response
        return chunk;
      },
    });

    return response;
  }
);
