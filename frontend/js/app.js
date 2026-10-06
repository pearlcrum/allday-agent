(function(){
/* ─────────────────────────────────────────
   공식 로고를 쓰려면 아래에 이미지 주소(URL 또는 data URI)를 넣어주세요.
   비워두면 기본 에이전트 아이콘이 표시돼요.
───────────────────────────────────────── */
var BRAND_LOGO = '';

var AGENT_ICON = '<svg width="60%" height="60%" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5l1.9 5.1 5.1 1.9-5.1 1.9L12 16.5l-1.9-5.1L5 9.5l5.1-1.9z"/><path d="M18.5 14l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" opacity=".75"/></svg>';
function avatarHTML(){ return BRAND_LOGO ? '<img src="'+BRAND_LOGO+'" alt="" style="width:100%;height:100%;object-fit:cover">' : AGENT_ICON; }
document.querySelectorAll('[data-logo]').forEach(function(el){ el.innerHTML = avatarHTML(); });

var app = document.getElementById('app');
var msgsEl = document.getElementById('msgs');
var inp = document.getElementById('inp');
var sndBtn = document.getElementById('snd-btn');

/* ── 유틸 ── */
function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function won(n){ return Number(n).toLocaleString('ko-KR') + '원'; }
function comma(n){ return n>0 ? Number(n).toLocaleString('ko-KR') : ''; }
function haptic(){ try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){} }
function scr(){ requestAnimationFrame(function(){ msgsEl.scrollTop = msgsEl.scrollHeight; }); }
function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
var CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
var CHK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function countUp(node, to, dur){
  dur = dur || 700; var t0 = null;
  function f(t){ if(!t0) t0=t; var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
    node.textContent = won(Math.round(to*e)); if(p<1) requestAnimationFrame(f); }
  requestAnimationFrame(f);
}

var toastT;
function toast(msg){
  var t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('show'); }, 2000);
}

/* ── 메시지 ── */
var lastWasAgent = false;
function agentRow(content){
  var r = el('div','row-a');
  var av = el('div','av'+(lastWasAgent?' ghost':''), avatarHTML());
  var col = el('div','col');
  if(typeof content === 'string') col.innerHTML = content; else col.appendChild(content);
  r.appendChild(av); r.appendChild(col);
  msgsEl.appendChild(r); lastWasAgent = true; scr();
  return col;
}
function msgA(html){ return agentRow('<div class="bubble-a">'+html+'</div>'); }
function msgU(text){
  var r=el('div','row-u','<div class="bubble-u"></div>'); r.firstChild.textContent=text;
  msgsEl.appendChild(r); lastWasAgent=false; scr();
}
async function say(html, delay){
  var r = agentRow('<div class="typing"><span></span><span></span><span></span></div>');
  await wait(delay || 550);
  r.innerHTML = '<div class="bubble-a">'+html+'</div>';
  r.firstChild.style.animation = 'msgIn .3s var(--ease) both';
  scr();
}

/* ── 조회 진행 카드 ── */
var ORG_COLOR = {};
async function checking(orgs, steps, dur){
  var c = el('div','check-card',
    '<div class="cc-head"><div class="cc-spin"></div><div class="cc-step"></div></div>'
    +'<div class="cc-bar"><i></i></div><div class="cc-orgs"></div>');
  agentRow(c);
  var stepEl=c.querySelector('.cc-step'), bar=c.querySelector('.cc-bar i'), og=c.querySelector('.cc-orgs');
  stepEl.textContent = steps[0];
  var pills = orgs.map(function(o){ var p=el('span','cc-org',o); og.appendChild(p); return p; });
  requestAnimationFrame(function(){ bar.style.transition='width '+dur+'ms linear'; bar.style.width='100%'; });
  pills.forEach(function(p,i){ setTimeout(function(){ p.classList.add('on'); }, 80+i*90); });
  var per = dur/steps.length;
  steps.forEach(function(s,i){ if(i>0) setTimeout(function(){ stepEl.style.opacity=0; setTimeout(function(){ stepEl.textContent=s; stepEl.style.opacity=1; },150); }, per*i); });
  pills.forEach(function(p,i){ setTimeout(function(){ p.classList.add('ok'); }, dur*(i+1)/(pills.length+1)); });
  scr();
  await wait(dur + 150);
  c.outerHTML = '<div class="cc-done"><i>'+CHK+'</i>'+orgs.length+'곳에서 정보를 가져왔어요</div>';
  await wait(200);
}

/* ── 분석 카드 ── */
function card(o){
  var h = '<div class="card"><div class="card-src">'+o.src+'</div><div class="card-title">'+o.title+'</div>';
  if(o.hero) h += '<div class="hero"><div class="hero-l">'+o.hero[0]+'</div><div class="hero-v" data-count="'+o.hero[1]+'">0원</div></div>';
  if(o.ba) h += '<div class="ba"><div><div class="hero-l">'+o.ba[0]+'</div><div class="ba-old">'+won(o.ba[1])+'</div></div>'
    +'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>'
    +'<div><div class="hero-l">'+o.ba[2]+'</div><div class="hero-v" data-count="'+o.ba[3]+'">0원</div></div></div>';
  if(o.rows && o.rows.length){
    h += '<div class="c-rows">';
    o.rows.forEach(function(r){
      if(r === '-'){ h += '<div class="c-line"></div>'; return; }
      h += '<div class="c-row"><span class="c-key">'+r[0]+'</span><span class="c-val '+(r[2]||'')+'">'+r[1]+'</span></div>';
    });
    h += '</div>';
  }
  if(o.tip) h += '<div class="c-tip">'+o.tip+'</div>';
  if(o.warn) h += '<div class="c-warn">'+o.warn+'</div>';
  if(o.more){
    h += '<div class="more-wrap"><div><div class="more-in"><div class="c-rows">';
    o.more.forEach(function(r){ h += r==='-' ? '<div class="c-line"></div>' : '<div class="c-row"><span class="c-key">'+r[0]+'</span><span class="c-val '+(r[2]||'')+'">'+r[1]+'</span></div>'; });
    h += '</div>'+(o.moreTip?'<div class="c-tip">'+o.moreTip+'</div>':'')+'</div></div></div>';
    h += '<button class="more-btn"><span>자세히 보기</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></button>';
  }
  if(o.cta) h += '<div class="c-cta"><div class="pay-lbl"><span class="sc-dot">SC</span>원화 스테이블코인으로 바로 정산돼요</div>'
    +'<button class="btn btn-primary" data-cta>'+won(o.cta.amount)+' '+(o.cta.type==='irp'?'납입하기':'납부하기')+'</button></div>';
  if(o.actions) h += '<div class="c-acts">'+(o.ask?'<div class="c-ask">'+o.ask+'</div>':'')+'<div class="btn-row">'
    +o.actions.map(function(a,i){ return '<button class="btn '+(i===0?'btn-primary':'btn-sub')+'" data-act="'+i+'">'+a.label+'</button>'; }).join('')+'</div></div>';
  h += '</div>';
  var col = agentRow(h), c = col.lastElementChild;
  var mb = c.querySelector('.more-btn');
  if(mb) mb.addEventListener('click', function(){ haptic(); var o2=c.querySelector('.more-wrap').classList.toggle('open'); mb.classList.toggle('open',o2); mb.firstChild.textContent=o2?'접기':'자세히 보기'; });
  var cb = c.querySelector('[data-cta]');
  if(cb) cb.addEventListener('click', function(){ haptic(); openPaySheet(o.cta.type); });
  if(o.actions) c.querySelectorAll('[data-act]').forEach(function(b){ b.addEventListener('click', function(){
    if(busy) return; haptic(); var a=o.actions[+b.getAttribute('data-act')]; var box=c.querySelector('.c-acts'); if(box) box.remove(); a.fn(); }); });
  c.querySelectorAll('[data-count]').forEach(function(n){ countUp(n, +n.getAttribute('data-count')); });
  focusRow(col.parentNode);
  return c;
}
/* 새 카드가 화면보다 길면 카드 윗부분이 보이도록 스크롤 */
function focusRow(row){
  requestAnimationFrame(function(){
    var max = msgsEl.scrollHeight - msgsEl.clientHeight;
    msgsEl.scrollTop = Math.min(max, row.offsetTop - 64);
  });
}

