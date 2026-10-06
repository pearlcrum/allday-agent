const tripService = require('../services/tripService');

module.exports = (router) => {
  // 항공·숙소·보험 비교 결과
  router.post('/api/trips/search', (req, res) => res.json(tripService.search(req.body)));
  // 선택한 조합으로 예약 (Mock)
  router.post('/api/trips/book', (req, res) => res.status(201).json(tripService.book(req.body)));
};
