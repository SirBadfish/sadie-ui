// Configuration
const N8N_BASE_URL = 'http://localhost:5678'; // Change this to your n8n URL
const WEBHOOK_PATH = '/webhook/sadie-ui'; // The webhook you'll create in n8n

// WebSocket for real-time updates
let socket: WebSocket | null = null;
let messageCallback: MessageCallback | null = null;
let statusCallback: StatusCallback | null = null;

// Type definitions
interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: any) => void; // For MCPWebSocket specifically
}

type MessageCallback = (message: any) => void;
type StatusCallback = (status: any) => void;

interface OperationContext {
  sessionId?: string;
}

interface SendMessagePayload {
  content?: string;
  type?: string;
  metadata?: any;
}

type FileOperationType = 'read' | 'write' | 'delete' | 'list' | 'mkdir'; // Add more as needed

interface MCPWebSocketConnection {
  close: () => void;
  send: (message: any) => void;
}

/**
 * Connect to n8n via WebSocket
 */
export function connectWebSocket(sessionId: string, callbacks: WebSocketCallbacks = {}): void {
  if (socket) {
    socket.close();
  }

  const wsUrl: string = N8N_BASE_URL.replace('http', 'ws') + '/ws/' + sessionId;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    if (callbacks.onConnect) callbacks.onConnect();
  };

  socket.onmessage = (event: MessageEvent) => {
    const data: any = JSON.parse(event.data); // Use 'any' for now, or define a specific structure
    console.log('Received WebSocket message:', data);
    
    // Handle different types of messages
    if (data.type === 'message' && messageCallback) {
      messageCallback(data.message);
    } else if (data.type === 'status' && statusCallback) {
      statusCallback(data.status);
    }
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    socket = null;
    if (callbacks.onDisconnect) callbacks.onDisconnect();
  };

  socket.onerror = (error: Event) => {
    console.error('WebSocket error:', error);
    if (callbacks.onError) callbacks.onError(error);
  };
}

/**
 * Connect to n8n via MCP WebSocket
 */
export function connectMCPWebSocket(sessionId: string, callbacks: WebSocketCallbacks = {}): MCPWebSocketConnection {
  const wsUrl: string = `${N8N_BASE_URL.replace('http', 'ws')}/mcp/sse`;

  const mcpSocket = new WebSocket(wsUrl); // Use a different variable name
  
  mcpSocket.onopen = () => {
    console.log('MCP WebSocket connection established');
    if (callbacks.onConnect) callbacks.onConnect();
  };

  mcpSocket.onmessage = (event: MessageEvent) => {
    const data: any = JSON.parse(event.data);
    console.log('Received MCP message:', data);
    
    // Handle message based on type
    if (callbacks.onMessage) callbacks.onMessage(data);
  };

  mcpSocket.onclose = () => {
    console.log('MCP WebSocket connection closed');
    if (callbacks.onDisconnect) callbacks.onDisconnect();
  };
  
  return {
    close: () => mcpSocket.close(),
    send: (message: any) => mcpSocket.send(JSON.stringify(message))
  };
}

/**
 * Register a callback for incoming messages
 */
export function onMessage(callback: MessageCallback): void {
  messageCallback = callback;
}

/**
 * Register a callback for status updates
 */
export function onStatusUpdate(callback: StatusCallback): void {
  statusCallback = callback;
}

/**
 * Send a message to n8n
 */
export async function sendMessage(message: string | SendMessagePayload, context: OperationContext = {}): Promise<any> {
  try {
    console.log('Sending message to n8n:', message);
    
    const response = await fetch(`${N8N_BASE_URL}${WEBHOOK_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: typeof message === 'string' ? message : message.content,
        context,
        sessionId: context.sessionId || 'default',
        messageType: typeof message === 'string' ? 'text' : message.type || 'text',
        metadata: typeof message === 'string' ? {} : message.metadata || {}
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: any = await response.json();
    return result;
  } catch (error: any) { // Type the error
    console.error('Error sending message to n8n:', error);
    throw error;
  }
}

/**
 * Perform a file operation via n8n
 */
export async function fileOperation(operationType: FileOperationType, path: string, content: string | null = null, context: OperationContext = {}): Promise<any> {
  try {
    const response = await fetch(`${N8N_BASE_URL}${WEBHOOK_PATH}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: operationType,
        path,
        content,
        sessionId: context.sessionId || 'default'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: any = await response.json();
    return result;
  } catch (error: any) { // Type the error
    console.error(`Error performing file operation (${operationType}):`, error);
    throw error;
  }
}

/**
 * Execute terminal command via n8n
 */
export async function executeCommand(command: string, workingDir: string = '~/', context: OperationContext = {}): Promise<any> {
  try {
    const response = await fetch(`${N8N_BASE_URL}${WEBHOOK_PATH}/terminal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        command,
        workingDirectory: workingDir,
        sessionId: context.sessionId || 'default'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: any = await response.json();
    return result;
  } catch (error: any) { // Type the error
    console.error('Error executing command via n8n:', error);
    throw error;
  }
}