/* ── 납부 카드 ── */
function payBtn(amount, route, type){
  var c = el('div','pay-card',
    '<div class="pay-lbl"><span class="sc-dot">SC</span>원화 스테이블코인으로 납부</div>'
    +'<div class="pay-amt">0원</div>'
    +'<div class="pay-route">'+route+'로 바로 정산돼요</div>'
    +'<button class="btn btn-primary">'+(type==='flight'?'예약하기':type==='irp'?'납입하기':'납부하기')+'</button>');
  countUp(c.querySelector('.pay-amt'), amount);
  c.querySelector('.btn').addEventListener('click', function(){ haptic(); openPaySheet(type); });
  agentRow(c);
}

/* ── 바텀시트 ── */
var sheet = document.getElementById('sheet'), panel = document.getElementById('sheet-panel'), sBody = document.getElementById('sheet-body');
function openSheet(html, mount){
  sBody.innerHTML = html; sBody.scrollTop = 0;
  if(mount) mount(sBody);
  panel.style.transform = '';
  sheet.classList.add('show');
}
function closeSheet(){ sheet.classList.remove('show'); panel.style.transform=''; }
document.getElementById('sheet-dim').addEventListener('click', closeSheet);
/* 끌어내려서 닫기 */
(function(){
  var grab=document.getElementById('sheet-grab'), y0=null, dy=0;
  grab.addEventListener('pointerdown', function(e){ y0=e.clientY; dy=0; panel.classList.add('dragging'); grab.setPointerCapture(e.pointerId); });
  grab.addEventListener('pointermove', function(e){ if(y0==null) return; dy=Math.max(0,e.clientY-y0); panel.style.transform='translateY('+dy+'px)'; });
  function end(){ if(y0==null) return; panel.classList.remove('dragging'); if(dy>90) closeSheet(); else panel.style.transform=''; y0=null; }
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
})();

/* 납부 견적·영수증은 백엔드 /api/payments 에서 받아와요 */
function scBox(a){ return '<div class="sh-sc"><div class="sh-sc-ic">SC</div><div><div class="sh-sc-t1">'+a[0]+'</div><div class="sh-sc-t2">'+a[1]+'</div></div></div>'; }
async function openPaySheet(type){
  if(type === 'flight') return openFlightSheet();
  var s; try{ s = await API.quote(type); }catch(e){ toast(e.message); return; }
  var rows = s.breakdown.map(function(r){ return '<div class="sh-row"><span>'+r.label+'</span><span class="'+(r.tone||'')+'">'+r.value+'</span></div>'; }).join('');
  openSheet('<div class="sh-title">'+s.title+'</div><div class="sh-sub">'+s.subtitle+'</div>'
    +'<div class="sh-amt">'+won(s.amount)+'</div><div class="sh-rows">'+rows+'</div>'+scBox([s.settlement.route, s.settlement.note])
    +'<button class="btn btn-primary" id="sh-go">Face ID로 '+(type==='irp'?'납입하기':'납부하기')+'</button>',
    function(b){ b.querySelector('#sh-go').addEventListener('click', function(){ haptic(); payDone(type); }); });
}

/* ── 세금 현황 ── */
async function taxOverview(){
  var TONE = { green:['var(--green)','var(--green-50)'], blue:['var(--blue)','var(--blue-50)'], orange:['var(--orange)','var(--orange-50)'], red:['var(--red)','var(--red-50)'] };
  var data = await API.taxes();
  var items = data.items.map(function(t){ var tc=TONE[t.tone]||TONE.blue; return { icon:t.icon, name:t.name, desc:t.desc, tag:t.tag, c:tc[0], bg:tc[1], q:t.query }; });
  var c = el('div','list-card','<div class="lc-title">챙겨야 할 세금 '+items.length+'건</div>');
  items.forEach(function(it){
    var r = el('div','lc-row press',
      '<div class="lc-ic">'+it.icon+'</div><div class="lc-info"><div class="lc-top"><span class="lc-name">'+it.name+'</span>'
      +'<span class="lc-tag" style="color:'+it.c+';background:'+it.bg+'">'+it.tag+'</span></div><div class="lc-desc">'+it.desc+'</div></div>'
      +'<span class="lc-chev">'+CHEV+'</span>');
    r.addEventListener('click', function(){ haptic(); qa(it.q); });
    c.appendChild(r);
  });
  agentRow(c);
}

/* ── 여행 (대화형으로 한 단계씩) ── */
var TV = { dest:'', dep:'', ret:'', budget:0, people:2 };
var POPULAR = [];
function nights(a,b){ if(!a||!b) return 0; return Math.max(0, Math.round((new Date(b)-new Date(a))/86400000)); }
function fmtDate(s){ if(!s) return ''; var d=new Date(s), w='일월화수목금토'[d.getDay()]; return (d.getMonth()+1)+'월 '+d.getDate()+'일 ('+w+')'; }
function fmtShort(s){ var d=new Date(s); return (d.getMonth()+1)+'.'+d.getDate(); }
function manwon(n){ return (n/10000).toLocaleString('ko-KR')+'만원'; }
function removeRow(node){ var r=node.closest('.row-a'); if(r) r.remove(); lastWasAgent=false; }

