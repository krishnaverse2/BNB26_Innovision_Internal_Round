import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import cors from 'cors'
import { authRouter } from './server/routes/authRoutes.js'
import { codingLabRouter } from './server/routes/codingLabRoutes.js'
import { teacherRouter } from './server/routes/teacherRoutes.js'

const apiApp = express();
apiApp.use(cors());
apiApp.use(express.json({ limit: '10mb' }));
apiApp.use(express.urlencoded({ extended: true }));

// Mount backend API routes in Vite dev server
apiApp.use('/api/auth', authRouter);
apiApp.use('/api/coding-lab', codingLabRouter);
apiApp.use('/api/teacher', teacherRouter);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server-middleware',
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
