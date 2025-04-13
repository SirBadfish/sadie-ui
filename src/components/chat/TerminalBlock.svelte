<script lang="ts">
  export let command: string = '';
  export let output: string = '';
  export let isRunning: boolean = false;
  export let exitCode: number | null = null; // Can be number or null
  
  let outputElement: HTMLElement | null = null; // Type the element, can be null initially
  
  $: if (output && outputElement) {
    // Auto-scroll to bottom as output updates
    // Use requestAnimationFrame for smoother scrolling after DOM update
    requestAnimationFrame(() => {
      if (outputElement) { // Check if element exists
        outputElement.scrollTop = outputElement.scrollHeight;
      }
    });
    // Removed setTimeout wrapper
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

<style lang="postcss"> /* Add lang="postcss" */
  .terminal-block {
    /* @apply rounded-md overflow-hidden border border-gray-300 mb-4 w-full; */
    border-radius: 0.375rem; /* rounded-md */
    overflow: hidden;
    border-width: 1px;
    border-color: #d1d5db; /* border-gray-300 */
    margin-bottom: 1rem; /* mb-4 */
    width: 100%;
  }
  
  .terminal-command {
    /* @apply bg-gray-800 text-white p-2 font-mono text-sm flex items-center; */
    background-color: #1f2937; /* bg-gray-800 */
    color: #ffffff; /* text-white */
    padding: 0.5rem; /* p-2 */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.875rem; /* text-sm */
    line-height: 1.25rem;
    display: flex;
    align-items: center;
  }
  
  .prompt {
    /* @apply text-green-400 mr-2; */
    color: #4ade80; /* text-green-400 */
    margin-right: 0.5rem; /* mr-2 */
  }
  
  .command-text {
    /* @apply flex-1; */
    flex: 1 1 0%;
  }
  
  .status {
    /* @apply text-xs px-2 py-1 rounded ml-2; */
    font-size: 0.75rem; /* text-xs */
    line-height: 1rem;
    padding-left: 0.5rem; /* px-2 */
    padding-right: 0.5rem;
    padding-top: 0.25rem; /* py-1 */
    padding-bottom: 0.25rem;
    border-radius: 0.25rem; /* rounded */
    margin-left: 0.5rem; /* ml-2 */
  }
  
  .status.running {
    /* @apply bg-blue-600 text-white; */
    background-color: #2563eb; /* bg-blue-600 */
    color: #ffffff; /* text-white */
  }
  
  .status.success {
    /* @apply bg-green-600 text-white; */
    background-color: #16a34a; /* bg-green-600 */
    color: #ffffff; /* text-white */
  }
  
  .status.error {
    /* @apply bg-red-600 text-white; */
    background-color: #dc2626; /* bg-red-600 */
    color: #ffffff; /* text-white */
  }
  
  .terminal-output {
    /* @apply bg-black text-green-400 p-4 font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto; */
    background-color: #000000; /* bg-black */
    color: #4ade80; /* text-green-400 */
    padding: 1rem; /* p-4 */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.875rem; /* text-sm */
    line-height: 1.25rem;
    overflow-x: auto;
    max-height: 16rem; /* max-h-64 */
    overflow-y: auto;
  }
  
  .terminal-live-indicator {
    /* @apply flex gap-1 mb-2; */
    display: flex;
    gap: 0.25rem; /* gap-1 */
    margin-bottom: 0.5rem; /* mb-2 */
  }
  
  .terminal-live-indicator span {
    /* @apply w-2 h-2 rounded-full bg-green-400 opacity-75; */
    width: 0.5rem; /* w-2 */
    height: 0.5rem; /* h-2 */
    border-radius: 9999px; /* rounded-full */
    background-color: #4ade80; /* bg-green-400 */
    opacity: 0.75;
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