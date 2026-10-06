const crypto = require('crypto');
const payments = require('../data/payments.json');
const httpError = require('../lib/httpError');

function find(type) {
  const p = payments[type];
  if (!p) throw httpError(404, 'UNKNOWN_PAYMENT', `'${type}' 납부 항목을 찾을 수 없어요`);
  return p;
}

function listQuotes() {
  return Object.values(payments).map(({ receipt, ...quote }) => quote);
}

function getQuote(type) {
  const { receipt, ...quote } = find(type);
  return quote;
}

/** 스테이블코인 정산을 흉내 내요. 실제 결제는 일어나지 않아요. */
function pay(type) {
  const p = find(type);
  return {
    status: 'SETTLED',
    type,
    amount: p.amount,
    currency: 'KRW-SC',
    route: p.settlement.route,
    txHash: '0x' + crypto.randomBytes(16).toString('hex'),
    settledAt: new Date().toISOString(),
    receipt: p.receipt,
  };
}

module.exports = { listQuotes, getQuote, pay };
