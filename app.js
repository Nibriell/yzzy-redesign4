// YZZY — NEO-POP · logica partajată (catalog, coș, efecte)
const P = (window.YZZY_DATA && YZZY_DATA.products) || [];
const CATS = (window.YZZY_DATA && YZZY_DATA.cats) || [];
const fmtLei = v => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 }).format(v / 100) + ' lei';
const byId = id => P.find(p => p.id === id);
const qs = k => new URLSearchParams(location.search).get(k);
const tagFor = p => (p.on_sale && p.regular > p.price)
  ? ('-' + Math.round((1 - p.price / p.regular) * 100) + '%') : p.condition;

// ---------- coș ----------
let cart = [];
try { cart = JSON.parse(localStorage.getItem('yzzyPopCart')) || []; } catch (e) {}
const saveCart = () => localStorage.setItem('yzzyPopCart', JSON.stringify(cart));
const cartTotal = () => cart.reduce((s, it) => { const p = byId(it.id); return s + (p ? p.price * it.qty : 0); }, 0);
function updateCartBadge() { const el = document.getElementById('cartCount'); if (el) el.textContent = cart.reduce((s, it) => s + it.qty, 0); }
function addToCart(id, qty = 1) {
  const f = cart.find(it => it.id === id);
  if (f) f.qty += qty; else cart.push({ id, qty });
  saveCart(); updateCartBadge();
  const p = byId(id);
  toast(`<b>★</b> ${p ? p.name : 'Produs'} — în coș!`);
}
function setQty(id, qty) {
  const it = cart.find(x => x.id === id); if (!it) return;
  it.qty = qty; if (it.qty < 1) cart = cart.filter(x => x.id !== id);
  saveCart(); updateCartBadge();
}

// ---------- toast ----------
let toastT;
function toast(html) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.innerHTML = html;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- logo sticker YZZY! ----------
function logoMark() { return '<span class="sticker">YZZY<b>!</b></span>'; }

// ---------- nav ----------
function renderNav(active) {
  const links = [
    ['index.html', 'Acasă'], ['catalog.html', 'Shop'], ['rate.html', 'Rate'],
    ['service.html', 'Service'], ['vinde.html', 'Vinde'], ['contact.html', 'Contact'],
  ];
  document.getElementById('nav').innerHTML = `
    <a class="logo" href="index.html" aria-label="yzzy">${logoMark()}</a>
    <ul class="nav-links">${links.map(([h, l]) => `<li><a href="${h}"${h === active ? ' class="active"' : ''}>${l}</a></li>`).join('')}</ul>
    <div class="nav-cta">
      <button class="icon-btn" id="searchBtn" aria-label="Caută">⌕</button>
      <a class="btn btn-white" id="cartBtn" href="cos.html">Coș<span class="cart-count" id="cartCount">0</span></a>
      <a class="btn btn-violet" href="catalog.html">Hai la shop</a>
    </div>`;
  addEventListener('scroll', () => document.getElementById('nav').classList.toggle('scrolled', scrollY > 30), { passive: true });
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 30);
  updateCartBadge(); initSearch();
}

// ---------- marquee ----------
function renderMarquee(el) {
  const items = ['Garanție 2 ani', 'Retur 30 de zile', 'Livrare în 24h', 'Rate? Easy', 'Verificat bucată cu bucată', 'Nou e overrated'];
  const half = `<span>${items.join('</span><i>★</i><span>')}</span><i>★</i>`;
  el.innerHTML = `<div class="marq-track"><span style="gap:18px">${half}${half}</span></div>`;
}

// ---------- footer ----------
function renderFooter(el) {
  el.innerHTML = `
  <div class="foot-grid">
    <div class="foot-brand">
      <a class="logo" href="index.html">${logoMark()}</a>
      <p>Telefoane recondiționate care arată nou și costă jumate. Verificate, garantate 2 ani, fără stress. YZZY MOBILE SRL · Suceava, Str. Ana Ipătescu, Nr. 5.</p>
    </div>
    <div><h5>Shop</h5><ul>
      <li><a href="catalog.html?cat=telefoane">Telefoane</a></li>
      <li><a href="catalog.html?cat=tablete">Tablete</a></li>
      <li><a href="catalog.html?cat=laptopuri">Laptopuri</a></li>
      <li><a href="catalog.html?cat=smartwatch">Smartwatch</a></li>
      <li><a href="catalog.html?cat=accesorii">Accesorii</a></li>
    </ul></div>
    <div><h5>Servicii</h5><ul>
      <li><a href="vinde.html">Vinde-ți telefonul</a></li>
      <li><a href="service.html">Service iPhone</a></li>
      <li><a href="service.html#samsung">Service Samsung</a></li>
      <li><a href="rate.html">Plata în rate</a></li>
      <li><a href="politici.html">Politici & garanții</a></li>
    </ul></div>
    <div><h5>Hai pe</h5><ul>
      <li><a href="tel:0761053053">0761 053 053</a></li>
      <li><a href="https://wa.me/+40761053053">WhatsApp</a></li>
      <li><a href="https://www.instagram.com/yzzy.ro/">Instagram</a></li>
      <li><a href="https://www.tiktok.com/@yzzy.ro">TikTok</a></li>
      <li><a href="https://www.facebook.com/yzzy.mobile">Facebook</a></li>
    </ul></div>
  </div>
  <div class="foot-mega">YZZY!</div>
  <div class="foot-bottom">
    <span>© 2026 YZZY MOBILE SRL · CUI RO44982632 · J33/1848/2021</span>
    <span><a href="politici.html">Termeni & politici</a> · <a href="https://anpc.ro/">ANPC</a> · demo de design</span>
  </div>`;
}

