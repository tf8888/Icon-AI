import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export async function POST(req: Request) {
  const bearer = req.headers.get("authorization");
  const locationId = req.headers.get("locationId");

  const body = await req.json();

  const { query } = body.message.toolCalls[0].function.arguments;
  const callId = body.message.toolCalls[0].id;

  const mcpClient = new MultiServerMCPClient({
    config: {
      url: "https://services.leadconnectorhq.com/mcp/",
      headers: {
        Authorization: `Bearer ${bearer}`,
        locationId: locationId!,
      },
    },
  });

  const tools = await mcpClient.getTools();
  console.log(`Loaded tools: `, tools.length);

  const llm = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const agent = createReactAgent({ llm, tools });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
  });

  const aiMessage = result.messages[result.messages.length - 1].content;

  return NextResponse.json({
    results: [
      {
        toolCallId: callId,
        result: aiMessage,
      },
    ],
  });
}
