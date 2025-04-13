<script lang="ts">
  import MarkdownRenderer from './MarkdownRenderer.svelte';
  import CodeBlock from './CodeBlock.svelte';
  import TerminalBlock from './TerminalBlock.svelte';
  import FileTree from './FileTree.svelte';
  import type { ChatMessage } from '../../stores/chatStore'; // Correct relative path

  // Props
  export let message: ChatMessage; // Use the imported type

  // Define the type for the event detail in handleFileSelect
  interface FileSelectEventDetail {
    path: string;
  }

  // Define copyToClipboard function
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      // Maybe dispatch an event or update local state for feedback?
      console.log('Copied to clipboard');
      // We could add temporary button text change here if needed
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  // Format time for display
  const formatTime = (date: Date): string => { // Add types
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle file selection from file tree
  function handleFileSelect(event: CustomEvent<FileSelectEventDetail>) { // Type the event
    const path = event.detail.path;
    console.log('File selected:', path);
    // In the future, this could trigger a file fetch action
  }

  // Removed renderCodeFromAITransform and processCodeForDisplay as they are not defined/used elsewhere
</script>

<div class="message {message.sender === 'user' ? 'message-user' : 'message-ai'}">
  <div class="message-content">
    {#if message.sender === 'ai'}
      <div class="avatar">S</div>
    {/if}
    
    <div class="text">
      {#if message.type === 'text'}
        <div class="message-text">
          <MarkdownRenderer content={message.content} />
        </div>
      {:else if message.type === 'code'}
        <CodeBlock 
          code={message.content}
          language={message.metadata?.language || 'plaintext'}
          filename={message.metadata?.filename || null}
        />
      {:else if message.type === 'system'}
        <div class="system-message">
          <div class="icon">ℹ️</div>
          <div>{message.content}</div>
        </div>
      {:else if message.type === 'terminal'}
        <TerminalBlock
          command={message.metadata?.command || ''}
          output={message.content}
          isRunning={message.metadata?.isRunning || false}
          exitCode={message.metadata?.exitCode !== undefined ? message.metadata.exitCode : null}
        />
      {:else if message.type === 'file_tree'}
        <FileTree
          fileStructure={message.metadata?.fileStructure || {}}
          currentPath={message.metadata?.currentPath || '~/'}
          on:select={handleFileSelect}
          on:refresh={() => console.log('Refresh requested')}
        />
      {/if}

      {#if message.metadata?.source === 'ai_transform'}
        
        <div class="code-from-ai-transform">
          <div class="code-header">
            <span>AI Generated Code</span>
            <button on:click={() => copyToClipboard(message.content)}>Copy</button>
          </div>
          <CodeBlock
            code={message.content}
            language={message.metadata?.language || 'javascript'}
            showLineNumbers={true}
          />
        </div>
      {/if}
      
      <div class="timestamp">{formatTime(message.timestamp)}</div>
    </div>
  </div>
</div>

<style lang="postcss"> /* Add lang="postcss" */
  .message {
    /* @apply mb-4 px-2; */
    margin-bottom: 1rem; /* mb-4 */
    padding-left: 0.5rem; /* px-2 */
    padding-right: 0.5rem;
  }
  
  .message-content {
    /* @apply flex items-start; */
    display: flex;
    align-items: flex-start;
  }
  
  .message-user {
    /* @apply flex justify-end; */
    display: flex;
    justify-content: flex-end;
  }
  
  .message-ai {
    /* @apply flex justify-start; */
    display: flex;
    justify-content: flex-start;
  }
  
  .avatar {
    /* @apply w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 flex-shrink-0; */
    width: 2rem; /* w-8 */
    height: 2rem; /* h-8 */
    border-radius: 9999px; /* rounded-full */
    background-color: #2563eb; /* bg-blue-600 */
    color: #ffffff; /* text-white */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.5rem; /* mr-2 */
    flex-shrink: 0;
  }
  
  .text {
    /* @apply bg-white p-3 rounded-md shadow-sm max-w-[80%] border border-gray-200; */
    background-color: #ffffff; /* bg-white */
    padding: 0.75rem; /* p-3 */
    border-radius: 0.375rem; /* rounded-md */
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); /* shadow-sm */
     --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
     --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
     box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
    max-width: 80%;
    border-width: 1px;
    border-color: #e5e7eb; /* border-gray-200 */
  }
  
  .message-user .text {
    /* @apply bg-blue-50 border-blue-200; */
    background-color: #eff6ff; /* bg-blue-50 */
    border-color: #bfdbfe; /* border-blue-200 */
  }
  
  .timestamp {
    /* @apply text-xs text-gray-500 mt-1 text-right; */
    font-size: 0.75rem; /* text-xs */
    line-height: 1rem;
    color: #6b7280; /* text-gray-500 */
    margin-top: 0.25rem; /* mt-1 */
    text-align: right;
  }
  
  .system-message {
    /* @apply flex items-center bg-gray-100 p-2 rounded; */
    display: flex;
    align-items: center;
    background-color: #f3f4f6; /* bg-gray-100 */
    padding: 0.5rem; /* p-2 */
    border-radius: 0.25rem; /* rounded */
  }
  
  .system-message .icon {
    /* @apply mr-2; */
    margin-right: 0.5rem; /* mr-2 */
  }
</style>