import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes.js';
import { codingLabRouter } from './routes/codingLabRoutes.js';
import { teacherRouter } from './routes/teacherRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/coding-lab', codingLabRouter);
app.use('/api/teacher', teacherRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), status: 'Re:Learn & Coding Lab API Operational' });
});

app.listen(PORT, () => {
  console.log(`Coding Lab Backend Server running on http://localhost:${PORT}`);
});

export default app;
