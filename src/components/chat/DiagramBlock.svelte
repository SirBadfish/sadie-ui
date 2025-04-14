<!-- src/components/chat/DiagramBlock.svelte -->
<script>
  import { onMount } from 'svelte';
  
  // Props
  export let content = '';
  export let type = 'mermaid';
  export let sender = '';
  
  let diagramContainer;
  
  onMount(() => {
    if (diagramContainer) {
      renderDiagram();
    }
  });
  
  // Render the diagram based on type
  async function renderDiagram() {
    if (type === 'mermaid') {
      // Dynamically import mermaid.js
      const mermaid = await import('mermaid');
      mermaid.default.initialize({
        startOnLoad: true,
        theme: 'default'
      });
      
      // Generate unique ID for this diagram
      const id = `diagram-${Math.random().toString(36).substring(2, 9)}`;
      diagramContainer.innerHTML = `<div class="mermaid" id="${id}">${content}</div>`;
      
      // Render the diagram
      mermaid.default.run();
    } else if (type === 'plantuml') {
      // For PlantUML, you might use a service like PlantUML server
      const encoded = encodePlantUML(content);
      diagramContainer.innerHTML = `<img src="https://www.plantuml.com/plantuml/svg/${encoded}" alt="Diagram" />`;
    }
  }
  
  // Helper function to encode PlantUML
  function encodePlantUML(text) {
    // This is a simplified version - you'd need a proper PlantUML encoder
    // or use a PlantUML server with appropriate encoding
    return btoa(text).replace(/\+/g, '-').replace(/\//g, '_');
  }
</script>

<div class="diagram-block {sender === 'user' ? 'user-message' : 'ai-message'}">
  <div class="header">
    <div class="diagram-type">{type}</div>
    <div class="sender">{sender}</div>
  </div>
  
  <div class="diagram-content" bind:this={diagramContainer}>
    <!-- Diagram will be rendered here -->
  </div>
  
  <div class="actions">
    <button class="edit-button">Edit</button>
    <button class="copy-button">Copy Code</button>
    <button class="download-button">Download</button>
  </div>
</div>

<style>
  .diagram-block {
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
  
  .diagram-content {
    padding: 12px;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
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
  
  button:hover {
    opacity: 0.9;
  }
</style>