const cities = require('../data/cities.json');

module.exports = (router) => {
  // 인기 도시 + 지역별 취항 도시. ?q=도쿄 / ?q=NRT 로 검색할 수 있어요
  router.get('/api/cities', (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) return res.json(cities);
    const regions = cities.regions
      .map((r) => ({
        name: r.name,
        cities: r.cities.filter((c) =>
          c.city.toLowerCase().includes(q) || c.country.includes(q) || c.code.toLowerCase().includes(q)),
      }))
      .filter((r) => r.cities.length);
    res.json({ popular: cities.popular, regions });
  });
};
