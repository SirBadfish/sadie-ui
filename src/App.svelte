<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Message from './components/chat/Message.svelte';
  import FileTree from './components/chat/FileTree.svelte';
  import { chatStore, type ChatMessage } from './stores/chatStore';
  // Removed fileOperation, executeCommand as they are no longer exported/used directly
  import { connectWebSocket, onMessage, onStatusUpdate, sendMessage, disconnect } from './services/n8nService';
  import type { SvelteComponent } from 'svelte';
  import CodeBlock from './components/chat/CodeBlock.svelte';
  import TerminalBlock from './components/chat/TerminalBlock.svelte';
  import MarkdownRenderer from './components/chat/MarkdownRenderer.svelte';

  // Define a type for the special message handler result
  interface SpecialMessageConfig {
    component: typeof FileTree | typeof Message | typeof CodeBlock | typeof TerminalBlock | typeof MarkdownRenderer;
    props: Record<string, any>;
  }

  // State management
  let messages: ChatMessage[] = [];
  let inputValue: string = '';
  let chatContainer: HTMLElement | null = null;
  let connectionStatus: string = 'disconnected';
  let isSending: boolean = false;
  let isTyping: boolean = false;
  
  // n8n connection config
  const n8nConfig = {
    url: 'http://localhost:5678/webhook/sadie/sse', // Use the correct Chat Trigger SSE URL
    token: null
  };

  onMount(async () => {
    // Subscribe to the chat store
    const unsubscribe = chatStore.subscribe(state => {
      messages = state.messages;
      isTyping = state.isTyping;
      
      // Auto-scroll to bottom when messages change - with safe null check
      if (chatContainer) {
        setTimeout(() => {
          if (chatContainer) {  // Double-check to be safe
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 0);
      }
    });
    
    // Register message handler
    onMessage(handleIncomingMessage);
    
    // Register status handler
    onStatusUpdate(status => {
      connectionStatus = status;
      
      if (status === 'connected') {
        chatStore.addMessage('system', 'Connected to Sadie. How can I help you today?', 'system');
      } else if (status === 'disconnected' || status === 'error') {
        chatStore.addMessage('system', `Connection ${status}. Attempting to reconnect...`, 'system');
      }
    });
    
    // Connect to n8n
    try {
      await connectWebSocket(n8nConfig.url, n8nConfig.token);
    } catch (error) {
      console.error('Failed to connect to n8n:', error);
      chatStore.addMessage('system', 'Failed to connect to Sadie. Please try again later.', 'system');
    }
    
    return () => {
      unsubscribe();
    };
  });

  onDestroy(() => {
    // Disconnect from n8n
    if (connectionStatus === 'connected') {
      disconnect();
    }
  });

  /**
   * Handles incoming messages from n8n
   * @param {any} data - The message data
   */
  function handleIncomingMessage(data: any) {
    console.log("Handling incoming data:", data); // Log received data
    isSending = false; // Always turn off sending indicator when a response arrives

    // Check if it's the error format from n8nService
    if (data?.type === 'error' && data.error) {
       chatStore.addMessage('system', `Error: ${data.error}`, 'system');
    } 
    // Check if it's the direct object format { "output": "..." }
    else if (data?.output && typeof data.output === 'string') {
       chatStore.addMessage('text', data.output, 'ai'); 
    } 
    // Keep the check for the array format [{ "output": "..." }] just in case
    else if (Array.isArray(data) && data.length > 0 && data[0]?.output && typeof data[0].output === 'string') {
       console.warn("Received response as array, expected direct object. Handling anyway.");
       chatStore.addMessage('text', data[0].output, 'ai'); 
    }
    else {
      // Fallback for unexpected format
      console.warn("Received unexpected message format:", data);
      chatStore.addMessage('system', `Received unexpected data: ${JSON.stringify(data)}`, 'system'); 
    }
  }
  
  /**
   * Sends a message to n8n
   */
  async function handleSendMessage() {
    if (!inputValue.trim() || isSending) return;
    
    // Check connection status before sending
    // Note: With standard webhook, 'connected' status is simulated after a delay
    if (connectionStatus !== 'connected') { 
      chatStore.addMessage('system', 'Not connected to Sadie. Please wait for connection to be established.', 'system');
      return;
    }
    
    chatStore.addMessage('text', inputValue, 'user');
    isSending = true;
    
    // Clear the input field
    const messageText = inputValue;
    inputValue = '';
    
    try {
      // Send the message to n8n
      await sendMessage(messageText);
      // Note: Response is handled by handleIncomingMessage now, no need to process here
    } catch (error) {
      console.error('Error sending message:', error);
      // Error should have been added by callTool's catch block via handleMessage
      // chatStore.addMessage('system', 'Failed to send message. Please try again.', 'system'); 
      isSending = false; // Ensure sending indicator is turned off on error
    }
    // Removed isSending = false here; it's set in handleIncomingMessage now
  }
  
  // Removed runTerminalCommand and performFileOperation functions 
  // as the underlying service functions are no longer exported/supported in this setup.
  // Tool usage must now go through natural language requests to the AI Agent in n8n.
  
  /**
   * Handles key press events on the input field
   * @param {KeyboardEvent} event - The key event
   */
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }
  
  /**
   * Determines the appropriate component for each message type
   * @param {ChatMessage} message - The message object
   * @returns {SpecialMessageConfig} - The component config
   */
  function getMessageComponent(message: ChatMessage): SpecialMessageConfig {
    switch (message.type) {
      case 'text':
        return {
          component: Message,
          props: { message }
        };
      case 'code':
        return {
          component: CodeBlock,
          props: { 
            code: message.content,
            language: message.metadata?.language || 'javascript',
            filename: message.metadata?.filename,
            sender: message.sender
          }
        };
      case 'terminal':
        return {
          component: TerminalBlock,
          props: {
            output: message.content,
            command: message.metadata?.command || '',
            sender: message.sender
          }
        };
      case 'file_tree':
        return {
          component: FileTree,
          props: {
            // Assuming content is the structured data for FileTree
            fileStructure: typeof message.content === 'object' ? message.content : {}, 
            currentPath: message.metadata?.root || '/', // Use root for path
            sender: message.sender
          }
        };
      case 'system':
        return {
          component: Message,
          props: { 
            message,
            isSystem: true
          }
        };
      default:
         console.warn(`Unhandled message type: ${message.type}. Rendering as text.`);
        // Render unknown types as plain text message for now
        return {
          component: Message,
          props: { 
             message: new ChatMessage('text', `Unhandled type '${message.type}': ${message.content}`, message.sender)
           }
        };
    }
  }
</script>

<main class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
  <header class="bg-blue-600 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold">Sadie UI</h1>
      <div class="flex items-center space-x-2">
        <div class="relative inline-flex items-center">
          <span class="mr-2">Status:</span>
          <span class={`h-3 w-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></span>
          <span class="ml-1">{connectionStatus}</span>
        </div>
      </div>
    </div>
  </header>
  
  <div class="flex-1 overflow-hidden flex flex-col container mx-auto p-4">
    <div bind:this={chatContainer} class="flex-1 overflow-y-auto mb-4 space-y-4">
      {#each messages as message (message.id)}
        {@const componentConfig = getMessageComponent(message)}
        <svelte:component this={componentConfig.component} {...componentConfig.props} />
      {/each}
      
      {#if isSending}
        <div class="flex items-center text-gray-500 dark:text-gray-400">
          <span class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span class="ml-2">Sadie is typing...</span>
        </div>
      {/if}
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div class="flex">
        <textarea
          bind:value={inputValue}
          on:keydown={handleKeyPress}
          placeholder="Message Sadie..."
          class="flex-1 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows="3"
          disabled={isSending || connectionStatus !== 'connected'}
        ></textarea>
        <button
          on:click={handleSendMessage}
          class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!inputValue.trim() || isSending || connectionStatus !== 'connected'}
        >
          Send
        </button>
      </div>
    </div>
  </div>
</main>

<style>
  .typing-indicator {
    display: inline-flex;
    align-items: center;
  }
  
  .typing-indicator span {
    height: 8px;
    width: 8px;
    margin: 0 2px;
    background-color: currentColor;
    border-radius: 50%;
    display: inline-block;
    opacity: 0.4;
    animation: typing 1.4s infinite both;
  }
  
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing {
    0% {
      opacity: 0.4;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-4px);
    }
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }
  }
</style>