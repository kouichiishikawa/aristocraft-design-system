// @ts-check
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  vite: {
    // Process the workspace package (and its CSS) through Astro's Vite SSR pipeline.
    ssr: { noExternal: ['@aristocraft/ui'] },
  },
});
