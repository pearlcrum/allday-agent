const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');  // http.Server

let server, base;
before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => server.close());

test('GET /api/health', async () => {
  const res = await fetch(base + '/api/health');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('GET /api/taxes → 4건', async () => {
  const body = await (await fetch(base + '/api/taxes')).json();
  assert.equal(body.count, 4);
});

test('GET /api/payments/car → 견적', async () => {
  const body = await (await fetch(base + '/api/payments/car')).json();
  assert.equal(body.amount, 297710);
  assert.equal(body.receipt, undefined);
});

test('POST /api/payments/car → 정산', async () => {
  const res = await fetch(base + '/api/payments/car', { method: 'POST' });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.status, 'SETTLED');
  assert.match(body.txHash, /^0x[0-9a-f]{32}$/);
});

test('POST /api/trips/search → 인원·숙박 반영', async () => {
  const res = await fetch(base + '/api/trips/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dest: '도쿄', dep: '2026-11-01', ret: '2026-11-04', people: 2 }),
  });
  const body = await res.json();
  assert.equal(body.nights, 3);
  assert.equal(body.options.air.list[0].price, 289000 * 2);
  assert.equal(body.options.hotel.list[0].price, 145000 * 3);
});

test('잘못된 납부 항목 → 404', async () => {
  const res = await fetch(base + '/api/payments/nope');
  assert.equal(res.status, 404);
});

test('GET /api/cities?q=NRT', async () => {
  const body = await (await fetch(base + '/api/cities?q=nrt')).json();
  assert.equal(body.regions[0].cities[0].city, '도쿄');
});
