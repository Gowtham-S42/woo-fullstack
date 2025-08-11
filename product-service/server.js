import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from './db.js';
import { ingestAll } from './ingest.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const config = {
  PORT: process.env.PORT || 4001,
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  WOO_BASE_URL: process.env.WOO_BASE_URL,
  WOO_CONSUMER_KEY: process.env.WOO_CONSUMER_KEY,
  WOO_CONSUMER_SECRET: process.env.WOO_CONSUMER_SECRET,
  AUTO_INGEST: process.env.AUTO_INGEST === 'true',
  INGEST_INTERVAL_MINUTES: process.env.INGEST_INTERVAL_MINUTES
};

let pool;
(async () => {
  pool = await createPool(config);
  console.log('Connected to MySQL');

  if (config.AUTO_INGEST) {
    try {
      await ingestAll({ pool, config, log: console });
    } catch (e) {
      console.error('Auto-ingest failed:', e.message);
    }
  }

  const interval = parseInt(config.INGEST_INTERVAL_MINUTES, 10);
  if (!isNaN(interval) && interval > 0) {
    setInterval(async () => {
      try {
        await ingestAll({ pool, config, log: console });
      } catch (e) {
        console.error('Scheduled ingest failed:', e.message);
      }
    }, interval * 60 * 1000);
  }
})();

// GET /products — return all products
app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title, price, stock_status, stock_quantity, category, tags, on_sale, created_at FROM products ORDER BY id DESC');
    // Parse tags JSON before returning
    const data = rows.map(r => ({
      ...r,
      on_sale: !!r.on_sale,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags
    }));
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /ingest — trigger ingestion
app.post('/ingest', async (req, res) => {
  try {
    const result = await ingestAll({ pool, config, log: console });
    res.json({ status: 'ok', ...result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(config.PORT, () => {
  console.log(`product-service running on port ${config.PORT}`);
});
