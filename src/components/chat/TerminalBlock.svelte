<script>
  export let command = '';
  export let output = '';
  export let isRunning = false;
  export let exitCode = null;
  
  let outputElement;
  
  $: if (output && outputElement) {
    // Auto-scroll to bottom as output updates
    setTimeout(() => {
      outputElement.scrollTop = outputElement.scrollHeight;
    }, 0);
  }
</script>

<div class="terminal-block">
  {#if command}
    <div class="terminal-command">
      <span class="prompt">$</span>
      <span class="command-text">{command}</span>
      
      {#if isRunning}
        <span class="status running">Running...</span>
      {:else if exitCode !== null}
        <span class="status {exitCode === 0 ? 'success' : 'error'}">
          {exitCode === 0 ? 'Success' : `Error (${exitCode})`}
        </span>
      {/if}
    </div>
  {/if}
  
  {#if output}
    <div class="terminal-output" bind:this={outputElement}>
      {#if isRunning}
        <div class="terminal-live-indicator" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      {/if}
      
      <pre>{output}</pre>
    </div>
  {/if}
</div>

<style>
  .terminal-block {
    @apply rounded-md overflow-hidden border border-gray-300 mb-4 w-full;
  }
  
  .terminal-command {
    @apply bg-gray-800 text-white p-2 font-mono text-sm flex items-center;
  }
  
  .prompt {
    @apply text-green-400 mr-2;
  }
  
  .command-text {
    @apply flex-1;
  }
  
  .status {
    @apply text-xs px-2 py-1 rounded ml-2;
  }
  
  .status.running {
    @apply bg-blue-600 text-white;
  }
  
  .status.success {
    @apply bg-green-600 text-white;
  }
  
  .status.error {
    @apply bg-red-600 text-white;
  }
  
  .terminal-output {
    @apply bg-black text-green-400 p-4 font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto;
  }
  
  .terminal-live-indicator {
    @apply flex gap-1 mb-2;
  }
  
  .terminal-live-indicator span {
    @apply w-2 h-2 rounded-full bg-green-400 opacity-75;
    animation: pulse 1.5s infinite ease-in-out both;
  }
  
  .terminal-live-indicator span:nth-child(1) { animation-delay: 0s; }
  .terminal-live-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .terminal-live-indicator span:nth-child(3) { animation-delay: 0.4s; }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
</style>