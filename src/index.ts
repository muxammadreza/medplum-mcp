#!/usr/bin/env node

/**
 * Medplum MCP Server
 * 
 * IMPORTANT: This server uses stdio transport. All logging MUST go to stderr,
 * NOT stdout. stdout is reserved exclusively for JSON-RPC protocol messages.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Load environment variables FIRST, with quiet mode to prevent stdout pollution
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// Import tool registry (after dotenv is configured)
import { toolDefinitions, toolMapping } from './tools/toolRegistry.js';

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

    // Log to stderr only
    console.error(`[MCP] Executing tool: ${toolName}`);

    const toolFunction = toolMapping[toolName];
    if (!toolFunction) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    let result;

    try {
      result = await toolFunction(args);
    } catch (toolError: unknown) {
      // Handle specific Medplum/FHIR errors
      if (
        typeof toolError === 'object' &&
        toolError !== null &&
        'message' in toolError &&
        typeof (toolError as { message?: unknown }).message === 'string'
      ) {
        result = {
          error: (toolError as { message: string }).message,
          success: false,
        };
      } else if (
        typeof toolError === 'object' &&
        toolError !== null &&
        'outcome' in toolError
      ) {
        // FHIR OperationOutcome error
        result = {
          error: 'FHIR operation failed',
          outcome: (toolError as { outcome: unknown }).outcome,
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
    console.error('[MCP] Error executing tool:', error);

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
async function runServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP] Medplum MCP Server running on stdio');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('[MCP] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[MCP] Shutting down...');
  process.exit(0);
});

// Start the server
runServer().catch((error) => {
  console.error('[MCP] Fatal error:', error);
  process.exit(1);
});
