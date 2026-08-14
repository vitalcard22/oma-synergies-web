import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Without an explicit target, esbuild's CSS minifier assumes modern
    // browsers and strips "unnecessary" vendor prefixes - including
    // -webkit-backface-visibility, which iOS Safari genuinely still needs
    // for reliable 3D flip rendering. Including an older Safari target keeps
    // esbuild from removing it.
    cssTarget: ['safari13', 'chrome80', 'firefox78'],
  },
})