function quickReplies(opts, onPick){
  var w = el('div','qr-wrap');
  opts.forEach(function(o){
    var b = el('button','qr-chip press'+(o.sub?' sub':''), o.label);
    b.addEventListener('click', function(){ haptic(); onPick(o, w); });
    w.appendChild(b);
  });
  agentRow(w); return w;
}

/* 취항 도시 목록은 백엔드 GET /api/cities 에서 받아와요 */
var REGIONS = [], CITIES = [];
var citiesReady = API.cities().then(function(d){
  POPULAR = d.popular;
  REGIONS = d.regions.map(function(r){ return [r.name, r.cities.map(function(x){ return {c:x.city, n:x.country, code:x.code}; })]; });
  CITIES = []; REGIONS.forEach(function(r){ r[1].forEach(function(x){ CITIES.push(x.c); }); });
}).catch(function(){});
async function askDest(){
  await citiesReady;
  var opts = POPULAR.map(function(c){ return {label:c, v:c}; }); opts.push({label:'전체 도시 보기 ('+CITIES.length+')', sub:true});
  quickReplies(opts, function(o, w){
    if(o.sub) openCitySheet(function(c){ setDest(c, w); });
    else setDest(o.v, w);
  });
}
function openCitySheet(cb){
  var tabs = '<button class="rg on" data-r="-1">전체</button>'+REGIONS.map(function(r,i){ return '<button class="rg" data-r="'+i+'">'+r[0]+'</button>'; }).join('');
  openSheet('<div class="sh-title">어디로 떠나세요?</div>'
    +'<div class="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B95A1" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input id="city-q" placeholder="도시, 나라, 공항 코드로 검색" autocomplete="off"><button class="q-clear" id="q-clear" aria-label="지우기">✕</button></div>'
    +'<div class="rg-bar" id="rg-bar">'+tabs+'</div>'
    +'<div class="city-list" id="city-list"></div>',
    function(b){
      var list=b.querySelector('#city-list'), q=b.querySelector('#city-q'), bar=b.querySelector('#rg-bar'), clr=b.querySelector('#q-clear');
      function render(){
        var k=q.value.trim(), h='';
        clr.style.display = k ? 'flex' : 'none';
        bar.style.display = k ? 'none' : 'flex';
        var kl = k.toLowerCase();
        REGIONS.forEach(function(r,i){
          var cs = r[1].filter(function(x){ return !k || x.c.toLowerCase().indexOf(kl)>-1 || x.n.indexOf(k)>-1 || x.code.toLowerCase().indexOf(kl)>-1; });
          if(!cs.length) return;
          h += '<div class="city-sec" data-sec="'+i+'"><div class="city-sec-t">'+r[0]+' <span>'+cs.length+'</span></div><div class="city-grid">'
            + cs.map(function(x){ return '<button class="city-item press'+(POPULAR.indexOf(x.c)>-1?' pop':'')+'" data-c="'+x.c+'"><b'+(x.c.length>6?' class="long"':'')+'>'+x.c+'</b><small>'+(x.n===x.c?'':x.n+' · ')+x.code+'</small></button>'; }).join('')+'</div></div>';
        });
        list.innerHTML = h || '<div class="city-empty">찾는 도시가 없어요</div>';
        list.classList.toggle('full', !k);
        list.scrollTop = 0;
        list.querySelectorAll('.city-item').forEach(function(x){ x.addEventListener('click', function(){ haptic(); closeSheet(); cb(x.getAttribute('data-c')); }); });
      }
      var lock=0;
      function setTab(i){ bar.querySelectorAll('.rg').forEach(function(t){ t.classList.toggle('on', +t.getAttribute('data-r')===i); }); }
      bar.querySelectorAll('.rg').forEach(function(t){ t.addEventListener('click', function(){
        haptic(); var i=+t.getAttribute('data-r'); setTab(i); lock=Date.now();
        var sec = i<0 ? null : list.querySelector('[data-sec="'+i+'"]');
        list.scrollTo({ top: sec ? sec.offsetTop : 0, behavior:'smooth' });
        t.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
      }); });
      /* 스크롤하면 현재 지역 탭이 따라 바뀌어요 */
      list.addEventListener('scroll', function(){
        if(q.value.trim() || Date.now()-lock<700) return;
        var cur=-1; list.querySelectorAll('.city-sec').forEach(function(s){ if(s.offsetTop - 8 <= list.scrollTop) cur=+s.getAttribute('data-sec'); });
        if(list.scrollTop < 4) cur=-1;
        setTab(cur);
      });
      hScroll(bar);
      /* 목록을 좌우로 밀면 이전·다음 지역으로 넘어가요 */
      var sw=null, swiped=false;
      list.addEventListener('pointerdown', function(e){ sw={x:e.clientX, y:e.clientY}; swiped=false; });
      list.addEventListener('pointerup', function(e){
        if(!sw || q.value.trim()) { sw=null; return; }
        var dx=e.clientX-sw.x, dy=e.clientY-sw.y; sw=null;
        if(Math.abs(dx)<50 || Math.abs(dx)<Math.abs(dy)*1.5) return;
        swiped=true;
        var cur=+(bar.querySelector('.rg.on')||{getAttribute:function(){return -1;}}).getAttribute('data-r');
        var nx=Math.max(-1, Math.min(REGIONS.length-1, cur+(dx<0?1:-1)));
        if(nx===cur) return;
        list.classList.remove('swl','swr'); void list.offsetWidth; list.classList.add(dx<0?'swl':'swr');
        bar.querySelector('[data-r="'+nx+'"]').click();
      });
      list.addEventListener('pointercancel', function(){ sw=null; });
      list.addEventListener('click', function(e){ if(swiped){ e.stopPropagation(); e.preventDefault(); swiped=false; } }, true);
      list.addEventListener('animationend', function(){ list.classList.remove('swl','swr'); });
      q.addEventListener('input', render);
      clr.addEventListener('click', function(){ q.value=''; render(); q.focus(); });
      render();
    });
}
async function setDest(c, w){
  TV.dest = c; removeRow(w); msgU(c);
  await say(c+', 좋아요.<br>언제 떠나세요?', 450);
  askDate();
}
function askDate(){
  var b = el('button','btn btn-sub pick-btn','<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>날짜 고르기');
  function open(){ openDatePicker(async function(){ removeRow(b); var n=nights(TV.dep,TV.ret);
    msgU(fmtShort(TV.dep)+' → '+fmtShort(TV.ret)+' · '+n+'박 '+(n+1)+'일');
    await say('몇 명이서 가세요?<br>한 사람당 예산도 알려주세요.', 450); askPeopleBudget(); }); }
  b.addEventListener('click', function(){ haptic(); open(); });
  agentRow(b);
  setTimeout(open, 350);
}
function korWon(n){
  if(!n) return '';
  var eok=Math.floor(n/100000000), man=Math.floor(n%100000000/10000), rest=n%10000, s='';
  if(eok) s+=eok+'억 '; if(man) s+=man.toLocaleString('ko-KR')+'만 '; if(rest) s+=rest.toLocaleString('ko-KR');
  return s.trim()+'원';
}
function askPeopleBudget(){
  var ADDS=[100000,300000,500000,1000000];
  var c = el('div','card mini-form',
    '<div class="mf-row"><span class="mf-lbl">인원</span><div class="stepper"><button data-s="-1">−</button><span id="mf-p">'+TV.people+'명</span><button data-s="1">+</button></div></div>'
    +'<div class="mf-row" style="margin:20px 0 4px"><span class="mf-lbl">1인 예산</span><button class="bud-reset" id="mf-r">지우기</button></div>'
    +'<div class="tv-bud"><input id="mf-b" inputmode="numeric" placeholder="얼마를 생각하세요?" value="'+comma(TV.budget)+'"><span>원</span></div>'
    +'<div class="bud-kor" id="mf-k">'+korWon(TV.budget)+'</div>'
    +'<div class="tv-tags">'+ADDS.map(function(v){ return '<button class="tv-tag press" data-add="'+v+'">+'+manwon(v)+'</button>'; }).join('')+'</div>'
    +'<button class="btn btn-primary" id="mf-go" disabled>이대로 찾아보기</button>');
  var go=c.querySelector('#mf-go'), bi=c.querySelector('#mf-b'), kr=c.querySelector('#mf-k'), rs=c.querySelector('#mf-r');
  function sync(bump){
    bi.value = comma(TV.budget); kr.textContent = korWon(TV.budget);
    go.disabled = !TV.budget; rs.style.visibility = TV.budget ? 'visible' : 'hidden';
    if(bump){ bi.classList.remove('bump'); void bi.offsetWidth; bi.classList.add('bump'); }
  }
  c.querySelectorAll('[data-s]').forEach(function(s){ s.addEventListener('click', function(){ haptic(); TV.people=Math.min(9,Math.max(1,TV.people+ +s.getAttribute('data-s'))); c.querySelector('#mf-p').textContent=TV.people+'명'; }); });
  c.querySelectorAll('[data-add]').forEach(function(t){ t.addEventListener('click', function(){
    haptic(); TV.budget = Math.min(99990000, TV.budget + +t.getAttribute('data-add')); sync(true); }); });
  rs.addEventListener('click', function(){ haptic(); TV.budget=0; sync(); });
  bi.addEventListener('input', function(){ var v=parseInt(bi.value.replace(/[^0-9]/g,'')); TV.budget=isNaN(v)?0:Math.min(99990000,v); sync(); });
  go.addEventListener('click', function(){ if(!TV.budget) return; haptic(); removeRow(c); msgU(TV.people+'명 · 1인 '+korWon(TV.budget)); searchTV(); });
  sync(); agentRow(c);
}

