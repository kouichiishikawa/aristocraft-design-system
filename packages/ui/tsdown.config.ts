import { defineConfig } from 'tsdown';

// Library build: ESM + .d.ts, plain CSS merged into dist/styles.css (CSS Modules scoped at build time).
// React stays external; consumers bring their own React 19.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'browser',
  dts: true,
  clean: true,
  deps: { neverBundle: ['react', 'react-dom', /^react\//, /^@base-ui\//] },
  css: { fileName: 'styles.css', modules: { generateScopedName: 'ac-[local]-[hash]' } },
  // Rolldown drops module-level directives; re-add the client directive for Next.js App Router consumers.
  banner: { js: "'use client';" },
});
