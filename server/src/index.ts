import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Serve uploads if any
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    platform: 'TRUSTCHAIN AUDIT API',
    tagline: 'Verify the Platform. Protect the Content. Prove the Records.',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/audits',
      '/api/movie-rights',
      '/api/publishing',
      '/api/certificates',
      '/api/ai/ask',
    ],
  });
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🛡️ TRUSTCHAIN AUDIT ENGINE ONLINE ON PORT ${PORT}      `);
    console.log(`  Modules: Smart Contract | Streaming | Publishing     `);
    console.log(`  Registry: EVM Evidence Anchoring (Base / L2)          `);
    console.log(`  Serverless Ready: Vercel / Edge & Base L2 RPC Proxy   `);
    console.log(`=======================================================`);
  });
}

export default app;