/* 날짜 선택 (범위) */
function openDatePicker(onDone){
  var dp = { dep:TV.dep, ret:TV.ret };
  openSheet('<div class="sh-title">여행 날짜를 골라주세요</div><div class="dp-range" id="dp-range"></div>'
    +'<div class="dp-dows"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div>'
    +'<div class="dp-months" id="dp-months"></div><button class="btn btn-primary" id="dp-ok" disabled>확인</button>',
    function(b){
      function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
      function render(){
        var today = new Date(); today.setHours(0,0,0,0);
        var ts = iso(today), h='';
        for(var m=0;m<6;m++){
          var d = new Date(today.getFullYear(), today.getMonth()+m, 1), y=d.getFullYear(), mo=d.getMonth();
          h += '<div class="dp-mt">'+y+'년 '+(mo+1)+'월</div><div class="dp-days">';
          for(var e=0;e<d.getDay();e++) h += '<div></div>';
          var last = new Date(y,mo+1,0).getDate();
          for(var day=1; day<=last; day++){
            var ds = y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'), cls='dp-day';
            if(ds < ts) cls+=' past';
            if(ds===ts) cls+=' today';
            if(ds===dp.dep){ cls+=' sel start'; if(!dp.ret) cls+=' end'; }
            if(ds===dp.ret) cls+=' sel end';
            if(dp.dep && dp.ret && ds>dp.dep && ds<dp.ret) cls+=' in-range';
            h += '<div class="'+cls+'" data-d="'+ds+'">'+day+'</div>';
          }
          h += '</div>';
        }
        var box = b.querySelector('#dp-months'), st = box.scrollTop; box.innerHTML = h; box.scrollTop = st;
        var n = nights(dp.dep, dp.ret);
        b.querySelector('#dp-range').textContent = dp.dep ? fmtDate(dp.dep)+' → '+(dp.ret?fmtDate(dp.ret)+' · '+n+'박 '+(n+1)+'일':'오는 날을 골라주세요') : '가는 날을 골라주세요';
        b.querySelector('#dp-ok').disabled = !(dp.dep && dp.ret);
        box.querySelectorAll('.dp-day:not(.past)').forEach(function(x){ x.addEventListener('click', function(){
          haptic(); var ds = x.getAttribute('data-d');
          if(!dp.dep || dp.ret || ds <= dp.dep){ dp.dep = ds; dp.ret = ''; } else dp.ret = ds;
          render(); }); });
      }
      render();
      b.querySelector('#dp-ok').addEventListener('click', function(){ if(!(dp.dep&&dp.ret)) return; TV.dep=dp.dep; TV.ret=dp.ret; closeSheet(); if(onDone) onDone(); });
    });
}

/* 결과: 요약 카드 1장 + 비교는 바텀시트 */
var TRIP = null;
/* 항공·숙소·보험 선택지는 백엔드 POST /api/trips/search 가 계산해서 내려줘요 */
function tripPick(k, sel){ return TRIP.opts[k].list[(sel||TRIP.sel)[k]]; }
function tripTotal(sel){ return ['air','hotel','ins'].reduce(function(s,k){ return s+tripPick(k,sel).price; },0); }

