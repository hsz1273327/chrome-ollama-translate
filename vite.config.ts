import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'  // <=新增
import manifest from './manifest.json' with { type: 'json' } // <=新增

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }), 
  ],
  legacy: {
		skipWebSocketTokenCheck: true,
	},
})
