<script>
  import { onMount, onDestroy } from 'svelte';
  import Message from './components/chat/Message.svelte';
  import FileTree from './components/chat/FileTree.svelte';
  import { chatStore } from './stores/chatStore';
  import { connectWebSocket, onMessage, onStatusUpdate } from './services/n8nService';
  
  // State management
  let messages = [];
  let inputValue = '';
  let chatContainer;
  let isTyping = false;
  let connectionStatus = 'disconnected';
  let sessionId;
  
  // Subscribe to the store
  const unsubscribe = chatStore.subscribe(state => {
    messages = state.messages;
    isTyping = state.isTyping;
    connectionStatus = state.connectionStatus;
    sessionId = state.sessionId;
  });
  
  // Handle special message types
  function handleSpecialMessageTypes(message) {
    if (message.type === 'file_tree') {
      return {
        component: FileTree,
        props: { 
          fileStructure: message.metadata?.fileStructure || {},
          currentPath: message.metadata?.currentPath || '~/',
          onFileSelect: (path) => {
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
  
  // Lifecycle hooks
  onMount(() => {
    // Add initial welcome message if needed
    if (messages.length === 0) {
      chatStore.addMessage({
        content: "# Welcome to Sadie UI!\n\nI'm Sadie, your AI companion. I can help you with coding, answer questions, and assist with various tasks.\n\nTry these examples to see different message types:\n- Type 'code' for a code example\n- Type 'terminal' for terminal output\n- Type 'files' to see file browser\n- Type anything else for a regular response",
        type: 'text',
        sender: 'ai'
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
  
  // WebSocket setup and handling
  function setupWebSocket() {
    chatStore.updateConnectionStatus('connecting');
    
    connectWebSocket(sessionId, {
      onConnect: () => {
        chatStore.updateConnectionStatus('connected');
      },
      onDisconnect: () => {
        chatStore.updateConnectionStatus('disconnected');
        setTimeout(setupWebSocket, 5000);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        chatStore.updateConnectionStatus('error');
      }
    });
  }
  
  // Message handling
  function handleIncomingMessage(message) {
    chatStore.addMessage(message);
    
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }
  
  function handleStatusUpdate(status) {
    if (status.typing) {
      chatStore.update(s => {
        s.isTyping = status.typing;
        return s;
      });
    }
  }
  
  async function handleSubmit() {
    if (!inputValue.trim()) return;
    
    const message = inputValue;
    inputValue = '';
    
    await chatStore.sendMessage(message);
    
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }
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
        {#if handleSpecialMessageTypes(message)}
          {@const specialMessage = handleSpecialMessageTypes(message)}
          <svelte:component this={specialMessage.component} {...specialMessage.props} />
        {:else}
          <Message {message} />
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

<style>
  .typing-indicator {
    @apply flex space-x-1 ml-2;
  }
  
  .typing-indicator span {
    @apply w-2 h-2 bg-gray-400 rounded-full;
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