async function searchTV(){
  var nn = nights(TV.dep, TV.ret);
  var req = API.searchTrip({ dest:TV.dest, dep:TV.dep, ret:TV.ret, people:TV.people });
  await checking(['네이버항공','카약','스카이스캐너','에어부산','대한항공','아시아나','여기어때','야놀자','에어비앤비','Agoda','부킹닷컴','호텔스컴바인','DB손보','현대해상','삼성화재'],
    ['항공권을 비교하고 있어요','숙소를 찾고 있어요','여행자보험을 알아보고 있어요','가장 좋은 조합을 고르고 있어요'], 2800);
  var res = await req;
  TRIP = { nn:res.nights, P:res.people, opts:res.options, sel:res.selected, card:null };
  await say('15곳을 비교해서 <b>가장 알맞은 조합</b>을 찾았어요.');
  var c = el('div','card trip');
  TRIP.card = c; renderTrip(true);
  agentRow(c);
}
function renderTrip(anim){
  var T=TRIP, c=T.card, tot=tripTotal(), limit=TV.budget*T.P, diff=limit-tot;
  var rows = ['air','hotel','ins'].map(function(k){ var o=tripPick(k), g=T.opts[k];
    return '<div class="trip-row"><div class="trip-ic">'+g.icon+'</div><div class="trip-info"><div class="trip-name">'+o.name+'</div><div class="trip-sub">'+o.info+'</div></div><div class="trip-price">'+won(o.price)+'</div></div>'; }).join('');
  c.innerHTML = '<div class="card-src">'+TV.people+'명 · '+fmtShort(TV.dep)+' → '+fmtShort(TV.ret)+'</div>'
    +'<div class="card-title" style="margin-bottom:8px">'+TV.dest+' '+T.nn+'박 '+(T.nn+1)+'일</div>'
    +rows
    +'<div class="trip-total"><div class="trip-total-l">총 예상 비용</div><div class="trip-total-v">'+won(tot)+'</div>'
    +'<div class="budget-badge '+(diff>=0?'ok':'over')+'">'+(diff>=0?'예산보다 '+won(diff)+' 적어요':'예산보다 '+won(-diff)+' 많아요')+'</div></div>'
    +'<button class="btn btn-primary" data-act="book">예약하기</button>'
    +'<button class="text-btn" data-act="cmp">다른 항공·숙소·보험 보기 '+CHEV+'</button>';
  if(anim) countUp(c.querySelector('.trip-total-v'), tot, 900);
  c.querySelector('[data-act=book]').addEventListener('click', function(){ haptic(); openFlightSheet(); });
  c.querySelector('[data-act=cmp]').addEventListener('click', function(){ haptic(); openCompareSheet('air'); });
}
function openCompareSheet(tab){
  var tmp = {air:TRIP.sel.air, hotel:TRIP.sel.hotel, ins:TRIP.sel.ins}, cur = tab;
  openSheet('<div class="sh-title">다른 선택지 보기</div>'
    +'<div class="seg" id="seg"><i class="seg-ind"></i><button data-t="air">항공권</button><button data-t="hotel">숙소</button><button data-t="ins">보험</button></div>'
    +'<div class="opt-note" id="opt-note"></div><div class="opt-list" id="opt-list"></div>'
    +'<div class="sh-total" style="margin-top:14px"><span class="sh-total-l">바꾸면 총</span><span class="sh-total-v" id="cmp-tot"></span></div>'
    +'<button class="btn btn-primary" id="cmp-ok">이걸로 바꾸기</button>',
    function(b){
      var seg=b.querySelector('#seg'), ind=seg.querySelector('.seg-ind'), btns=seg.querySelectorAll('button');
      function paint(){
        var keys=['air','hotel','ins'], i=keys.indexOf(cur);
        btns.forEach(function(x){ x.classList.toggle('on', x.getAttribute('data-t')===cur); });
        ind.style.transform='translateX('+(i*100)+'%)';
        var g=TRIP.opts[cur];
        b.querySelector('#opt-note').textContent = g.note;
        b.querySelector('#opt-list').innerHTML = g.list.map(function(o,j){
          return '<button class="opt press'+(tmp[cur]===j?' on':'')+'" data-j="'+j+'"><span class="radio"></span><div class="opt-info"><div class="opt-name">'+o.name+' <span class="opt-tag">'+o.tag+'</span></div><div class="opt-sub">'+o.info+'</div></div><span class="opt-price">'+won(o.price)+'</span></button>'; }).join('');
        b.querySelectorAll('.opt').forEach(function(x){ x.addEventListener('click', function(){ haptic(); tmp[cur]=+x.getAttribute('data-j'); paint(); }); });
        b.querySelector('#cmp-tot').textContent = won(tripTotal(tmp));
      }
      btns.forEach(function(x){ x.addEventListener('click', function(){ haptic(); cur=x.getAttribute('data-t'); paint(); }); });
      b.querySelector('#cmp-ok').addEventListener('click', function(){
        var changed = ['air','hotel','ins'].some(function(k){ return tmp[k]!==TRIP.sel[k]; });
        TRIP.sel = tmp; closeSheet(); renderTrip(true);
        if(changed) toast('여행 구성을 바꿨어요');
      });
      paint();
    });
}
function openFlightSheet(){
  var T=TRIP; if(!T) return;
  var items = ['air','hotel','ins'].map(function(k){ var o=tripPick(k);
    return '<div class="sh-item"><div class="sh-item-ic">'+T.opts[k].icon+'</div><div style="min-width:0"><div class="sh-item-t1">'+o.name+'</div><div class="sh-item-t2">'+o.info+'</div></div><div class="sh-item-p">'+won(o.price)+'</div></div>'; }).join('');
  openSheet('<div class="sh-title">이대로 예약할게요</div><div class="sh-sub">'+TV.dest+' · '+T.nn+'박 '+(T.nn+1)+'일 · '+TV.people+'명</div>'
    +'<div class="sh-items">'+items+'</div>'
    +'<div class="sh-total"><span class="sh-total-l">총 결제 금액</span><span class="sh-total-v">'+won(tripTotal())+'</span></div>'
    +scBox(['IBK 원화 SC로 한 번에 결제','항공·숙소·보험이 바로 확정돼요'])
    +'<button class="btn btn-primary" id="sh-go">Face ID로 예약하기</button>',
    function(b){ b.querySelector('#sh-go').addEventListener('click', function(){ haptic(); payDone('flight'); }); });
}

