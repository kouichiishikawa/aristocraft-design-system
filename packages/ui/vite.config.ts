import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Used by Storybook (react-vite) and Vitest browser mode. The library itself is built with tsdown.
export default defineConfig({
  plugins: [react()],
});
