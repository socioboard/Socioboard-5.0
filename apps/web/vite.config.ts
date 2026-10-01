import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // File-based routes in src/routes → src/routeTree.gen.ts; each route is its own chunk.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // `ws`: live updates (Socket.IO at /api/socket.io) upgrade to a WebSocket through the proxy.
    proxy: { '/api': { target: 'http://localhost:3000', ws: true } },
  },
});
