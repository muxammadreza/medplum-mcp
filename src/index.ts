#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Import tool registry
import { toolDefinitions, toolMapping } from './tools/toolRegistry.js';

// Load environment variables
dotenv.config();

// Create the MCP server
const server = new Server(
  {
    name: 'medplum-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions,
  };
});

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    const toolName = request.params.name;
    const args = request.params.arguments;

    console.error(`Executing tool: ${toolName} with args:`, JSON.stringify(args, null, 2));

    const toolFunction = toolMapping[toolName];
    if (!toolFunction) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    let result;

    try {
      // Since we wrapped all tools in toolRegistry to take `args` and return a Promise,
      // we can just call the function.
      result = await toolFunction(args);
    } catch (toolError: any) {
      // Handle specific Medplum/FHIR errors
      if (toolError.message && typeof toolError.message === 'string') {
        // If it's a string error message, wrap it properly
        result = {
          error: toolError.message,
          success: false,
        };
      } else if (toolError.outcome) {
        // FHIR OperationOutcome error
        result = {
          error: 'FHIR operation failed',
          outcome: toolError.outcome,
          success: false,
        };
      } else {
        // Generic error
        result = {
          error: String(toolError),
          success: false,
        };
      }
    }

    console.error(`Tool ${toolName} result:`, JSON.stringify(result, null, 2));

    // Ensure result is serializable
    const serializedResult = JSON.stringify(result, null, 2);

    return {
      content: [
        {
          type: 'text',
          text: serializedResult,
        },
      ],
    };
  } catch (error) {
    console.error('Error executing tool:', error);

    // Ensure error response is always valid JSON
    const errorResponse = {
      error: error instanceof Error ? error.message : String(error),
      success: false,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(errorResponse, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Medplum MCP Server running on stdio');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down Medplum MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down Medplum MCP Server...');
  process.exit(0);
});

// Start the server
runServer().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
