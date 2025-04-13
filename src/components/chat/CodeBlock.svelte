<script lang="ts">
  import { onMount } from 'svelte';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/atom-one-dark.css';

  // Props
  export let code: string = '';
  export let language: string = 'plaintext';
  export let filename: string | null = null; // Allow null
  export let showLineNumbers: boolean = true;

  let highlighted: string = '';
  let copyButtonText: string = 'Copy';

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

  function addLineNumbers(html: string): string { // Add types
    if (!showLineNumbers) return html;
    
    const lines: string[] = html.split('\n');
    let numberedLines: string = '';
    
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

<style lang="postcss"> /* Add lang="postcss" */
  .code-block {
    /* @apply rounded-md overflow-hidden border border-gray-300 mb-4 w-full; */
    border-radius: 0.375rem; /* rounded-md */
    overflow: hidden;
    border-width: 1px;
    border-color: #d1d5db; /* border-gray-300 */
    margin-bottom: 1rem; /* mb-4 */
    width: 100%;
  }
  
  .code-header {
    /* @apply flex justify-between items-center bg-gray-800 text-gray-200 p-2 text-sm; */
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1f2937; /* bg-gray-800 */
    color: #e5e7eb; /* text-gray-200 */
    padding: 0.5rem; /* p-2 */
    font-size: 0.875rem; /* text-sm */
    line-height: 1.25rem;
  }
  
  .filename, .language {
    /* @apply font-mono; */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }
  
  .copy-button {
    /* @apply bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs; */
    background-color: #374151; /* bg-gray-700 */
    padding-left: 0.5rem; /* px-2 */
    padding-right: 0.5rem;
    padding-top: 0.25rem; /* py-1 */
    padding-bottom: 0.25rem;
    border-radius: 0.25rem; /* rounded */
    font-size: 0.75rem; /* text-xs */
    line-height: 1rem;
  }
  .copy-button:hover {
    background-color: #4b5563; /* hover:bg-gray-600 */
  }
  
  .code-content {
    /* @apply overflow-x-auto; */
    overflow-x: auto;
  }
  
  .line-numbered-code {
    /* @apply font-mono text-sm; */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.875rem; /* text-sm */
    line-height: 1.25rem;
  }
  
  :global(.code-table) {
    /* @apply w-full; */
    width: 100%;
  }
  
  :global(.line-number) {
    /* @apply text-gray-500 text-right pr-4 pl-2 select-none border-r border-gray-700 bg-gray-900 w-[1%] whitespace-nowrap; */
    color: #6b7280; /* text-gray-500 */
    text-align: right;
    padding-right: 1rem; /* pr-4 */
    padding-left: 0.5rem; /* pl-2 */
    user-select: none;
    border-right-width: 1px;
    border-color: #374151; /* border-gray-700 */
    background-color: #111827; /* bg-gray-900 */
    width: 1%; /* w-[1%] */
    white-space: nowrap;
  }
  
  :global(.line-content) {
    /* @apply pl-4 whitespace-pre; */
    padding-left: 1rem; /* pl-4 */
    white-space: pre;
  }
</style>