function yearPay(pen, irp){
  card({ src:'IBK 연금저축 · IBK IRP', title:'이렇게 나눠서 넣을게요', hero:['최종 예상 환급액',468500],
    rows:[['IBK 연금저축펀드',won(pen),'b'],['IBK IRP',won(irp),'b'],['추가 세액공제','+148,500원','g']],
    cta:{amount:900000, route:'IBK 연금저축 + IRP', type:'irp'} });
}
/* ── 시나리오 ── */
var FLOWS = {
  tax: async function(){
    await checking(['공공마이데이터','국세청','위택스','이파인'],['마이데이터에 연결하고 있어요','국세청에서 조회하고 있어요','위택스에서 조회하고 있어요','이파인에서 조회하고 있어요'], 2200);
    await say('지금 챙겨야 할 세금이 <b>4건</b> 있어요.<br>눌러보시면 바로 분석해드릴게요.');
    await taxOverview();
  },
  car: async function(){
    await checking(['공공마이데이터','위택스'],['차량 정보를 찾고 있어요','연납 할인을 계산하고 있어요'], 1600);
    card({ src:'위택스 · 소나타 N Line (23가 3456)', title:'지금 연납하면<br><span class="hl">14,290원</span> 아낄 수 있어요', hero:['연납하면 내는 금액',297710],
      rows:[['정기 납부 시','312,000원'],['신청 마감','1월 31일 (D-12)','r']],
      more:[['차량','소나타 N Line'],['1월 연납 할인율','4.58%','b'],['아끼는 금액','14,290원','g']],
      moreTip:'3월엔 3.44%, 6월엔 2.29%로 할인이 줄어요. 지금 신청하면 가장 많이 아낄 수 있어요.',
      cta:{amount:297710, route:'위택스', type:'car'} });
  },
  jongbu: async function(){
    await checking(['공공마이데이터','국세청'],['보유 재산을 확인하고 있어요','종부세를 계산하고 있어요','받을 수 있는 공제를 찾고 있어요'], 1800);
    card({ src:'국세청 · 강남구 1세대 1주택', title:'받을 수 있는 공제를<br>모두 적용했어요', hero:['최종 납부액',1840000],
      rows:[['공시가격 기준 세액','5,200,000원'],['고령자·장기보유 공제','적용','g']],
      more:[['1세대 1주택 공제 (12억)','적용','g'],['고령자 공제 30%','1,560,000원','g'],['장기보유 공제 50%','1,560,000원','g'],['중복 공제 한도 80%','적용','b']],
      moreTip:'고령자·장기보유 공제는 따로 신청하지 않아도 에이전트가 최대로 맞춰드렸어요.',
      cta:{amount:1840000, route:'국세청', type:'jongbu'} });
  },
  fine: async function(){
    await checking(['이파인','위택스','공공마이데이터'],['이파인에서 조회하고 있어요','위택스에서 조회하고 있어요','벌점을 확인하고 있어요','범칙금으로 바꿀 수 있는지 보고 있어요'], 1800);
    card({ src:'이파인 · 위택스 · 안 낸 위반 2건', title:'범칙금으로 바꾸면<br><span class="hl">10,000원</span> 아껴요', hero:['내야 할 금액',120000],
      rows:[['속도위반 (범칙금 전환)','60,000원'],['차선위반 범칙금','60,000원']],
      more:[['속도위반 과태료 (원래 금액)','70,000원','r'],['범칙금 전환','가능해요','g'],['누적 벌점 (한도 40점)','15점']],
      moreTip:'과태료는 위택스, 범칙금은 이파인에서 따로 내야 해요. 빠뜨리지 않게 한 번에 처리해드릴게요.',
      cta:{amount:120000, route:'이파인 + 위택스', type:'fine'} });
  },
  jongso: async function(){
    await checking(['국세청','홈택스'],['신고 대상인지 확인하고 있어요','작년 소득을 조회하고 있어요','신고할 항목을 정리하고 있어요'], 1800);
    card({ src:'국세청 · 부동산 임대소득', title:'종합소득세는<br><span class="hl">직접 신고</span>해야 해요',
      rows:[['신고 기간','5월 1일 ~ 31일','r'],['예상 세액 (작년 기준)','2,130,000원','b']],
      warn:'고지서가 오지 않아요. 신고하지 않으면 가산세 20%가 붙어요.',
      more:[['신고 방법','홈택스 · 세무서'],['지방소득세 (별도)','213,000원']],
      ask:'신고를 마치셨나요? 국세와 지방세는 제가 한 번에 낼게요.',
      actions:[
        { label:'신고했어요', fn: async function(){
          msgU('신고 끝났어, 납부해줘'); busy=true;
          try{
            await checking(['국세청','위택스'],['국세 납부를 준비하고 있어요','위택스 지방세를 연결하고 있어요'], 1400);
            card({ src:'국세청 · 위택스', title:'국세와 지방세를<br>한 번에 낼게요', hero:['합계',2343000],
              rows:[['종합소득세 (국세)','2,130,000원'],['지방소득세 (위택스)','213,000원']],
              tip:'지방소득세를 빠뜨려 생기는 가산세를 막아드려요.',
              cta:{amount:2343000, route:'국세청 + 위택스', type:'jongso'} });
          } finally { busy=false; }
        }},
        { label:'신고 방법 보기', fn: async function(){
          msgU('홈택스 신고 방법 알려줘'); busy=true;
          try{ await say('이렇게 하시면 돼요.<br><br><b>1.</b> 홈택스(hometax.go.kr)에 접속해요<br><b>2.</b> 신고/납부 → 종합소득세를 눌러요<br><b>3.</b> 모두채움 또는 일반 신고서를 골라요<br><b>4.</b> 임대소득 등 소득을 입력해요<br><b>5.</b> 신고서를 제출하면 끝이에요<br><br>신고하시고 "종소세 납부해줘"라고 말씀해주세요.', 800); }
          finally { busy=false; }
        }}
      ] });
  },
  year: async function(){
    await checking(['공공마이데이터','국세청','IBK IRP','IBK 연금저축'],['카드 사용 내역을 분석하고 있어요','국세청 공제 항목을 조회하고 있어요','IBK 연금 계좌를 확인하고 있어요','환급액을 계산하고 있어요'], 2200);
    card({ src:'국세청 · 공공마이데이터 · IBK', title:'900,000원 더 넣으면<br>환급액이 <span class="hl">148,500원</span> 늘어요',
      ba:['지금 예상 환급액',320000,'더 넣으면',468500],
      rows:[['IBK 연금저축펀드','450,000원'],['IBK IRP','450,000원']],
      more:[['총 급여','55,000,000원'],['신용카드 공제 (한도 소진)','1,200,000원','g'],['체크카드 남은 한도','800,000원','b'],['의료비 공제','320,000원','g'],'-',
        ['IRP 납입액','8,100,000원'],['연금저축펀드 납입액','2,400,000원'],['IRP + 연금저축 합산 한도','9,000,000원'],['남은 합산 한도','900,000원','b']],
      moreTip:'IRP와 연금저축펀드는 합쳐서 연 9,000,000원까지 공제돼요. 두 계좌에 나눠 넣으면 위험도 분산할 수 있어요.',
      ask:'어떻게 넣어드릴까요?',
      actions:[
        { label:'반반 넣기', fn: async function(){
          msgU('반반 넣어줘'); busy=true;
          try{
            await checking(['IBK 연금저축','IBK IRP'],['연금저축펀드에 연결하고 있어요','IRP에 연결하고 있어요'], 1400);
            yearPay(450000, 450000);
          } finally { busy=false; }
        }},
        { label:'비율 정하기', fn: async function(){
          msgU('비율 직접 정할게');
          var rc = el('div','card','<div class="card-title" style="margin-bottom:14px">어떻게 나눌까요?</div>'
            +'<div class="ratio-top"><div><div class="ratio-name">연금저축펀드</div><div class="ratio-val" id="rv-p">450,000원</div></div>'
            +'<div style="text-align:right"><div class="ratio-name">IRP</div><div class="ratio-val" id="rv-i">450,000원</div></div></div>'
            +'<input type="range" id="rv-s" min="0" max="18" step="1" value="9"><button class="btn btn-primary" id="rv-ok">이 비율로 넣기</button>');
          agentRow(rc);
          var s = rc.querySelector('#rv-s');
          function paint(){ var p=+s.value/18*100; s.style.background='linear-gradient(90deg,var(--blue) '+p+'%,var(--g200) '+p+'%)'; }
          function calc(){ var pen=+s.value*50000; return [pen, 900000-pen]; }
          paint();
          s.addEventListener('input', function(){ var v=calc(); rc.querySelector('#rv-p').textContent=won(v[0]); rc.querySelector('#rv-i').textContent=won(v[1]); paint(); haptic(); });
          rc.querySelector('#rv-ok').addEventListener('click', function(){
            haptic(); var v=calc(); removeRow(rc);
            msgU('연금저축 '+won(v[0])+', IRP '+won(v[1])+' 넣어줘');
            yearPay(v[0], v[1]);
          });
        }}
      ] });
  },
  travel: async function(){
    await say('어디로 떠나고 싶으세요?<br>항공권·숙소·보험까지 <b>한 번에</b> 찾아드릴게요.');
    await askDest();
  }
};

