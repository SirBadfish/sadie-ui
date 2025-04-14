// src/stores/chatStore.js
import { writable } from 'svelte/store';

// Define the message type enum
export const MessageType = {
  TEXT: 'text',
  CODE: 'code',
  TERMINAL: 'terminal',
  FILE_TREE: 'file_tree',
  DIFF: 'diff',
  DIAGRAM: 'diagram',
  VOICE: 'voice',
  SYSTEM: 'system'
};

// Define the ChatMessage class
export class ChatMessage {
  type;
  content;
  sender;
  timestamp;
  id;
  metadata;

  constructor(type, content, sender, metadata = {}) {
    this.type = type;
    this.content = content;
    this.sender = sender;
    this.timestamp = new Date();
    this.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metadata = metadata;
  }
}

// Create the chat store with initial state
function createChatStore() {
  const { subscribe, update, set } = writable({
    messages: [],
    isTyping: false
  });

  return {
    subscribe,
    
    // Add a new message to the chat
    addMessage: (type, content, sender, metadata) => {
      const message = new ChatMessage(type, content, sender, metadata);
      update(store => {
        return {
          ...store, 
          messages: [...store.messages, message]
        };
      });
      return message;
    },
    
    // Update an existing message by ID
    updateMessage: (id, newContent) => {
      update(store => {
        const index = store.messages.findIndex(msg => msg.id === id);
        if (index !== -1) {
          const updatedMessages = [...store.messages];
          updatedMessages[index] = {
            ...updatedMessages[index],
            content: newContent
          };
          return { ...store, messages: updatedMessages };
        }
        return store;
      });
    },
    
    // Set the typing state
    setTyping: (isTyping) => {
      update(store => ({ ...store, isTyping }));
    },
    
    // Clear all messages
    clearMessages: () => {
      set({
        messages: [],
        isTyping: false
      });
    }
  };
}

export const chatStore = createChatStore();