// ---------- cursor ----------
function initCursor() {
  if (matchMedia('(hover:none)').matches) return;
  const c = document.createElement('div'); c.className = 'cur'; document.body.appendChild(c);
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const loop = () => { x += (tx - x) * 0.3; y += (ty - y) * 0.3; c.style.left = x + 'px'; c.style.top = y + 'px'; requestAnimationFrame(loop); };
  loop();
  document.addEventListener('mouseover', e => c.classList.toggle('big', !!e.target.closest('a,button,.pcard,.padd,input,.pill')));
}

// ---------- efecte ----------
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
function countUp(el, end, dec = 0, suffix = '') {
  const t0 = performance.now();
  const tick = t => { const p = Math.min((t - t0) / 1400, 1), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('ro-RO')) + (p === 1 ? suffix : ''); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function initCounters() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); countUp(e.target, parseFloat(e.target.dataset.count), +(e.target.dataset.dec || 0), e.target.dataset.suffix || ''); }), { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}

// ---------- card produs ----------
function cardHTML(p) {
  const sale = p.on_sale && p.regular > p.price;
  return `<a class="pcard" href="produs.html?id=${p.id}">
    <span class="pvis"><span class="ptag">${tagFor(p)}</span><img src="${p.thumb}" alt="${p.name}" loading="lazy"></span>
    <span class="pname">${p.brand ? p.brand + ' ' : ''}${p.name}</span>
    <span class="pstate">${p.condition} · garanție 2 ani</span>
    <span class="pfoot"><span class="pprice">${sale ? `<s>${fmtLei(p.regular)}</s>` : ''}${fmtLei(p.price)}</span>
    <button class="padd" data-add="${p.id}" aria-label="Adaugă în coș">+</button></span>
  </a>`;
}
function bindAddButtons(container) {
  container.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (!b) return; e.preventDefault(); addToCart(b.dataset.add); });
}

// ---------- căutare ----------
function initSearch() {
  const btn = document.getElementById('searchBtn'); if (!btn) return;
  let ov = document.querySelector('.search-ov');
  if (!ov) {
    ov = document.createElement('div'); ov.className = 'search-ov';
    ov.innerHTML = `<button class="icon-btn search-close" aria-label="Închide">×</button>
      <input type="text" placeholder="Ce cauți?" aria-label="Caută produse">
      <div class="search-res"></div>`;
    document.body.appendChild(ov);
    const input = ov.querySelector('input'), res = ov.querySelector('.search-res');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { res.innerHTML = ''; return; }
      const hits = P.filter(p => (p.brand + ' ' + p.name).toLowerCase().includes(q)).slice(0, 10);
      res.innerHTML = hits.length ? hits.map(p => `<a href="produs.html?id=${p.id}"><span>${p.brand} ${p.name}</span><b>${fmtLei(p.price)}</b></a>`).join('') : '<a>Niciun rezultat — încearcă altceva.</a>';
    });
    ov.querySelector('.search-close').addEventListener('click', () => ov.classList.remove('show'));
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('show'); });
    addEventListener('keydown', e => { if (e.key === 'Escape') ov.classList.remove('show'); });
  }
  btn.addEventListener('click', () => { ov.classList.add('show'); ov.querySelector('input').focus(); });
}

// ---------- sigiliu garanție ----------
function sealHTML() {
  return `<div class="seal" aria-hidden="true">
    <svg viewBox="0 0 118 118"><defs><path id="circ" d="M59,59 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs>
    <text style="font-family:'Space Mono';font-weight:700;font-size:9px;letter-spacing:2px;fill:var(--ink)">
    <textPath href="#circ">GARANȚIE 2 ANI · VERIFICAT BUCATĂ CU BUCATĂ · YZZY ·</textPath></text></svg>
    <span class="core">2<small style="font-size:9px">ANI</small></span>
  </div>`;
}

initCursor();
