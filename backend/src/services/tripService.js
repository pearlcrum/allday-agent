const crypto = require('crypto');
const catalog = require('../data/trips.json');
const httpError = require('../lib/httpError');

const CATEGORIES = ['air', 'hotel', 'ins'];

function nights(dep, ret) {
  const n = Math.round((new Date(ret) - new Date(dep)) / 86400000);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function validate({ dest, dep, ret, people }) {
  if (!dest) throw httpError(400, 'INVALID_TRIP', '여행지(dest)를 알려주세요');
  if (!dep || !ret) throw httpError(400, 'INVALID_TRIP', '가는 날(dep)과 오는 날(ret)을 알려주세요');
  const p = Number(people);
  if (!Number.isInteger(p) || p < 1 || p > 9) throw httpError(400, 'INVALID_TRIP', '인원(people)은 1~9명이에요');
  return p;
}

/** 인원·숙박일 수에 맞춰 가격을 계산한 선택지를 돌려줘요. */
function search(body = {}) {
  const people = validate(body);
  const nn = nights(body.dep, body.ret);

  const options = {};
  for (const key of CATEGORIES) {
    const g = catalog[key];
    const mult = g.unit === 'perNight' ? nn : people;
    options[key] = {
      label: g.label,
      icon: g.icon,
      note: g.note,
      list: g.list.map((o) => ({
        ...o,
        price: key === 'ins' ? Math.round((o.price * mult) / 1000) * 1000 : o.price * mult,
      })),
    };
  }

  // 기본 추천: 카테고리별 최저가
  const selected = Object.fromEntries(CATEGORIES.map((k) => [k, 0]));
  const total = CATEGORIES.reduce((s, k) => s + options[k].list[0].price, 0);

  return { dest: body.dest, dep: body.dep, ret: body.ret, people, nights: nn, sources: catalog.sources, options, selected, total };
}

function book(body = {}) {
  const result = search(body);
  const sel = body.selected || result.selected;
  const items = CATEGORIES.map((k) => {
    const item = result.options[k].list[sel[k]];
    if (!item) throw httpError(400, 'INVALID_SELECTION', `${k} 선택이 올바르지 않아요`);
    return { category: k, ...item };
  });
  return {
    status: 'CONFIRMED',
    bookingId: 'AD-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    dest: result.dest,
    total: items.reduce((s, i) => s + i.price, 0),
    items,
  };
}

module.exports = { search, book, nights };
