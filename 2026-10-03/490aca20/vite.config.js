import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import cors from 'cors'
import { codingLabRouter } from './server/routes/codingLabRoutes.js'

const apiApp = express();
apiApp.use(cors());
apiApp.use(express.json({ limit: '10mb' }));
apiApp.use(express.urlencoded({ extended: true }));
apiApp.use('/api/coding-lab', codingLabRouter);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'coding-lab-api-server',
      configureServer(server) {
        server.middlewares.use(apiApp);
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
})


