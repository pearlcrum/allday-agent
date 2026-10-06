const http = require('http');
const path = require('path');
const { Router, enhance, readJson } = require('./lib/router');
const { serveStatic } = require('./lib/static');

const taxes = require('./routes/taxes');
const payments = require('./routes/payments');
const trips = require('./routes/trips');
const cities = require('./routes/cities');

const router = new Router();
router.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'allday-agent', time: new Date().toISOString() }));
[taxes, payments, trips, cities].forEach((register) => register(router));

const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
const sendFrontend = serveStatic(FRONTEND_DIR);

async function handle(req, res) {
  enhance(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/api')) return sendFrontend(req, res);

  const hit = router.match(req.method, url.pathname);
  if (!hit) return res.status(404).json({ error: 'NOT_FOUND', message: `${req.method} ${url.pathname} 경로를 찾을 수 없어요` });

  try {
    req.params = hit.params;
    req.query = Object.fromEntries(url.searchParams);
    req.body = req.method === 'POST' ? await readJson(req) : {};
    await hit.handler(req, res);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: err.code || 'INTERNAL_ERROR', message: err.message || '서버에서 오류가 났어요' });
  }
}

module.exports = http.createServer(handle);
