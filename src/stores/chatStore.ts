import { writable, get } from 'svelte/store'; // Import get
import { sendMessage as sendN8nMessage } from '../services/n8nService'; // Rename import

// --- Type definitions ---
export interface ChatMessage { // Export this interface
  id: string;
  content: string;
  type: string; // 'text', 'code', 'terminal', 'file_tree', 'system', etc.
  sender: 'user' | 'ai' | 'system';
  timestamp: Date; // Make timestamp required
  metadata: Record<string, any>; // Use Record for metadata object
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  sessionId: string;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface IncomingMessage {
    id?: string;
    content: string;
    type?: string;
    sender?: 'user' | 'ai' | 'system';
    timestamp?: string | Date; // Allow string or Date from source
    metadata?: Record<string, any>;
}

// --- Initial state ---
const initialState: ChatState = {
  messages: [],
  isTyping: false,
  connectionStatus: 'disconnected',
  sessionId: `session_${Date.now()}`
};

// --- Create the writable store ---
const { subscribe, set, update } = writable<ChatState>(initialState);

// --- Action Functions (defined outside the export) ---

// Internal function to add any message
function addMessageInternal(message: IncomingMessage): void {
  update(s => {
    const fullMessage: ChatMessage = {
      id: message.id || Date.now().toString(),
      content: message.content,
      type: message.type || 'text',
      sender: message.sender || 'ai',
      timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp || Date.now()),
      metadata: message.metadata || {}
    };
    // Prevent adding duplicate messages by ID if an ID is provided
    if (message.id && s.messages.some(m => m.id === message.id)) {
        return s;
    }
    return { ...s, messages: [...s.messages, fullMessage] };
  });
}

// Public function to add system messages
function addSystemMessage(content: string): void {
  addMessageInternal({ // Call the standalone addMessageInternal function
    content,
    type: 'system',
    sender: 'system'
    // No need for metadata: {} here, addMessageInternal handles defaults
  });
}

// Public function to send user messages
async function handleSendMessage(content: string): Promise<void> {
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    content,
    type: 'text',
    sender: 'user',
    timestamp: new Date(),
    metadata: {}
  };

  // Update store synchronously first
  update(s => ({
    ...s,
    messages: [...s.messages, userMessage],
    isTyping: true
  }));

  // Get current state AFTER update using get()
  const currentState = get({ subscribe }); // Pass the store object to get

  const messagePayload = { content, type: 'text', metadata: {} };
  // Ensure sessionId is available before creating context
  const context = { sessionId: currentState.sessionId };

  try {
    // Use the renamed import 'sendN8nMessage'
    const response = await sendN8nMessage(messagePayload, context);

    if (response && response.message) {
       if (typeof response.message === 'object' && response.message !== null && 'content' in response.message) {
           addMessageInternal(response.message as IncomingMessage); // Use internal add function
       } else if (typeof response.message === 'string') {
            addMessageInternal({ content: response.message }); // Use internal add function
       } else {
           console.warn("Received unexpected response format:", response);
           addSystemMessage('Received an unexpected response format.');
       }
    } else if (response) {
         console.warn("Received response without a 'message' field:", response);
         // addSystemMessage('Received a response, but could not extract message content.');
    }
  } catch (error: any) { // Type the error
    console.error('Error sending message:', error);
    addSystemMessage(`Error: Failed to get response. ${error.message || 'Please try again.'}`);
  } finally {
    // Use functional update to ensure we're working with the latest state
    update(s => ({ ...s, isTyping: false }));
  }
}

// Function to specifically update typing status
function updateTypingStatus(isTyping: boolean): void {
    update(s => ({ ...s, isTyping }));
}

// Removed duplicate function definition

function updateConnectionStatus(status: ConnectionStatus): void {
  update(s => ({ ...s, connectionStatus: status }));
}

function clearMessages(): void {
  update(s => ({ ...s, messages: [] }));
}

function reset(): void {
  set(initialState);
}

// --- Export the store interface ---
export const chatStore = {
  subscribe,
  sendMessage: handleSendMessage, // Export the refactored function
  addMessage: addMessageInternal, // Expose internal add function
  updateTypingStatus, // Export the new function
  addSystemMessage,
  updateConnectionStatus,
  clearMessages,
  reset
};