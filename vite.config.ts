// vite.config.ts
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()], // Removed tailwindcss() - Using PostCSS setup for Tailwind v3
  server: {
    proxy: {
      '/mcp': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        secure: false
      },
      // Add proxy rule for n8n webhooks used by Chat Trigger
      '/webhook': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        secure: false,
        ws: true // Add ws: true for potential SSE/WebSocket handling
      }
    }
  },
  test: {
    workspace: [
      {
        extends: './vite.config.ts',
        plugins: [svelteTesting()],
        test: {
          name: 'client',
          environment: 'jsdom',
          clearMocks: true,
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
          setupFiles: ['./vitest-setup-client.ts']
        }
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
        }
      }
    ]
  }
});
