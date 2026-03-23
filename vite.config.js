import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Prevent Vite from silently switching ports; Google OAuth authorized origins often depend on the exact port.
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7100',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:7100',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
