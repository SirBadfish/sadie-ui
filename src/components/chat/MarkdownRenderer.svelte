<script>
  import { onMount } from 'svelte';
  import MarkdownIt from 'markdown-it';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/atom-one-dark.css';

  // Props
  export let content = '';

  // Initialize markdown parser
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return ''; // use external default escaping
    }
  });

  let renderedContent = '';

  $: {
    // Re-render when content changes
    if (content) {
      renderedContent = md.render(content);
    } else {
      renderedContent = '';
    }
  }
</script>

<div class="markdown-content">
  {@html renderedContent}
</div>

<style>
  /* Base styling for markdown content */
  .markdown-content :global(h1) {
    @apply text-2xl font-bold mb-4 mt-6;
  }
  .markdown-content :global(h2) {
    @apply text-xl font-bold mb-3 mt-5;
  }
  .markdown-content :global(h3) {
    @apply text-lg font-bold mb-2 mt-4;
  }
  .markdown-content :global(p) {
    @apply mb-4;
  }
  .markdown-content :global(ul) {
    @apply list-disc pl-6 mb-4;
  }
  .markdown-content :global(ol) {
    @apply list-decimal pl-6 mb-4;
  }
  .markdown-content :global(li) {
    @apply mb-1;
  }
  .markdown-content :global(a) {
    @apply text-blue-600 hover:underline;
  }
  .markdown-content :global(blockquote) {
    @apply border-l-4 border-gray-300 pl-4 italic my-4;
  }
  .markdown-content :global(pre) {
    @apply bg-gray-800 rounded-md p-4 overflow-x-auto mb-4;
  }
  .markdown-content :global(code) {
    @apply font-mono text-sm;
  }
  .markdown-content :global(p code) {
    @apply bg-gray-200 px-1 py-0.5 rounded;
  }
  .markdown-content :global(table) {
    @apply border-collapse w-full mb-4;
  }
  .markdown-content :global(th),
  .markdown-content :global(td) {
    @apply border border-gray-300 px-3 py-2;
  }
  .markdown-content :global(th) {
    @apply bg-gray-100;
  }
</style>