var KW = [
  [['세금 현황','전체 세금','세금 조회','세금'],'tax'],
  [['자동차세'],'car'],[['종부세','종합부동산'],'jongbu'],[['과태료','범칙금'],'fine'],
  [['종소세','종합소득'],'jongso'],[['연말정산','IRP','환급'],'year'],[['여행'],'travel']
];

var busy = false;
async function route(txt){
  var key = null;
  for(var i=KW.length-1;i>=0;i--){ if(KW[i][0].some(function(k){ return txt.indexOf(k)>-1; })){ key=KW[i][1]; break; } }
  if(key==='tax' && /자동차|종부|종합부동산|과태료|범칙금|종소|종합소득/.test(txt)) key=null;
  for(var j=1;j<KW.length && !key;j++){ if(KW[j][0].some(function(k){ return txt.indexOf(k)>-1; })) key=KW[j][1]; }
  if(key) await FLOWS[key]();
  else await say('"'+txt.replace(/</g,'&lt;')+'" 알아볼게요.<br>지금은 <b>세금, 연말정산, 여행</b>을 도와드릴 수 있어요.', 700);
}
async function send(){
  var txt = inp.value.trim(); if(!txt || busy) return;
  inp.value=''; sndBtn.classList.remove('on'); haptic();
  msgU(txt); busy = true;
  try{ await route(txt); }
  catch(e){ await say('서버에 연결하지 못했어요.<br><b>npm start</b>로 백엔드를 실행했는지 확인해주세요.', 300); }
  finally { busy = false; }
}
function qa(t){ if(busy) return; inp.value=t; send(); }

/* ── 칩 ── */
[['세금 현황','💰 세금 현황'],['연말정산 분석해줘','📊 연말정산'],['여행 준비해줘','✈️ 여행 준비']].forEach(function(c){
  var b = el('button','chip press',c[1]); b.addEventListener('click', function(){ haptic(); qa(c[0]); });
  document.getElementById('qr').appendChild(b);
});
inp.addEventListener('input', function(){ sndBtn.classList.toggle('on', inp.value.trim().length>0); });
inp.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.isComposing) send(); });
sndBtn.addEventListener('click', send);

/* ── 화면 전환 ── */
var greeted = false;
async function openChat(text){
  haptic(); app.classList.add('chat-open');
  await wait(380);
  if(!greeted){ greeted=true; await say('안녕하세요, 올데이 에이전트예요.<br>세금부터 연말정산, 여행까지 <b>제가 대신 챙겨드릴게요.</b><br><br>공공마이데이터·국세청·이파인·위택스와 연결해서 바로 알려드려요.', text?400:700); }
  if(text){ inp.value=text; send(); }
}
(function(){
  var f=document.getElementById('entry'), ei=document.getElementById('entry-inp'), fld=document.getElementById('entry-field'), ph=document.getElementById('entry-ph');
  f.addEventListener('submit', function(e){ e.preventDefault(); var t=ei.value.trim(); ei.value=''; fld.classList.remove('has'); ei.blur(); openChat(t); });
  document.getElementById('entry-av').addEventListener('click', function(){ openChat(''); });
  ei.addEventListener('input', function(){ fld.classList.toggle('has', ei.value.length>0); });
  var hints=['올데이 에이전트에게 물어보세요','자동차세 연납하면 얼마 아껴요?','연말정산 환급 더 받을 수 있어요?','도쿄 여행 준비해줘'], hi=0;
  setInterval(function(){
    if(document.activeElement===ei || app.classList.contains('chat-open')) return;
    ph.classList.add('out');
    setTimeout(function(){ hi=(hi+1)%hints.length; ph.textContent=hints[hi]; ph.classList.remove('out'); ph.classList.add('in');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ ph.classList.remove('in'); }); }); }, 450);
  }, 3200);
})();
document.getElementById('btn-back').addEventListener('click', function(){
  if(sheet.classList.contains('show')){ closeSheet(); return; }
  app.classList.remove('chat-open');
});
/* 왼쪽 가장자리에서 밀어서 뒤로가기 */
(function(){
  var chat=document.getElementById('chat'), home=document.getElementById('home'), x0=null, dx=0;
  chat.addEventListener('touchstart', function(e){ if(e.touches[0].clientX - app.getBoundingClientRect().left < 24){ x0=e.touches[0].clientX; chat.style.transition=home.style.transition='none'; } }, {passive:true});
  chat.addEventListener('touchmove', function(e){ if(x0==null) return; dx=Math.max(0,e.touches[0].clientX-x0); var w=app.clientWidth, p=dx/w;
    chat.style.transform='translateX('+dx+'px)'; home.style.transform='translateX('+(-28*(1-p))+'%)'; }, {passive:true});
  chat.addEventListener('touchend', function(){ if(x0==null) return; chat.style.transition=home.style.transition=''; chat.style.transform=home.style.transform='';
    if(dx > app.clientWidth*.35) app.classList.remove('chat-open'); x0=null; dx=0; });
})();

