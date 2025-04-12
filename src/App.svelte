<script>
  import { onMount } from 'svelte';
  import Message from './components/chat/Message.svelte';
  
  let messages = [];
  let inputValue = '';
  let chatContainer;
  
  onMount(() => {
    // Add a welcome message
    messages = [
      {
        text: 'Hello! I\'m Sadie. How can I help you today?',
        sender: 'ai',
        timestamp: new Date()
      }
    ];
  });
  
  function handleSubmit() {
    if (!inputValue.trim()) return;
    
    // Add user message
    messages = [...messages, {
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }];
    
    // Clear input
    const userInput = inputValue;
    inputValue = '';
    
    // Simulate AI response (this will connect to n8n later)
    setTimeout(() => {
      messages = [...messages, {
        text: `You said: "${userInput}" - I'll be connecting to n8n soon to give real responses!`,
        sender: 'ai',
        timestamp: new Date()
      }];
      
      // Scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
  }
</script>

<main class="container mx-auto max-w-4xl h-screen flex flex-col">
  <header class="bg-blue-600 text-white p-4">
    <h1 class="text-xl font-bold">Sadie UI</h1>
  </header>
  
  <div class="flex-1 overflow-y-auto p-4" bind:this={chatContainer}>
    {#each messages as message}
      <Message 
        message={message.text} 
        sender={message.sender} 
        timestamp={message.timestamp} 
      />
    {/each}
  </div>
  
  <footer class="p-4 border-t">
    <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
      <input 
        type="text" 
        bind:value={inputValue} 
        placeholder="Type a message..." 
        class="flex-1 p-2 border rounded"
      />
      <button 
        type="submit" 
        class="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </form>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>