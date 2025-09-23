import { MCPTool, MCPToolCall, MCPToolResult } from '../types';

// Sample tool for demonstration - gets current timestamp
export const getCurrentTimeTool: MCPTool = {
  name: 'get_current_time',
  description: 'Get the current date and time',
  inputSchema: {
    type: 'object',
    properties: {
      timezone: {
        type: 'string',
        description: 'Timezone (optional, defaults to UTC)',
        default: 'UTC'
      },
      format: {
        type: 'string',
        description: 'Date format (optional, defaults to ISO string)',
        enum: ['iso', 'locale', 'timestamp'],
        default: 'iso'
      }
    },
    required: []
  }
};

export async function executeGetCurrentTime(call: MCPToolCall): Promise<MCPToolResult> {
  try {
    const { timezone = 'UTC', format = 'iso' } = call.arguments;
    
    const now = new Date();
    let timeString: string;
    
    switch (format) {
      case 'locale':
        timeString = now.toLocaleString('en-US', { timeZone: timezone });
        break;
      case 'timestamp':
        timeString = now.getTime().toString();
        break;
      case 'iso':
      default:
        timeString = now.toISOString();
        break;
    }
    
    return {
      content: [{
        type: 'text',
        text: `Current time: ${timeString}${timezone !== 'UTC' ? ` (${timezone})` : ''}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting current time: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}
