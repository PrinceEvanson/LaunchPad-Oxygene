import { defineConfig } from 'vite';

// Plain Vite: the UI uses Preact + htm tagged templates, so no JSX plugin is needed.
export default defineConfig({
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: true },
});
