import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  const base = process.env.BASE_URL || '/MyKBD/';
  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          id: base,
          name: 'MPK Mini Play MK3 Web Edition',
          short_name: 'MPK Mini',
          description: 'Standalone Web & PWA recreation of the Akai MPK Mini Play MK3 featuring ultra-low latency audio, 128 GM sounds, 10 drum kits, 4 DSP effects, arpeggiator, and Web MIDI support.',
          theme_color: '#121316',
          background_color: '#0e0f12',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}icon.svg`,
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
