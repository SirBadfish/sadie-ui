<script>
  // Props
  export let fileStructure = {};
  export let currentPath = '~/';
  
  // State
  let expandedDirs = {};
  
  // Dispatch events for file/directory interactions
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function toggleDir(path) {
    expandedDirs[path] = !expandedDirs[path];
  }
  
  function selectFile(path) {
    dispatch('select', { path });
  }
  
  function getFileIcon(filename) {
    // Determine icon based on file extension
    const ext = filename.split('.').pop().toLowerCase();
    
    switch(ext) {
      case 'js': return '📄 '; // JavaScript
      case 'ts': return '📄 '; // TypeScript
      case 'html': return '📄 '; // HTML
      case 'css': return '📄 '; // CSS
      case 'json': return '📄 '; // JSON
      case 'md': return '📄 '; // Markdown
      case 'py': return '📄 '; // Python
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️ '; // Images
      default: return '📄 '; // Default file icon
    }
  }
</script>

<div class="file-tree">
  <div class="file-tree-header">
    <span class="current-path">{currentPath}</span>
    <button class="refresh-button" on:click={() => dispatch('refresh')}>
      🔄
    </button>
  </div>
  
  <div class="file-tree-content">
    {#each Object.entries(fileStructure) as [name, content]}
      {@const path = currentPath + name}
      
      {#if typeof content === 'object'}
        <!-- Directory -->
        <div class="directory">
          <div 
            class="dir-item" 
            on:click={() => toggleDir(path)}
          >
            <span class="dir-icon">{expandedDirs[path] ? '📂' : '📁'}</span>
            <span class="dir-name">{name}</span>
          </div>
          
          {#if expandedDirs[path]}
            <div class="dir-contents">
              {#each Object.entries(content) as [subName, subContent]}
                {@const subPath = path + '/' + subName}
                
                {#if typeof subContent === 'object'}
                  <!-- Subdirectory -->
                  <div class="directory sub-directory">
                    <div 
                      class="dir-item" 
                      on:click|stopPropagation={() => toggleDir(subPath)}
                    >
                      <span class="dir-icon">{expandedDirs[subPath] ? '📂' : '📁'}</span>
                      <span class="dir-name">{subName}</span>
                    </div>
                    
                    {#if expandedDirs[subPath]}
                      <!-- Recursively render subdirectories would go here -->
                    {/if}
                  </div>
                {:else}
                  <!-- File in subdirectory -->
                  <div 
                    class="file-item" 
                    on:click|stopPropagation={() => selectFile(subPath)}
                  >
                    <span class="file-icon">{getFileIcon(subName)}</span>
                    <span class="file-name">{subName}</span>
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <!-- File -->
        <div 
          class="file-item" 
          on:click={() => selectFile(path)}
        >
          <span class="file-icon">{getFileIcon(name)}</span>
          <span class="file-name">{name}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .file-tree {
    @apply border border-gray-300 rounded-md overflow-hidden w-full mb-4;
  }
  
  .file-tree-header {
    @apply bg-gray-800 text-white p-2 flex justify-between items-center text-sm;
  }
  
  .current-path {
    @apply font-mono;
  }
  
  .refresh-button {
    @apply text-xs bg-gray-700 hover:bg-gray-600 rounded px-2 py-1;
  }
  
  .file-tree-content {
    @apply p-2 bg-white;
  }
  
  .dir-item, .file-item {
    @apply flex items-center p-1 cursor-pointer text-sm rounded hover:bg-gray-100;
  }
  
  .dir-icon, .file-icon {
    @apply mr-1;
  }
  
  .dir-name {
    @apply font-medium;
  }
  
  .file-name {
    @apply text-gray-700;
  }
  
  .dir-contents {
    @apply pl-4 border-l border-gray-200 ml-2;
  }
  
  .sub-directory {
    @apply mt-1;
  }
</style>