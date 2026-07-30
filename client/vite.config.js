import { defineConfig } from 'vite' // Import defineConfig helper from Vite
import react from '@vitejs/plugin-react' // Import React plugin for Vite JSX transformation and Fast Refresh
import tailwindcss from '@tailwindcss/vite' // Import Tailwind CSS plugin for Vite

export default defineConfig({ // Export Vite configuration object wrapped in defineConfig
  plugins: [ // Define array of active build plugins
    react(), // Enable React JSX support plugin
    tailwindcss(), // Enable Tailwind CSS styling plugin
  ], // Close plugins array
  server: { // Configure Vite local development server options
    port: 5173, // Set dev server listening port to 5173
    proxy: { // Set up HTTP request proxy rules for local development
      '/api': { // Match API requests starting with /api
        target: 'http://localhost:8000', // Proxy API calls to Django backend server on port 8000
        changeOrigin: true, // Modify Host header in HTTP request to target host URL
      }, // End /api proxy rule
      '/media': { // Match media file upload requests starting with /media
        target: 'http://localhost:8000', // Proxy media requests to Django backend server on port 8000
        changeOrigin: true, // Modify Host header to match target URL
      }, // End /media proxy rule
    }, // Close proxy configuration object
  }, // Close server configuration object
}) // Close defineConfig wrapper

