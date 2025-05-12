import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

export default defineConfig(({ command }) => {
    // 'command' will be 'serve' during 'npm run dev', 'build' during 'npm run build'
    const config = {
      plugins: [react()],
      base: '/', // Default base for the dev server ('serve')
    }
  
    // Apply the specific base path only when building for production
    if (command === 'build') {
      // Replace <your-repo-name> with your actual repository name!
      config.base = '/mjkit-frontend/'
      // config.base = '/'
    }
  
    return config
})

// export default defineConfig({
//   plugins: [react()],
//   base: '/mjkit-frontend/', // Set this to your repository name
// })