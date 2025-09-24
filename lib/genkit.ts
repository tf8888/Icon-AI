import { googleAI } from "@genkit-ai/google-genai";
import { createMcpHost } from "@genkit-ai/mcp";
import { genkit, z } from "genkit";

// Create MCP host for Exa server
export const mcpHost = createMcpHost({
  name: 'exaMcpHost',
  mcpServers: {
    exa: {
      command: 'npx',
      args: ['-y', 'mcp-remote', `https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`],
    },
  },
});

// Initialize Genkit with the Google AI plugin and define tools directly
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API,
    }),
  ],
  model: googleAI.model("gemini-2.5-flash", {
    temperature: 0.7,
  }),
});

// Define tools directly in the main AI instance
export const getCurrentTimeTool = ai.defineTool(
  {
    name: "get_current_time",
    description: "Get the current date and time",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  async () => {
    return new Date().toISOString();
  }
);

export const getGhlContactTool = ai.defineTool(
  {
    name: "get_ghl_contact",
    description: "Look up contact information from GoHighLevel CRM",
    inputSchema: z.object({
      contactId: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      contactName: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  async ({ contactId, email, phone, contactName }) => {
    const mockContact = {
      id: contactId ?? "mock-contact-id",
      name: contactName ?? "John Doe",
      email: email ?? "john@example.com",
      phone: phone ?? "+1234567890",
      tags: ["lead", "interested"],
      lastActivity: new Date().toISOString(),
    };

    return JSON.stringify(mockContact, null, 2);
  }
);

export const getGhlOpportunityTool = ai.defineTool(
  {
    name: "get_ghl_opportunity",
    description: "Look up opportunity information from GoHighLevel CRM",
    inputSchema: z.object({
      opportunityId: z.string().optional(),
      contactId: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  async ({ opportunityId, contactId }) => {
    const mockOpportunity = {
      id: opportunityId ?? "mock-opportunity-id",
      contactId: contactId ?? "mock-contact-id",
      name: "Website Development Project",
      value: 5000,
      stage: "Proposal Sent",
      probability: 75,
      expectedCloseDate: "2024-01-15",
      lastActivity: new Date().toISOString(),
    };

    return JSON.stringify(mockOpportunity, null, 2);
  }
);

export const allTools = [
  getCurrentTimeTool,
  getGhlContactTool,
  getGhlOpportunityTool,
];

// Function to get all tools including MCP tools
export async function getAllToolsWithMcp() {
  const mcpTools = await mcpHost.getActiveTools(ai);
  return [...allTools, ...mcpTools];
}

// Function to get MCP resources
export async function getMcpResources() {
  return await mcpHost.getActiveResources(ai);
}

// Export latest 2025 stable models for direct use if needed
export const gemini25Pro = googleAI.model("gemini-2.5-pro");
export const gemini25Flash = googleAI.model("gemini-2.5-flash");
export const gemini25FlashLite = googleAI.model("gemini-2.5-flash-lite");

// Legacy stable models (still available)
export const gemini15Pro = googleAI.model("gemini-1.5-pro");
export const gemini15Flash = googleAI.model("gemini-1.5-flash");
export const gemini15Flash8B = googleAI.model("gemini-1.5-flash-8b");
