import { MCPTool, MCPToolCall, MCPToolResult, MCPRequest, MCPResponse, MCPServerCapabilities } from './types';
import { getCurrentTimeTool, executeGetCurrentTime } from './tools/sample-tool';
import { getContactTool, executeGetContact, getOpportunityTool, executeGetOpportunity } from './tools/ghl-tools';

export class MCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private toolExecutors: Map<string, (call: MCPToolCall) => Promise<MCPToolResult>> = new Map();

  constructor() {
    this.registerTool(getCurrentTimeTool, executeGetCurrentTime);
    this.registerTool(getContactTool, executeGetContact);
    this.registerTool(getOpportunityTool, executeGetOpportunity);
  }

  private registerTool(tool: MCPTool, executor: (call: MCPToolCall) => Promise<MCPToolResult>) {
    this.tools.set(tool.name, tool);
    this.toolExecutors.set(tool.name, executor);
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request);
        case 'tools/list':
          return this.handleToolsList(request);
        case 'tools/call':
          return this.handleToolCall(request);
        default:
          return {
            error: {
              code: -32601,
              message: `Method not found: ${request.method}`
            },
            id: request.id
          };
      }
    } catch (error) {
      return {
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        id: request.id
      };
    }
  }

  private handleInitialize(request: MCPRequest): MCPResponse {
    const capabilities: MCPServerCapabilities = {
      tools: {
        listChanged: false
      }
    };

    return {
      result: {
        protocolVersion: '2024-11-05',
        capabilities,
        serverInfo: {
          name: 'GoHighLevel MCP Server',
          version: '1.0.0'
        }
      },
      id: request.id
    };
  }

  private handleToolsList(request: MCPRequest): MCPResponse {
    const toolsList = Array.from(this.tools.values());
    
    return {
      result: {
        tools: toolsList
      },
      id: request.id
    };
  }

  private async handleToolCall(request: MCPRequest): Promise<MCPResponse> {
    const { name, arguments: toolArgs } = request.params;
    
    if (!this.toolExecutors.has(name)) {
      return {
        error: {
          code: -32602,
          message: `Tool not found: ${name}`
        },
        id: request.id
      };
    }

    try {
      const executor = this.toolExecutors.get(name)!;
      const result = await executor({ name, arguments: toolArgs || {} });
      
      return {
        result,
        id: request.id
      };
    } catch (error) {
      return {
        error: {
          code: -32603,
          message: `Tool execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        id: request.id
      };
    }
  }

  // Method to get available tools (for integration with chat flow)
  getAvailableTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  // Method to execute a tool directly (for integration with chat flow)
  async executeTool(name: string, args: Record<string, any>): Promise<MCPToolResult> {
    const executor = this.toolExecutors.get(name);
    if (!executor) {
      return {
        content: [{
          type: 'text',
          text: `Tool not found: ${name}`
        }],
        isError: true
      };
    }

    return executor({ name, arguments: args });
  }
}

// Singleton instance
export const mcpServer = new MCPServer();