/* ── Face ID ── */
function faceId(){
  return new Promise(function(res){
    var o=document.getElementById('faceid'), f=document.getElementById('fid-face'), ok=document.getElementById('fid-ok'), c=document.getElementById('fid-chk'), s=document.getElementById('fid-s');
    f.style.opacity=1; ok.style.opacity=0; ok.style.transform='scale(.4)'; c.style.transition='none'; c.style.strokeDashoffset=50; s.textContent='얼굴을 확인하고 있어요';
    o.style.display='flex'; requestAnimationFrame(function(){ o.classList.add('show'); });
    setTimeout(function(){ f.style.opacity=0; ok.style.opacity=1; ok.style.transform='scale(1)'; s.textContent='확인됐어요'; haptic(); }, 1000);
    setTimeout(function(){ c.style.transition='stroke-dashoffset .35s ease'; c.style.strokeDashoffset=0; }, 1200);
    setTimeout(function(){ o.classList.remove('show'); setTimeout(function(){ o.style.display='none'; res(); }, 200); }, 1850);
  });
}

/* ── 완료 ── */
async function payDone(type){
  closeSheet(); await wait(250);
  await faceId();
  var info;
  try{
    if(type==='flight'){
      var bk = await API.bookTrip({ dest:TV.dest, dep:TV.dep, ret:TV.ret, people:TV.people, selected:TRIP.sel });
      info = { title:'예약을 마쳤어요', sub:(TV.dest||'여행')+' 여행 준비가 끝났어요<br><small>예약번호 '+bk.bookingId+'</small>',
        steps:[[tripPick('air').name,'예약 완료'],[tripPick('hotel').name,'예약 완료'],[tripPick('ins').name+' 여행자보험','가입 완료']],
        msg:'<b>'+(TV.dest||'여행')+'</b> 여행 예약을 모두 마쳤어요.<br>즐거운 여행 되세요!', toast:'예약 내역을 보냈어요' };
    } else {
      var r = (await API.pay(type)).receipt;
      info = { title:r.title, sub:r.subtitle, steps:r.steps.map(function(s){ return [s.label, s.status]; }), msg:r.message, toast:r.toast };
    }
  }catch(e){ toast(e.message || '결제를 마치지 못했어요'); return; }
  var d=document.getElementById('done'), ck=document.getElementById('dn-check'), ti=document.getElementById('dn-title'), su=document.getElementById('dn-sub'), li=document.getElementById('dn-list'), bt=document.getElementById('dn-btn');
  ck.classList.remove('on'); ti.classList.remove('on'); su.classList.remove('on'); bt.classList.remove('on');
  ti.textContent=info.title; su.innerHTML=info.sub;
  li.innerHTML = info.steps.map(function(s){ return '<div class="dn-item"><div class="dn-dot">'+CHK+'</div><span class="dn-lbl">'+s[0]+'</span><span class="dn-st">처리 중</span></div>'; }).join('');
  d.classList.add('show');
  var items = li.querySelectorAll('.dn-item');
  for(var i=0;i<items.length;i++){ await wait(i===0?450:480); items[i].classList.add('on'); items[i].querySelector('.dn-st').textContent=info.steps[i][1]; haptic(); }
  await wait(250); ck.classList.add('on'); haptic();
  await wait(250); ti.classList.add('on'); su.classList.add('on');
  await wait(350); bt.classList.add('on');
  bt.onclick = async function(){
    haptic(); d.classList.remove('show'); await wait(300);
    var col = msgA(info.msg); col.firstChild.classList.add('done-msg');
    toast(info.toast);
  };
}

/* ── 앱 실행 인트로 ── */
(function(){
  var I=document.getElementById('intro'); if(!I) return;
  var logo=I.querySelector('.it-logo img'), sh=I.querySelector('.it-shine');
  sh.style.webkitMaskImage=sh.style.maskImage='url('+logo.src+')';
  var over=false;
  function finish(){ if(over) return; over=true; I.classList.add('out'); setTimeout(function(){ I.remove(); }, 480); }
  I.addEventListener('click', finish);
  function W(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  var steps=[[300,'s1'],[1900,'s2'],[600,'s3'],[450,'s4'],[750,'s5'],[650,'s6'],[260,'s7'],[400,'s8'],[350,'s9'],[950,null]];
  (async function(){
    for(var i=0;i<steps.length;i++){
      await W(steps[i][0]); if(over) return;
      if(steps[i][1]){ I.classList.add(steps[i][1]); if(steps[i][1]==='s5') haptic(); }
      else finish();
    }
  })();
})();

/* ── 가로 스크롤: 터치는 기본, 마우스는 드래그·휠로도 넘길 수 있어요 ── */
function hScroll(el){
  if(!el || el._hs) return; el._hs=1; el.classList.add('hs');
  var down=false, sx=0, sl=0, moved=false;
  function upd(){ var m=el.scrollWidth-el.clientWidth; el.classList.toggle('fl', el.scrollLeft>2); el.classList.toggle('fr', el.scrollLeft<m-2); }
  el.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse' || e.button!==0) return; down=true; moved=false; sx=e.clientX; sl=el.scrollLeft; });
  window.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>5){ moved=true; el.classList.add('dragging'); } if(moved) el.scrollLeft=sl-dx; });
  window.addEventListener('pointerup', function(){ if(!down) return; down=false; setTimeout(function(){ el.classList.remove('dragging'); }, 0); });
  el.addEventListener('click', function(e){ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
  el.addEventListener('wheel', function(e){ if(el.scrollWidth<=el.clientWidth) return; if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ el.scrollLeft+=e.deltaY; e.preventDefault(); } }, {passive:false});
  el.addEventListener('scroll', upd, {passive:true}); window.addEventListener('resize', upd);
  upd(); setTimeout(upd, 60); setTimeout(upd, 500);
}
hScroll(document.getElementById('qr'));
/* ── 홈 화면 동작 ── */
(function(){
  var home=document.getElementById('home'), sc=document.getElementById('hm-scroll'), top=document.getElementById('hm-top');
  home.querySelectorAll('[data-toast]').forEach(function(b){
    b.addEventListener('click', function(e){ e.stopPropagation(); haptic(); toast(b.getAttribute('data-toast')+' 화면은 준비 중이에요'); });
  });
  sc.addEventListener('scroll', function(){ top.classList.toggle('sh', sc.scrollTop>4); }, {passive:true});
  /* 기업은행 · 다른금융 탭 */
  var card=document.getElementById('hm-card');
  home.querySelectorAll('.hm-tab').forEach(function(t){
    t.addEventListener('click', function(){
      haptic(); var i=t.getAttribute('data-t');
      home.querySelectorAll('.hm-tab').forEach(function(x){ x.classList.toggle('on', x===t); });
      card.classList.toggle('t1', i==='1');
      card.querySelectorAll('.hm-pane').forEach(function(p){ p.classList.toggle('off', p.getAttribute('data-p')!==i); });
    });
  });
  /* 최근 이체내역 펼치기 */
  var rc=document.getElementById('hm-recent');
  rc.querySelector('.hm-rh').addEventListener('click', function(){ haptic(); rc.classList.toggle('open'); });
  /* 상담 아이콘 → 에이전트 */
  document.getElementById('hm-cs').addEventListener('click', function(){ openChat(''); });
})();
})();
