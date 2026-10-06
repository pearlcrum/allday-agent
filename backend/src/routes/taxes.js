const taxes = require('../data/taxes.json');

module.exports = (router) => {
  // 챙겨야 할 세금 목록 (공공마이데이터·국세청·위택스·이파인 조회 결과 Mock)
  router.get('/api/taxes', (req, res) => res.json({ count: taxes.items.length, ...taxes }));
};
