import { writable } from 'svelte/store';
import { sendMessage } from '../services/n8nService';

// Initial state
const initialState = {
  messages: [],
  isTyping: false,
  connectionStatus: 'disconnected', // 'connected', 'disconnected', 'connecting', 'error'
  sessionId: `session_${Date.now()}`
};

// Create the writable store
const store = writable(initialState);

// Helper functions
export const chatStore = {
  subscribe: store.subscribe,
  update: store.update,
  
  // Add a user message and send to n8n
  async sendMessage(content) {
    let state;
    store.update(s => {
      // Add user message to state
      const userMessage = {
        id: Date.now().toString(),
        content,
        type: 'text',
        sender: 'user',
        timestamp: new Date(),
        metadata: {}
      };
      s.messages = [...s.messages, userMessage];
      s.isTyping = true;
      state = s;
      return s;
    });
    
    try {
      // Send message to n8n
      const message = {
        content,
        type: 'text',
        metadata: {}
      };
      
      const context = {
        sessionId: state.sessionId,
        messageHistory: state.messages.slice(-10) // Send last 10 messages for context
      };
      
      const response = await sendMessage(message, context);
      
      // Add AI response
      if (response && response.message) {
        this.addMessage(response.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.addSystemMessage('Error: Failed to get response. Please try again.');
    } finally {
      store.update(s => {
        s.isTyping = false;
        return s;
      });
    }
  },
  
  // Add a message to the store
  addMessage(message) {
    store.update(s => {
      // Ensure message has all required fields
      const fullMessage = {
        id: message.id || Date.now().toString(),
        content: message.content || '',
        type: message.type || 'text',
        sender: message.sender || 'ai',
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
        metadata: message.metadata || {}
      };
      
      s.messages = [...s.messages, fullMessage];
      return s;
    });
  },
  
  // Add a system message
  addSystemMessage(content) {
    this.addMessage({
      content,
      type: 'system',
      sender: 'system',
      metadata: {}
    });
  },
  
  // Update connection status
  updateConnectionStatus(status) {
    store.update(s => {
      s.connectionStatus = status;
      return s;
    });
  },
  
  // Clear all messages
  clearMessages() {
    store.update(s => {
      s.messages = [];
      return s;
    });
  },
  
  // Reset to initial state
  reset() {
    store.set(initialState);
  }
};