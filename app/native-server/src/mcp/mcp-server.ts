import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { setupTools } from './register-tools';

/**
 * Create a FRESH MCP Server instance.
 * The MCP SDK allows only one transport per Server/Protocol instance.
 * Reusing a singleton causes: "Already connected to a transport..."
 */
export const createMcpServer = (): Server => {
  const server = new Server(
    {
      name: 'ChromeMcpServer',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );
  setupTools(server);
  return server;
};

/** @deprecated Use createMcpServer() per connection */
export const getMcpServer = createMcpServer;

export let mcpServer: Server | null = null;
