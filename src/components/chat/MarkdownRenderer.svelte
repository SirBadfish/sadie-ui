<script lang="ts">
  import { onMount } from 'svelte';
  // @ts-ignore - Ignore persistent module declaration error for markdown-it
  import MarkdownIt from 'markdown-it';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/atom-one-dark.css';

  // Props
  export let content: string = '';

  // Initialize markdown parser
  const md = new (MarkdownIt as any)({ // Cast to any to bypass type checking for constructor
    html: false,
    linkify: true,
    typographer: true,
    highlight: function (str: string, lang: string) { // Add types
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return ''; // use external default escaping
    }
  });

  let renderedContent: string = '';

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

<style lang="postcss"> /* Add lang="postcss" */
  /* Base styling for markdown content */
  .markdown-content :global(h1) {
    /* @apply text-2xl font-bold mb-4 mt-6; */
    font-size: 1.5rem; /* text-2xl */
    line-height: 2rem;
    font-weight: 700; /* font-bold */
    margin-bottom: 1rem; /* mb-4 */
    margin-top: 1.5rem; /* mt-6 */
  }
  .markdown-content :global(h2) {
    /* @apply text-xl font-bold mb-3 mt-5; */
    font-size: 1.25rem; /* text-xl */
    line-height: 1.75rem;
    font-weight: 700; /* font-bold */
    margin-bottom: 0.75rem; /* mb-3 */
    margin-top: 1.25rem; /* mt-5 */
  }
  .markdown-content :global(h3) {
    /* @apply text-lg font-bold mb-2 mt-4; */
    font-size: 1.125rem; /* text-lg */
    line-height: 1.75rem;
    font-weight: 700; /* font-bold */
    margin-bottom: 0.5rem; /* mb-2 */
    margin-top: 1rem; /* mt-4 */
  }
  .markdown-content :global(p) {
    /* @apply mb-4; */
    margin-bottom: 1rem; /* mb-4 */
  }
  .markdown-content :global(ul) {
    /* @apply list-disc pl-6 mb-4; */
    list-style-type: disc;
    padding-left: 1.5rem; /* pl-6 */
    margin-bottom: 1rem; /* mb-4 */
  }
  .markdown-content :global(ol) {
    /* @apply list-decimal pl-6 mb-4; */
    list-style-type: decimal;
    padding-left: 1.5rem; /* pl-6 */
    margin-bottom: 1rem; /* mb-4 */
  }
  .markdown-content :global(li) {
    /* @apply mb-1; */
    margin-bottom: 0.25rem; /* mb-1 */
  }
  .markdown-content :global(a) {
    /* @apply text-blue-600 hover:underline; */
    color: #2563eb; /* text-blue-600 */
  }
   .markdown-content :global(a:hover) {
     text-decoration-line: underline; /* hover:underline */
  }
  .markdown-content :global(blockquote) {
    /* @apply border-l-4 border-gray-300 pl-4 italic my-4; */
    border-left-width: 4px;
    border-color: #d1d5db; /* border-gray-300 */
    padding-left: 1rem; /* pl-4 */
    font-style: italic;
    margin-top: 1rem; /* my-4 */
    margin-bottom: 1rem;
  }
  .markdown-content :global(pre) {
    /* @apply bg-gray-800 rounded-md p-4 overflow-x-auto mb-4; */
    background-color: #1f2937; /* bg-gray-800 */
    border-radius: 0.375rem; /* rounded-md */
    padding: 1rem; /* p-4 */
    overflow-x: auto;
    margin-bottom: 1rem; /* mb-4 */
  }
  .markdown-content :global(code) {
    /* @apply font-mono text-sm; */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.875rem; /* text-sm */
    line-height: 1.25rem;
  }
  .markdown-content :global(p > code) { /* Target only direct code children of p */
    /* @apply bg-gray-200 px-1 py-0.5 rounded; */
    background-color: #e5e7eb; /* bg-gray-200 */
    padding-left: 0.25rem; /* px-1 */
    padding-right: 0.25rem;
    padding-top: 0.125rem; /* py-0.5 */
    padding-bottom: 0.125rem;
    border-radius: 0.25rem; /* rounded */
  }
  .markdown-content :global(table) {
    /* @apply border-collapse w-full mb-4; */
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem; /* mb-4 */
  }
  .markdown-content :global(th),
  .markdown-content :global(td) {
    /* @apply border border-gray-300 px-3 py-2; */
    border-width: 1px;
    border-color: #d1d5db; /* border-gray-300 */
    padding-left: 0.75rem; /* px-3 */
    padding-right: 0.75rem;
    padding-top: 0.5rem; /* py-2 */
    padding-bottom: 0.5rem;
  }
  .markdown-content :global(th) {
    /* @apply bg-gray-100; */
    background-color: #f3f4f6; /* bg-gray-100 */
  }
</style>