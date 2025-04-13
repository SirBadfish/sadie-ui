// Configuration
const N8N_BASE_URL = 'http://localhost:5678'; // Change this to your n8n URL
const WEBHOOK_PATH = '/webhook/sadie-ui'; // The webhook you'll create in n8n

// WebSocket for real-time updates
let socket = null;
let messageCallback = null;
let statusCallback = null;

/**
 * Connect to n8n via WebSocket
 */
export function connectWebSocket(sessionId, callbacks = {}) {
  if (socket) {
    socket.close();
  }
  
  const wsUrl = N8N_BASE_URL.replace('http', 'ws') + '/ws/' + sessionId;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    if (callbacks.onConnect) callbacks.onConnect();
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
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
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (callbacks.onError) callbacks.onError(error);
  };
}

/**
 * Connect to n8n via MCP WebSocket
 */
export function connectMCPWebSocket(sessionId, callbacks = {}) {
  const wsUrl = `${N8N_BASE_URL.replace('http', 'ws')}/mcp/sse`;
  
  const socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('MCP WebSocket connection established');
    if (callbacks.onConnect) callbacks.onConnect();
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received MCP message:', data);
    
    // Handle message based on type
    if (callbacks.onMessage) callbacks.onMessage(data);
  };
  
  socket.onclose = () => {
    console.log('MCP WebSocket connection closed');
    if (callbacks.onDisconnect) callbacks.onDisconnect();
  };
  
  return {
    close: () => socket.close(),
    send: (message) => socket.send(JSON.stringify(message))
  };
}

/**
 * Register a callback for incoming messages
 */
export function onMessage(callback) {
  messageCallback = callback;
}

/**
 * Register a callback for status updates
 */
export function onStatusUpdate(callback) {
  statusCallback = callback;
}

/**
 * Send a message to n8n
 */
export async function sendMessage(message, context = {}) {
  try {
    console.log('Sending message to n8n:', message);
    
    const response = await fetch(`${N8N_BASE_URL}${WEBHOOK_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message.content || message,
        context,
        sessionId: context.sessionId || 'default',
        messageType: message.type || 'text',
        metadata: message.metadata || {}
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending message to n8n:', error);
    throw error;
  }
}

/**
 * Perform a file operation via n8n
 */
export async function fileOperation(operationType, path, content = null, context = {}) {
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
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error performing file operation (${operationType}):`, error);
    throw error;
  }
}

/**
 * Execute terminal command via n8n
 */
export async function executeCommand(command, workingDir = '~/', context = {}) {
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
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error executing command via n8n:', error);
    throw error;
  }
}