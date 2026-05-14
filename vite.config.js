import { defineConfig } from 'vite';

export default defineConfig({
  base: '/heatwave-survival/',
  server: {
    open: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
  },
});
