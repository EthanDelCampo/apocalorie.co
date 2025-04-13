import { loadEnv, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ngrok } from 'vite-plugin-ngrok'
const { NGROK_AUTH_TOKEN } = loadEnv('', process.cwd(), '')

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		ngrok({
			domain: "kid-caring-weekly.ngrok-free.app",
			authtoken: NGROK_AUTH_TOKEN,
		})
	],
	server: {
		proxy: {
			'/events': {
				target: 'https://events.mapbox.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/events/, ''),
			}
		}
	},
	optimizeDeps: {
		include: ['mapbox-gl']
	},
	build: {
		commonjsOptions: {
			include: [/mapbox-gl/, /node_modules/]
		}
	}
})
