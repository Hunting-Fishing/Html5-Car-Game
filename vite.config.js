import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/icons/365-micro-garage.svg'],
      manifest: {
        name: '365 Micro Garage Companion',
        short_name: '365 Garage',
        description: 'Idle racing clicker companion game with micro parts, merge bay, and garage upgrades.',
        theme_color: '#06131d',
        background_color: '#06131d',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'assets/icons/365-micro-garage.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
