import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Cambiado a plugin-react estándar

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});