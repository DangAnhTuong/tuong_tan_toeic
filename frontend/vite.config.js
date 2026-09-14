import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/media': {
        target: 'https://toeic.danganhtuong.dev',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI utilities
          'vendor-ui': ['lucide-react', 'axios'],
          // Heavy pages - split for lazy loading benefit
          'page-mocktest': [
            './src/pages/MockTestRoom.jsx',
            './src/pages/MockTestDashboard.jsx'
          ],
          'page-vocab': [
            './src/pages/VocabularyPractice.jsx',
            './src/pages/VocabularyDashboard.jsx'
          ],
          'page-listen': [
            './src/pages/LevelPracticeRoom.jsx',
            './src/pages/ListeningDashboard.jsx',
            './src/pages/ListeningPractice.jsx',
            './src/pages/ListeningDictation.jsx'
          ],
          'page-read': [
            './src/pages/ReadingPractice.jsx',
            './src/pages/ReadingDashboard.jsx',
            './src/pages/GrammarLesson.jsx'
          ]
        }
      }
    }
  }
});

