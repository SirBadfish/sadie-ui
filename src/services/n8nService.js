// src/services/n8nService.js - Simplified for standard Webhook Trigger

/** @type {string | null} */
let authToken = null; // Keep for potential future auth needs
/** @type {Array<(data: any) => void>} */
let messageListeners = []; // To notify App.svelte about the response
/** @type {Array<(status: string) => void>} */
let statusListeners = []; // To notify App.svelte about the status

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/sadie'; // Revert to Production Webhook URL

/**
 * Internal function to update connection status and notify listeners.
 * @param {string} status - The new connection status.
 * @returns {void}
 */
const updateStatus = (status) => {
  // Find the correct statusListeners array - it needs to be defined at the top level
  const listeners = statusListeners; // Use the top-level variable
  listeners.forEach(listener => listener(status));
};


/**
 * Placeholder connection function. Sets status after a delay.
 * @param {any} url_ignored - URL is ignored as we use a fixed webhook.
 * @param {string | null} [token=null] - Auth token (likely unused).
 * @returns {Promise<void>}
 */
export const connectWebSocket = async (url_ignored, token = null) => {
  console.log("connectWebSocket called (simulating connection for standard Webhook).");
  authToken = token;
  // Use setTimeout to ensure App.svelte has mounted and registered its listener
  setTimeout(() => {
    updateStatus('connected'); // Now calls the function defined above
    console.log("Simulated connection status set to 'connected'.");
  }, 10); // Small delay (10ms)
  return Promise.resolve();
};

/**
 * Internal helper function to construct HTTP headers.
 * @returns {Record<string, string>} The headers object.
 */
const getHeaders = () => {
  /** @type {Record<string, string>} */
  const headers = {
    'Content-Type': 'application/json'
  };
  // Auth header logic remains commented out
  // if (authToken) { headers['Authorization'] = `Bearer ${authToken}`; }
  return headers;
};

/**
 * Internal handler for processing responses received from fetch.
 * @param {any} data - Parsed response data.
 * @returns {void}
 */
const handleMessage = (data) => {
  console.log("Handling received message/response:", data);
  messageListeners.forEach(listener => listener(data));
};


/**
 * Sends a message via POST to the standard n8n Webhook node and handles the direct response.
 * @param {string} toolName - Expected to be 'chat'. Other tools aren't directly callable this way.
 * @param {Record<string, any>} [params={}] - Expects { message: '...' }.
 * @returns {Promise<any>} A promise resolving with the JSON response from the 'Respond to Webhook' node.
 */
export const callTool = async (toolName, params = {}) => {
  // No isConnected check needed as connection is simulated

  if (toolName !== 'chat') {
     console.error(`Attempted to call unsupported tool '${toolName}' via standard Webhook.`);
     throw new Error(`Tool '${toolName}' cannot be called via standard Webhook in this setup.`);
  }

  try {
    // Simple JSON payload { "message": "..." }
    const requestBodyJson = {
      // @ts-ignore - Assume params has message property
      message: params.message
    };

    const requestBody = JSON.stringify(requestBodyJson);
    const requestHeaders = { ...getHeaders(), 'Content-Type': 'application/json' };

    console.log(`Sending POST to ${N8N_WEBHOOK_URL}:`, requestBodyJson);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: requestHeaders,
      body: requestBody
    });

    console.log(`Response status from ${N8N_WEBHOOK_URL}:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error POSTing to ${N8N_WEBHOOK_URL}! status: ${response.status}, message: ${errorText}`);
      handleMessage({ type: 'error', error: `HTTP ${response.status}: ${errorText}` });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`Received response from ${N8N_WEBHOOK_URL}:`, responseData);
    handleMessage(responseData); // Pass response to listeners
    return responseData;

  } catch (error) {
    console.error(`Error in callTool for '${toolName}':`, error);
    // @ts-ignore - error is unknown type
    handleMessage({ type: 'error', error: error?.message || 'Unknown error during callTool' });
    throw error;
  }
};

/**
 * Sends a chat message to the n8n workflow via the Webhook node.
 * @param {string} message - The message content.
 * @returns {Promise<any>}
 */
export const sendMessage = async (message) => {
  return callTool('chat', { message });
};

// --- Listener registration ---

/**
 * Registers a callback for incoming messages/responses.
 * @param {(data: any) => void} callback - The callback function.
 * @returns {void}
 */
export const onMessage = (callback) => {
  messageListeners.push(callback);
};

/**
 * Registers a callback for connection status updates.
 * @param {(status: string) => void} callback - The callback function.
 * @returns {void}
 */
export const onStatusUpdate = (callback) => {
   statusListeners.push(callback); // Register listener
   // console.warn("onStatusUpdate called, but status is only simulated in standard Webhook setup.");
};


// --- Simplified/Removed Functions ---

export const disconnect = () => {
  console.log("Disconnect called (no-op for standard Webhook).");
  // Optionally update status if needed by UI
  // updateStatus('disconnected');
};

// Export relevant functions for the UI
export default {
  connectWebSocket,
  sendMessage,
  disconnect,
  onMessage,
  onStatusUpdate // Export so App.svelte can register its listener
};