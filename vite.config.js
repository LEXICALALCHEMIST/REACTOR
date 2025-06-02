import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Buffer } from 'buffer';

// Polyfill Buffer for the browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'window', // Define global as window for simple-peer
    'process.env': {}, // Polyfill process.env
    'process': { env: {} } // Additional polyfill for process
  },
  resolve: {
    alias: {
      events: 'events', // Use the events polyfill package
      util: 'util' // Use the util polyfill package
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Prevent Vite from externalizing these modules
      external: ['events', 'util']
    }
  },
  build: {
    rollupOptions: {
      external: [] // Ensure events and util are not externalized during build
    }
  }
});