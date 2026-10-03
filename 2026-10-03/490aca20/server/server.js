import express from 'express';
import cors from 'cors';
import { codingLabRouter } from './routes/codingLabRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount Coding Lab API endpoints
app.use('/api/coding-lab', codingLabRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), status: 'Coding Lab API Operational' });
});

app.listen(PORT, () => {
  console.log(`Coding Lab Backend Server running on http://localhost:${PORT}`);
});

export default app;
