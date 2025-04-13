<script>
  import { onMount } from 'svelte';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/atom-one-dark.css';

  // Props
  export let code = '';
  export let language = 'plaintext';
  export let filename = null;
  export let showLineNumbers = true;

  let highlighted = '';
  let copyButtonText = 'Copy';

  onMount(() => {
    highlightCode();
  });

  $: if (code && language) {
    highlightCode();
  }

  function highlightCode() {
    try {
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(code, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(code).value;
      }
    } catch (e) {
      console.error('Failed to highlight', e);
      highlighted = code;
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(code)
      .then(() => {
        copyButtonText = 'Copied!';
        setTimeout(() => {
          copyButtonText = 'Copy';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy', err);
        copyButtonText = 'Failed!';
      });
  }

  function addLineNumbers(html) {
    if (!showLineNumbers) return html;
    
    const lines = html.split('\n');
    let numberedLines = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (i === lines.length - 1 && !lines[i]) continue;
      numberedLines += `<tr>
        <td class="line-number">${i + 1}</td>
        <td class="line-content">${lines[i] || ' '}</td>
      </tr>`;
    }
    
    return `<table class="code-table"><tbody>${numberedLines}</tbody></table>`;
  }
</script>

<div class="code-block">
  <div class="code-header">
    {#if filename}
      <span class="filename">{filename}</span>
    {:else}
      <span class="language">{language}</span>
    {/if}
    
    <button class="copy-button" on:click={copyToClipboard}>
      {copyButtonText}
    </button>
  </div>
  
  <div class="code-content">
    {#if showLineNumbers}
      <div class="line-numbered-code">
        {@html addLineNumbers(highlighted)}
      </div>
    {:else}
      <pre><code class="hljs">{@html highlighted}</code></pre>
    {/if}
  </div>
</div>

<style>
  .code-block {
    @apply rounded-md overflow-hidden border border-gray-300 mb-4 w-full;
  }
  
  .code-header {
    @apply flex justify-between items-center bg-gray-800 text-gray-200 p-2 text-sm;
  }
  
  .filename, .language {
    @apply font-mono;
  }
  
  .copy-button {
    @apply bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs;
  }
  
  .code-content {
    @apply overflow-x-auto;
  }
  
  .line-numbered-code {
    @apply font-mono text-sm;
  }
  
  :global(.code-table) {
    @apply w-full;
  }
  
  :global(.line-number) {
    @apply text-gray-500 text-right pr-4 pl-2 select-none border-r border-gray-700 bg-gray-900 w-[1%] whitespace-nowrap;
  }
  
  :global(.line-content) {
    @apply pl-4 whitespace-pre;
  }
</style>