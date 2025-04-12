<script>
  import { onMount } from 'svelte';
  import Message from './components/chat/Message.svelte';
  
  let messages = [];
  let inputValue = '';
  let chatContainer;
  let isTyping = false;
  
  onMount(() => {
    // Add a welcome message
    messages = [
      {
        id: '1',
        content: "# Welcome to Sadie UI!\n\nI'm Sadie, your AI companion. I can help you with coding, answer questions, and assist with various tasks.\n\nHow can I help you today?",
        type: 'text',
        sender: 'ai',
        timestamp: new Date(),
        metadata: {}
      }
    ];
  });
  
  function handleSubmit() {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'text',
      sender: 'user',
      timestamp: new Date(),
      metadata: {}
    };
    
    messages = [...messages, userMessage];
    
    // Clear input
    const userInput = inputValue;
    inputValue = '';
    
    // Show typing indicator
    isTyping = true;
    
    // Simulate AI response (this will connect to n8n later)
    setTimeout(() => {
      isTyping = false;
      
      // For demo purposes, let's create different response types based on user input
      let responseMessage;
      
      if (userInput.toLowerCase().includes('code') || userInput.toLowerCase().includes('example')) {
        responseMessage = {
          id: Date.now().toString(),
          content: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));`,
          type: 'code',
          sender: 'ai',
          timestamp: new Date(),
          metadata: { language: 'javascript' }
        };
      } else if (userInput.toLowerCase().includes('terminal') || userInput.toLowerCase().includes('command')) {
        responseMessage = {
          id: Date.now().toString(),
          content: 'Hello World!',
          type: 'terminal',
          sender: 'ai',
          timestamp: new Date(),
          metadata: { command: 'echo "Hello World!"' }
        };
      } else {
        responseMessage = {
          id: Date.now().toString(),
          content: `You said: "${userInput}"\n\nI'll be connecting to n8n soon to give real responses! For now, here are some things you can try:\n\n- Ask me for a code example\n- Mention "terminal" to see a terminal output example`,
          type: 'text',
          sender: 'ai',
          timestamp: new Date(),
          metadata: {}
        };
      }
      
      messages = [...messages, responseMessage];
      
      // Scroll to bottom
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 0);
    }, 1500);
  }
</script>

<main class="min-h-screen flex flex-col bg-gray-50">
  <header class="bg-blue-600 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold">Sadie UI</h1>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Connected to n8n</span>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
    </div>
  </header>
  
  <div class="flex-1 container mx-auto max-w-4xl flex flex-col p-4">
    <div class="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200" bind:this={chatContainer}>
      <!-- {#each messages as message (message.id)}
        <Message {message} />
      {/each} -->
      
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
    
    <div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
        <input 
          type="text" 
          bind:value={inputValue} 
          placeholder="Type a message..." 
          class="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button 
          type="submit" 
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</main>

<style>
  .typing-indicator {
    /* @apply flex ml-2; */ /* Temporarily commented out due to build error */
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