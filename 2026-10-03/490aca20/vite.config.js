import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import cors from 'cors'
import { authRouter } from './server/routes/authRoutes.js'
import { codingLabRouter } from './server/routes/codingLabRoutes.js'
import { teacherRouter } from './server/routes/teacherRoutes.js'
import { coursesRouter } from './server/routes/coursesRoutes.js'

const apiApp = express();
apiApp.use(cors());
apiApp.use(express.json({ limit: '10mb' }));
apiApp.use(express.urlencoded({ extended: true }));

// Mount backend API routes in Vite dev server
apiApp.use('/api/auth', authRouter);
apiApp.use('/api/coding-lab', codingLabRouter);
apiApp.use('/api/teacher', teacherRouter);
apiApp.use('/api/courses', coursesRouter);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.startsWith('/api/') || req.url === '/api')) {
            apiApp(req, res, next);
          } else {
            next();
          }
        });
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
    open: true,
  },
})
