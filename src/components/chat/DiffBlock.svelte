<script>
  import { onMount } from 'svelte';
  
  // Props
  export let diff = '';
  export let filename = null;
  export let sender = '';
  
  let diffContainer;
  
  onMount(() => {
    if (diffContainer) {
      // Apply syntax highlighting for diffs
      // You can use a library like highlight.js or create a custom solution
      highlightDiff(diffContainer);
    }
  });
  
  // Helper function to highlight diff content
  function highlightDiff(container) {
    const lines = diff.split('\n');
    let html = '';
    
    lines.forEach(line => {
      if (line.startsWith('+')) {
        html += `<div class="diff-line diff-addition">${escapeHtml(line)}</div>`;
      } else if (line.startsWith('-')) {
        html += `<div class="diff-line diff-deletion">${escapeHtml(line)}</div>`;
      } else if (line.startsWith('@@')) {
        html += `<div class="diff-line diff-info">${escapeHtml(line)}</div>`;
      } else {
        html += `<div class="diff-line">${escapeHtml(line)}</div>`;
      }
    });
    
    container.innerHTML = html;
  }
  
  // Helper function to escape HTML
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
</script>

<div class="diff-block {sender === 'user' ? 'user-message' : 'ai-message'}">
  <div class="header">
    {#if filename}
      <div class="filename">{filename}</div>
    {/if}
    <div class="sender">{sender}</div>
  </div>
  
  <div class="diff-content" bind:this={diffContainer}>
    <!-- Diff content will be inserted here -->
  </div>
  
  <div class="actions">
    <button class="apply-button">Apply Changes</button>
    <button class="copy-button">Copy Diff</button>
  </div>
</div>

<style>
  .diff-block {
    margin: 8px 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .user-message .header {
    background-color: #e5edff;
  }
  
  .ai-message .header {
    background-color: #f0f9ff;
  }
  
  .diff-content {
    padding: 12px;
    font-family: monospace;
    white-space: pre;
    overflow-x: auto;
    background-color: #ffffff;
  }
  
  .diff-line {
    padding: 2px 0;
  }
  
  .diff-addition {
    background-color: #e6ffec;
    color: #22863a;
  }
  
  .diff-deletion {
    background-color: #ffebe9;
    color: #cb2431;
  }
  
  .diff-info {
    color: #6a737d;
    background-color: #f1f8ff;
  }
  
  .actions {
    display: flex;
    justify-content: flex-end;
    padding: 8px 12px;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }
  
  button {
    margin-left: 8px;
    padding: 4px 12px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #d1d5db;
    background-color: #ffffff;
    cursor: pointer;
  }
  
  .apply-button {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
  
  button:hover {
    opacity: 0.9;
  }
</style>