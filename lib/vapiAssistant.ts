import { VapiClient } from "@vapi-ai/server-sdk";

type CreateAssistantInput = {
  client?: VapiClient;
  bearer: string;
  locationId?: string | null;
  callType?: string;
  modelMessages?: any[];
  assistantOverrides?: Record<string, any>;
};

const DEFAULT_MCP_SERVER_URL = "https://services.leadconnectorhq.com/mcp/";

export async function createAssistantWithTools(input: CreateAssistantInput) {
  const {
    client: providedClient,
    bearer,
    locationId,
    callType,
    modelMessages,
    assistantOverrides,
  } = input;

  const token = process.env.VAPI_API_KEY;
  if (!token && !providedClient) {
    throw new Error("Server misconfiguration: VAPI_API_KEY is not set.");
  }

  const client = providedClient ?? new VapiClient({ token: token! });

  // Create MCP tool
  const toolPayload: any = {
    type: "mcp",
    server: {
      url: DEFAULT_MCP_SERVER_URL,
      headers: {
        Authorization: `Bearer ${bearer}`,
        locationId: locationId || undefined,
      },
    },
    metadata: {
      protocol: "shttp",
    },
  };
  const tool = await client.tools.create(toolPayload);

  const instructions: string | undefined = `Your job is to provide the user with a summary of their business and help them with their GoHighLevel tasks. Their location id is ${
    locationId || "unknown"
  } use this for all tool calls. This is a ${callType || "checkup"} session.`;

  const messagesFromBody = Array.isArray(modelMessages) ? modelMessages : [];
  const mergedMessages = instructions
    ? [
        { role: "system", content: instructions },
        ...messagesFromBody,
      ]
    : messagesFromBody;

  const assistantPayload = {
    ...(assistantOverrides ?? {}),
    model: {
      provider: "openai",
      model: "gpt-4o",
      toolIds: [tool.id],
      messages: mergedMessages,
      ...(assistantOverrides?.model ?? {}),
    },
  } as any;

  const assistant = await client.assistants.create(assistantPayload);
  return { assistant, tool };
}


