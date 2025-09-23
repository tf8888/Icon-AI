# GoHighLevel AI Assistant

A Next.js application featuring an AI-powered business assistant integrated with GoHighLevel CRM, built with Genkit and Gemini AI, enhanced with a custom MCP (Model Context Protocol) server.

## Features

- 🤖 **AI-Powered Chat**: Intelligent business assistant using Google's Gemini AI via Genkit
- 🔄 **Streaming Responses**: Real-time streaming chat responses for better user experience
- 🛠️ **MCP Server Integration**: Custom Model Context Protocol server with GoHighLevel CRM tools
- 📊 **CRM Integration**: Direct access to GoHighLevel contacts, opportunities, and business data
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS and Radix UI

## Architecture

### Core Components

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **AI Engine**: Google Genkit with Gemini 1.5 Flash model
- **MCP Server**: Custom server implementing Model Context Protocol
- **CRM Integration**: GoHighLevel API integration through MCP tools

### MCP Tools Available

- `get_current_time`: Get current date and time with timezone support
- `get_ghl_contact`: Look up contact information from GoHighLevel CRM
- `get_ghl_opportunity`: Look up opportunity information from GoHighLevel CRM

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Gemini API key from Google AI Studio
- GoHighLevel API credentials (optional, for CRM integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd v0-new-chat
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GHL_API_KEY=your_ghl_api_key_here
GHL_LOCATION_ID=your_location_id_here
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/
│   ├── api/chat/route.ts          # Main chat API endpoint with Genkit integration
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/
│   ├── chat-interface.tsx         # Main chat UI component with streaming support
│   ├── gohighlevel-app.tsx       # Main application component
│   └── ui/                        # Reusable UI components
├── lib/
│   ├── genkit.ts                  # Genkit configuration
│   ├── flows/
│   │   └── chat-flow.ts          # Genkit chat flows
│   └── mcp/
│       ├── server.ts             # MCP server implementation
│       ├── types.ts              # MCP type definitions
│       └── tools/                # MCP tools
│           ├── sample-tool.ts    # Sample time tool
│           └── ghl-tools.ts      # GoHighLevel CRM tools
└── .env.example                   # Environment variables template
```

## Development

### Adding New MCP Tools

1. Create a new tool file in `lib/mcp/tools/`
2. Define the tool schema and executor function
3. Register the tool in `lib/mcp/server.ts`

Example:
```typescript
// lib/mcp/tools/my-tool.ts
export const myTool: MCPTool = {
  name: 'my_tool',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' }
    },
    required: ['param']
  }
};

export async function executeMyTool(call: MCPToolCall): Promise<MCPToolResult> {
  // Implementation here
}
```

### Customizing the AI Assistant

Modify the system prompt in `app/api/chat/route.ts` to change the assistant's behavior and capabilities.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js applications. Make sure to set the required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
