<script lang="ts">
  // Define types
  interface FileStructure {
    [key: string]: FileStructure | string; // Can be nested objects or string placeholders for files
  }
  interface ExpandedDirs {
    [key: string]: boolean;
  }

  // Props
  export let fileStructure: FileStructure = {};
  export let currentPath: string = '~/';

  // State
  let expandedDirs: ExpandedDirs = {};

  // Dispatch events for file/directory interactions
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{select: {path: string}, refresh: void}>(); // Add event types

  function toggleDir(path: string): void {
    expandedDirs[path] = !expandedDirs[path]; // No type error now
  }

  function selectFile(path: string): void {
    dispatch('select', { path });
  }

  function getFileIcon(filename: string): string {
    // Determine icon based on file extension
    const ext = filename.split('.').pop()?.toLowerCase() || ''; // Handle potential undefined from pop()

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

      {#if typeof content === 'object' && content !== null}
        <!-- Directory -->
        <div class="directory">
          <button
            type="button"
            class="dir-item"
            on:click={() => toggleDir(path)}
            aria-expanded={expandedDirs[path] ? 'true' : 'false'}
          >
            <span class="dir-icon">{expandedDirs[path] ? '📂' : '📁'}</span>
            <span class="dir-name">{name}</span>
          </button>

          {#if expandedDirs[path]}
            <div class="dir-contents">
              {#each Object.entries(content) as [subName, subContent]}
                {@const subPath = path + '/' + subName}

                {#if typeof subContent === 'object' && subContent !== null}
                  <!-- Subdirectory -->
                  <div class="directory sub-directory">
                     <button
                       type="button"
                       class="dir-item"
                       on:click|stopPropagation={() => toggleDir(subPath)}
                       aria-expanded={expandedDirs[subPath] ? 'true' : 'false'}
                     >
                       <span class="dir-icon">{expandedDirs[subPath] ? '📂' : '📁'}</span>
                       <span class="dir-name">{subName}</span>
                     </button>

                     {#if expandedDirs[subPath]}
                       <!-- Recursively render subdirectories would go here -->
                       <!-- Potential future enhancement: <svelte:self fileStructure={subContent} currentPath={subPath + '/'} /> -->
                     {/if}
                  </div>
                {:else}
                  <!-- File in subdirectory -->
                   <button
                     type="button"
                     class="file-item"
                     on:click|stopPropagation={() => selectFile(subPath)}
                   >
                     <span class="file-icon">{getFileIcon(subName)}</span>
                     <span class="file-name">{subName}</span>
                   </button>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <!-- File -->
         <button
           type="button"
           class="file-item"
           on:click={() => selectFile(path)}
         >
           <span class="file-icon">{getFileIcon(name)}</span>
           <span class="file-name">{name}</span>
         </button>
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss"> /* Add lang="postcss" */
  .file-tree {
    /* Removed @apply comment */
    border-width: 1px;
    border-color: #d1d5db; /* border-gray-300 */
    border-radius: 0.375rem; /* rounded-md */
    overflow: hidden;
    width: 100%;
    margin-bottom: 1rem; /* mb-4 */
  }

  .file-tree-header {
    /* Removed @apply comment */
    background-color: #1f2937; /* bg-gray-800 */
    color: #ffffff; /* text-white */
    padding: 0.5rem; /* p-2 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem; /* text-sm */
    line-height: 1.25rem;
  }

  .current-path {
    /* Removed @apply comment */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .refresh-button {
    /* Removed @apply comment */
    font-size: 0.75rem; /* text-xs */
    line-height: 1rem;
    background-color: #374151; /* bg-gray-700 */
    border-radius: 0.25rem; /* rounded */
    padding-left: 0.5rem; /* px-2 */
    padding-right: 0.5rem;
    padding-top: 0.25rem; /* py-1 */
    padding-bottom: 0.25rem;
    color: white; /* Ensure text is visible */
    border: none; /* Remove default button border */
    cursor: pointer; /* Add pointer cursor */
  }
  .refresh-button:hover {
     background-color: #4b5563; /* hover:bg-gray-600 */
  }

  .file-tree-content {
    /* Removed @apply comment */
    padding: 0.5rem; /* p-2 */
    background-color: #ffffff; /* bg-white */
  }

  .dir-item, .file-item {
    /* Removed @apply comment */
    /* Base styles for button */
    display: flex;
    align-items: center;
    padding: 0.25rem; /* p-1 */
    cursor: pointer;
    font-size: 0.875rem; /* text-sm */
    line-height: 1.25rem;
    border-radius: 0.25rem; /* rounded */
    /* Ensure button takes full width and text aligns left */
    width: 100%;
    text-align: left;
    /* Remove default button appearance */
    background: none;
    border: none;
    color: inherit;
  }
  .dir-item:hover, .file-item:hover {
     background-color: #f3f4f6; /* hover:bg-gray-100 */
  }

  .dir-icon, .file-icon {
    /* Removed @apply comment */
    margin-right: 0.25rem; /* mr-1 */
  }

  .dir-name {
    /* Removed @apply comment */
    font-weight: 500;
  }

  .file-name {
    /* Removed @apply comment */
    color: #374151; /* text-gray-700 */
  }

  .dir-contents {
    /* Removed @apply comment */
    padding-left: 1rem; /* pl-4 */
    border-left-width: 1px;
    border-color: #e5e7eb; /* border-gray-200 */
    margin-left: 0.5rem; /* ml-2 */
  }

  .sub-directory {
    /* Removed @apply comment */
    margin-top: 0.25rem; /* mt-1 */
  }
</style>