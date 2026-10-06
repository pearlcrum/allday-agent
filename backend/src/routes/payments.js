const paymentService = require('../services/paymentService');

module.exports = (router) => {
  // 납부할 수 있는 항목 전체
  router.get('/api/payments', (req, res) => res.json(paymentService.listQuotes()));
  // 납부 견적 (바텀시트에 표시)
  router.get('/api/payments/:type', (req, res) => res.json(paymentService.getQuote(req.params.type)));
  // 원화 스테이블코인 납부 실행 (Mock)
  router.post('/api/payments/:type', (req, res) => res.status(201).json(paymentService.pay(req.params.type, req.body)));
};
