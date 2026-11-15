import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-charts',
              test: /node_modules[\\/](recharts|d3-|victory-)/,
            },
            {
              name: 'vendor-motion',
              test: /node_modules[\\/](framer-motion|motion-)/,
            },
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|zustand|lucide-react)/,
            },
          ],
        },
      },
    },
  },
});
