/**
 * 올데이 에이전트 — 백엔드 API 클라이언트
 * 프론트엔드는 이 파일을 통해서만 서버와 이야기해요.
 */
window.API = (function(){
  // 같은 서버에서 프론트를 내려주므로 상대 경로를 써요.
  // 프론트를 다른 곳(예: GitHub Pages)에 올리면 여기에 백엔드 주소를 넣어주세요.
  var BASE = window.ALLDAY_API_BASE || '';

  async function request(method, path, body){
    var res = await fetch(BASE + path, {
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    var data = await res.json().catch(function(){ return {}; });
    if(!res.ok) throw new Error(data.message || ('요청에 실패했어요 (' + res.status + ')'));
    return data;
  }

  var quoteCache = {};
  return {
    health:     function(){ return request('GET', '/api/health'); },
    taxes:      function(){ return request('GET', '/api/taxes'); },
    cities:     function(){ return request('GET', '/api/cities'); },
    quote:      function(type){ return quoteCache[type] || (quoteCache[type] = request('GET', '/api/payments/' + type).catch(function(e){ delete quoteCache[type]; throw e; })); },
    pay:        function(type){ return request('POST', '/api/payments/' + type); },
    searchTrip: function(q){ return request('POST', '/api/trips/search', q); },
    bookTrip:   function(q){ return request('POST', '/api/trips/book', q); }
  };
})();
