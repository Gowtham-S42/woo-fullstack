import axios from 'axios';
import { mapWooToLocal, buildUpsertSQL } from './utils.js';

export async function ingestAll({ pool, config, log = console }) {
  const base = config.WOO_BASE_URL?.replace(/\/$/, '');
  if (!base) throw new Error('WOO_BASE_URL missing');
  const ck = config.WOO_CONSUMER_KEY;
  const cs = config.WOO_CONSUMER_SECRET;
  if (!ck || !cs) throw new Error('Woo credentials missing');

  const perPage = 100;
  let page = 1;
  let totalInserted = 0;

  while (true) {
    const url = `${base}/wp-json/wc/v3/products`;
    const params = {
      per_page: perPage,
      page,
      consumer_key: ck,
      consumer_secret: cs
    };

    const { data } = await axios.get(url, { params, timeout: 30000 });
    if (!Array.isArray(data) || data.length === 0) break;

    const upsertSQL = buildUpsertSQL();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const p of data) {
        const row = mapWooToLocal(p);
        await conn.execute(upsertSQL, [
          row.id,
          row.title,
          row.price,
          row.stock_status,
          row.stock_quantity,
          row.category,
          row.tags,
          row.on_sale ? 1 : 0,
          row.created_at
        ]);
        totalInserted++;
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    log.info(`Ingested page ${page} (${data.length} products)`);
    page++;
  }

  log.info(`Ingestion completed. Upserted: ${totalInserted}`);
  return { upserted: totalInserted };
}
