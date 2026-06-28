import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      include: /\.(jsx|tsx|ag)$/
    })
  ],
  resolve: {
    alias: {
      'antigravity': 'react'
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.ag', '.json']
  },
  esbuild: {
    loader: 'jsx',
    include: /\.(jsx|tsx|ag)$/,
    exclude: []
  }
});
