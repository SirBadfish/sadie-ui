<script>
  import MarkdownRenderer from './MarkdownRenderer.svelte';
  import CodeBlock from './CodeBlock.svelte';
  import TerminalBlock from './TerminalBlock.svelte';
  import FileTree from './FileTree.svelte';

  // Props
  export let message = {
    id: '',
    content: '',
    type: 'text', // text, code, system, terminal, file_tree
    sender: 'ai', // user or ai
    timestamp: new Date(),
    metadata: {} // Additional data based on message type
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle file selection from file tree
  function handleFileSelect(event) {
    const path = event.detail.path;
    console.log('File selected:', path);
    // In the future, this could trigger a file fetch action
  }

  // Add special handling for AI Transform code results
  function renderCodeFromAITransform(code, language) {
    // Enhanced code visualization for AI Transform results
    return {
      highlighted: processCodeForDisplay(code, language),
      copyable: true,
      showLineNumbers: true
    };
  }
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
          language={message.metadata.language || 'plaintext'} 
          filename={message.metadata.filename || null}
        />
      {:else if message.type === 'system'}
        <div class="system-message">
          <div class="icon">ℹ️</div>
          <div>{message.content}</div>
        </div>
      {:else if message.type === 'terminal'}
        <TerminalBlock
          command={message.metadata.command || ''}
          output={message.content}
          isRunning={message.metadata.isRunning || false}
          exitCode={message.metadata.exitCode !== undefined ? message.metadata.exitCode : null}
        />
      {:else if message.type === 'file_tree'}
        <FileTree
          fileStructure={message.metadata.fileStructure || {}}
          currentPath={message.metadata.currentPath || '~/'}
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
            language={message.metadata.language || 'javascript'}
            showLineNumbers={true}
          />
        </div>
      {/if}
      
      <div class="timestamp">{formatTime(message.timestamp)}</div>
    </div>
  </div>
</div>

<style>
  .message {
    @apply mb-4 px-2;
  }
  
  .message-content {
    @apply flex items-start;
  }
  
  .message-user {
    @apply flex justify-end;
  }
  
  .message-ai {
    @apply flex justify-start;
  }
  
  .avatar {
    @apply w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 flex-shrink-0;
  }
  
  .text {
    @apply bg-white p-3 rounded-md shadow-sm max-w-[80%] border border-gray-200;
  }
  
  .message-user .text {
    @apply bg-blue-50 border-blue-200;
  }
  
  .timestamp {
    @apply text-xs text-gray-500 mt-1 text-right;
  }
  
  .system-message {
    @apply flex items-center bg-gray-100 p-2 rounded;
  }
  
  .system-message .icon {
    @apply mr-2;
  }
</style>