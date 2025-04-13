<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Message from './components/chat/Message.svelte';
  import FileTree from './components/chat/FileTree.svelte';
  import { chatStore, type ChatMessage } from './stores/chatStore'; // Remove .ts extension
  import { connectWebSocket, onMessage, onStatusUpdate } from './services/n8nService'; // Remove .ts extension
  import type { SvelteComponent } from 'svelte'; // Import SvelteComponent type

  // Remove local definition, use imported ChatMessage

  // Define a type for the special message handler result
  interface SpecialMessageConfig {
    component: typeof FileTree | typeof Message; // Be more specific or use typeof SvelteComponent
    props: Record<string, any>;
  }
  
  // State management
  let messages: ChatMessage[] = [];
  let inputValue: string = '';
  let chatContainer: HTMLElement | null = null; // Can be null initially
  let isTyping: boolean = false;
  let connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  let sessionId: string | null = null; // Session ID might be null initially
  
  // Subscribe to the store
  const unsubscribe = chatStore.subscribe((state: any) => { // Use 'any' for now, refine store later if needed
    messages = state.messages;
    isTyping = state.isTyping;
    connectionStatus = state.connectionStatus as 'disconnected' | 'connecting' | 'connected' | 'error'; // Cast type
    sessionId = state.sessionId;
  });
  
  // --- Function Definitions ---

  // Handle special message types
  function handleSpecialMessageTypes(message: ChatMessage): SpecialMessageConfig | null {
    if (message.type === 'file_tree') {
     return {
       component: FileTree, // Use the component directly
       props: {
         fileStructure: message.metadata?.fileStructure || {},
          currentPath: message.metadata?.currentPath || '~/',
          onFileSelect: (path: string) => { // Add type for path
            console.log('File selected:', path);
            chatStore.sendMessage(`Show me the contents of ${path}`);
          },
          onRefresh: () => {
            console.log('Refresh requested');
            chatStore.sendMessage('Refresh my file list');
          }
        }
      };
    }
    return null; // Use default message rendering
  }

  // WebSocket setup and handling
  function setupWebSocket() {
    chatStore.updateConnectionStatus('connecting'); // Use exported function
    
    // Ensure sessionId is a string before connecting
    if (typeof sessionId === 'string') {
      const callbacks = {
          onConnect: () => {
            chatStore.updateConnectionStatus('connected'); // Use exported function
          },
          onDisconnect: () => {
            chatStore.updateConnectionStatus('disconnected'); // Use exported function
            // Optional: Add retry logic with backoff
            // setTimeout(setupWebSocket, 5000);
          },
          onError: (error: Event) => { // Add type for error
            console.error('WebSocket error:', error);
            chatStore.updateConnectionStatus('error'); // Use exported function
          }
      };
      connectWebSocket(sessionId, callbacks); // Pass callbacks object
    } else {
      console.error("Session ID is not set, cannot connect WebSocket.");
      chatStore.updateConnectionStatus('error'); // Use exported function
    }
  }
  
  // Message handling
  function handleIncomingMessage(message: any) { // Use 'any' for now, or import IncomingMessage if needed
    chatStore.addMessage(message); // Use exported function
    
    // Use requestAnimationFrame for smoother scrolling after DOM update
    requestAnimationFrame(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }); // Removed extra ', 0' argument
  }

  function handleStatusUpdate(status: { typing?: boolean }) { // Add type for status
    // Use the specific update function from the store
    if (status.typing !== undefined) {
        chatStore.updateTypingStatus(status.typing); // Use the exported function
    }
  }

  async function handleSubmit() {
    if (!inputValue.trim()) return;
    
    const message = inputValue;
    inputValue = '';
    
    await chatStore.sendMessage(message);
    
    // Use requestAnimationFrame for smoother scrolling after DOM update
    requestAnimationFrame(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }); // Removed extra ', 0' argument
  }

  // --- Lifecycle hooks ---
  onMount(() => {
    // Add initial welcome message if needed
    if (messages.length === 0) {
      // Use chatStore.addMessage with the correct structure (needs content, type, sender)
      chatStore.addMessage({
        content: "# Welcome to Sadie UI!\n\nI'm Sadie, your AI companion. I can help you with coding, answer questions, and assist with various tasks.\n\nTry these examples to see different message types:\n- Type 'code' for a code example\n- Type 'terminal' for terminal output\n- Type 'files' to see file browser\n- Type anything else for a regular response",
        type: 'text', // Optional, defaults in store
        sender: 'ai'  // Optional, defaults in store
      });
    }
    
    // Set up connections and handlers
    setupWebSocket();
    onMessage(handleIncomingMessage);
    onStatusUpdate(handleStatusUpdate);
  });
  
  onDestroy(() => {
    unsubscribe();
  });
</script>

<main class="min-h-screen flex flex-col bg-gray-50">
  <!-- Header with connection status -->
  <header class="bg-blue-600 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold">Sadie UI</h1>
      <div class="flex items-center space-x-2">
        <span class="text-sm">
          {#if connectionStatus === 'connected'}
            Connected to n8n
          {:else if connectionStatus === 'connecting'}
            Connecting to n8n...
          {:else if connectionStatus === 'error'}
            Connection error
          {:else}
            Disconnected
          {/if}
        </span>
        <div class="w-3 h-3 rounded-full 
          {connectionStatus === 'connected' ? 'bg-green-400' : 
           connectionStatus === 'connecting' ? 'bg-yellow-400' : 
           connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}">
        </div>
      </div>
    </div>
  </header>
  
  <!-- Main chat area -->
  <div class="flex-1 container mx-auto max-w-4xl flex flex-col p-4">
    <div class="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200" bind:this={chatContainer}>
      {#each messages as message (message.id)}
        {@const specialMessage = handleSpecialMessageTypes(message)}
        {#if specialMessage && specialMessage.component === FileTree}
          <svelte:component this={specialMessage.component} {...specialMessage.props} />
        {:else}
          {@const messageProps = {
            ...message,
            timestamp: message.timestamp ?? new Date(),
            metadata: message.metadata ?? {} // Ensure metadata is always an object
          }}
          <Message message={messageProps} />
        {/if}
      {/each}
      
      {#if isTyping}
        <div class="flex items-center ml-10 mt-2">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Message input -->
    <div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
        <input 
          type="text" 
          bind:value={inputValue} 
          placeholder="Type a message..." 
          class="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={isTyping}
        />
        <button 
          type="submit" 
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          disabled={isTyping || !inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  </div>
</main>

<style lang="postcss"> /* Add lang="postcss" for Tailwind */
  .typing-indicator {
    /* @apply flex space-x-1 ml-2; */
    display: flex;
    margin-left: 0.5rem; /* ml-2 */
  }
  .typing-indicator span + span {
     margin-left: 0.25rem; /* space-x-1 */
  }
  /* Removed extra closing brace */
  
  .typing-indicator span {
    /* @apply w-2 h-2 bg-gray-400 rounded-full; */
    width: 0.5rem; /* w-2 */
    height: 0.5rem; /* h-2 */
    background-color: #9ca3af; /* bg-gray-400 */
    border-radius: 9999px; /* rounded-full */
    animation: typing-animation 1.4s infinite ease-in-out both;
  }
  
  .typing-indicator span:nth-child(1) {
    animation-delay: 0s;
  }
  
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing-animation {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
</style>