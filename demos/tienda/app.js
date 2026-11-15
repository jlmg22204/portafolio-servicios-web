const PRODUCTS = [
  { id: 1, cat: 'Vestidos', name: 'Vestido midi de lino', price: 189, emoji: '👗', desc: 'Lino 100%, corte cruzado y cinturón desmontable. Fresco y elegante.', colors: [['Arena', '#d8c3a5'], ['Terracota', '#b85c38'], ['Negro', '#222']], sizes: { S: 3, M: 5, L: 0, XL: 2 }, pop: 10, isNew: true },
  { id: 2, cat: 'Vestidos', name: 'Vestido camisero rayas', price: 139, old: 179, emoji: '👗', desc: 'Algodón con rayas finas, botones al frente y bolsas laterales.', colors: [['Azul', '#4a6fa5'], ['Verde', '#6b8f71']], sizes: { S: 4, M: 1, L: 3 }, pop: 8 },
  { id: 3, cat: 'Blusas', name: 'Blusa de seda satinada', price: 119, emoji: '👚', desc: 'Caída suave, cuello V y puños con botón.', colors: [['Marfil', '#f3ead8'], ['Champaña', '#e5c9a8'], ['Vino', '#6d213c']], sizes: { S: 6, M: 6, L: 4 }, pop: 9, isNew: true },
  { id: 4, cat: 'Blusas', name: 'Top tejido de algodón pima', price: 69, emoji: '🎽', desc: 'Algodón pima peruano en punto acanalado, suave y fresco.', colors: [['Blanco', '#fff'], ['Café', '#7b5a43']], sizes: { S: 8, M: 2, L: 5 }, pop: 7 },
  { id: 5, cat: 'Abrigos', name: 'Trench clásico', price: 299, emoji: '🧥', desc: 'Gabardina repelente al agua, doble botonadura y cinturón.', colors: [['Camel', '#c19a6b'], ['Negro', '#222']], sizes: { S: 2, M: 3, L: 1 }, pop: 6 },
  { id: 6, cat: 'Abrigos', name: 'Saco oversize de alpaca', price: 229, old: 299, emoji: '🧥', desc: 'Mezcla de lana de alpaca, hombros caídos y forro interior.', colors: [['Gris', '#9ca3af'], ['Avena', '#e8dcc6']], sizes: { M: 2, L: 4 }, pop: 5 },
  { id: 7, cat: 'Accesorios', name: 'Bolso de cuero artesanal', price: 249, emoji: '👜', desc: 'Cuero curtido a mano, correa ajustable, hecho en Perú.', colors: [['Coñac', '#9a5b2e'], ['Negro', '#222']], sizes: { Único: 7 }, pop: 10 },
  { id: 8, cat: 'Accesorios', name: 'Sandalias de tiras', price: 129, emoji: '👡', desc: 'Suela acolchada, tacón bajo de 3 cm.', colors: [['Nude', '#e0b99a'], ['Dorado', '#c8a24a']], sizes: { 36: 2, 37: 4, 38: 3, 39: 0 }, pop: 4, isNew: true },
  { id: 9, cat: 'Accesorios', name: 'Sombrero de paja toquilla', price: 79, old: 99, emoji: '👒', desc: 'Paja toquilla tejida a mano, cinta de algodón.', colors: [['Natural', '#e9d8a6']], sizes: { Único: 9 }, pop: 3 },
];
const BG = ['#f2d7c9', '#e8dfd2', '#d9e2d5', '#efe2cf', '#e2dbe8', '#f0e0d6'];
const COUPONS = { LUA10: 0.10, BIENVENIDA: 0.15 };
const FREE_SHIP = 199, SHIP = 12;

const $ = (s) => document.querySelector(s);
const money = (n) => 'S/ ' + Math.round(n).toLocaleString('es-PE');
const ls = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const state = { cat: 'Todo', cart: ls.get('lua-cart', []), favs: ls.get('lua-favs', []), coupon: ls.get('lua-coupon', null), modal: null, drawer: 'cart' };
const find = (id) => PRODUCTS.find((p) => p.id === +id);
const bg = (p) => BG[p.id % BG.length];

function persist() { ls.set('lua-cart', state.cart); ls.set('lua-favs', state.favs); ls.set('lua-coupon', state.coupon); }

/* ---------- Catálogo ---------- */
function renderNav() {
  const cats = ['Todo', ...new Set(PRODUCTS.map((p) => p.cat))];
  $('#cat-nav').innerHTML = cats.map((c) => `<button class="${c === state.cat ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
}

function card(p) {
  const fav = state.favs.includes(p.id);
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const stock = Object.values(p.sizes).reduce((a, b) => a + b, 0);
  return `<article class="prod" data-open="${p.id}">
    <div class="prod__img" style="--bgc:${bg(p)}">
      ${off ? `<span class="badge badge--sale">-${off}%</span>` : p.isNew ? '<span class="badge">Nuevo</span>' : stock < 6 ? '<span class="badge">Últimas piezas</span>' : ''}
      <button class="fav${fav ? ' on' : ''}" data-fav="${p.id}" aria-label="Favorito">${fav ? '♥' : '♡'}</button>
      ${p.emoji}
      <button class="quick" data-open="${p.id}">Vista rápida</button>
    </div>
    <div class="prod__b"><h3>${p.name}</h3>
      <p class="prod__p">${p.old ? `<span class="off">${money(p.price)}</span><s>${money(p.old)}</s>` : money(p.price)}</p>
      <div class="swatches">${p.colors.map((c) => `<i style="background:${c[1]}" title="${c[0]}"></i>`).join('')}</div>
    </div></article>`;
}

function renderProducts() {
  const q = $('#search').value.trim().toLowerCase();
  let list = PRODUCTS.filter((p) => (state.cat === 'Todo' || p.cat === state.cat) && (p.name + p.desc + p.cat).toLowerCase().includes(q));
  const s = $('#sort').value;
  list.sort((a, b) => s === 'asc' ? a.price - b.price : s === 'desc' ? b.price - a.price : s === 'new' ? (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) : b.pop - a.pop);
  $('#shop-title').textContent = state.cat;
  $('#products').innerHTML = list.map(card).join('');
  $('#empty').hidden = list.length > 0;
}

/* ---------- Modal de producto ---------- */
function openModal(id) {
  const p = find(id);
  state.modal = { id: p.id, color: p.colors[0][0], size: null };
  $('#m-img').style.background = bg(p);
  $('#m-img').textContent = p.emoji;
  $('#m-cat').textContent = p.cat;
  $('#m-name').textContent = p.name;
  $('#m-price').innerHTML = money(p.price) + (p.old ? `<s>${money(p.old)}</s>` : '');
  $('#m-desc').textContent = p.desc;
  renderModalOpts();
  toggle('#modal', true);
}
function renderModalOpts() {
  const p = find(state.modal.id), m = state.modal;
  $('#m-color-name').textContent = m.color;
  $('#m-colors').innerHTML = p.colors.map(([n, c]) => `<button class="color${n === m.color ? ' sel' : ''}" style="background:${c}" data-color="${n}" aria-label="${n}"></button>`).join('');
  $('#m-sizes').innerHTML = Object.entries(p.sizes).map(([s, q]) => `<button class="size${s === m.size ? ' sel' : ''}" data-size="${s}" ${q ? '' : 'disabled'}>${s}</button>`).join('');
  const q = m.size ? p.sizes[m.size] : null;
  $('#m-stock').textContent = !m.size ? 'Elige tu talla' : q <= 2 ? `¡Solo quedan ${q}!` : 'Disponible';
  $('#m-add').disabled = !m.size;
}

/* ---------- Carrito ---------- */
function addToCart() {
  const { id, color, size } = state.modal;
  const line = state.cart.find((l) => l.id === id && l.color === color && l.size === size);
  const max = find(id).sizes[size];
  if (line) { if (line.qty >= max) return toast('No hay más piezas en esa talla'); line.qty++; }
  else state.cart.push({ id, color, size, qty: 1 });
  persist(); updateCounts(); toggle('#modal', false);
  toast('✓ Agregado a tu bolsa'); bump('#open-cart');
}

function calc() {
  const sub = state.cart.reduce((s, l) => s + find(l.id).price * l.qty, 0);
  const disc = state.coupon ? sub * COUPONS[state.coupon] : 0;
  const ship = sub === 0 || sub - disc >= FREE_SHIP ? 0 : SHIP;
  return { sub, disc, ship, total: sub - disc + ship };
}

function renderDrawer() {
  const b = $('#d-body');
  if (state.drawer === 'favs') {
    $('#d-title').textContent = 'Favoritos';
    b.innerHTML = state.favs.length
      ? `<ul class="items">${state.favs.map((id) => { const p = find(id); return `<li class="item"><div class="item__img" style="background:${bg(p)}">${p.emoji}</div><div><p class="item__n">${p.name}</p><p class="item__m">${money(p.price)}</p><div class="item__r"><button class="btn" style="padding:.45rem 1rem;font-size:.82rem" data-open="${p.id}">Ver producto</button><button class="link" data-fav="${p.id}">Quitar</button></div></div></li>`; }).join('')}</ul>`
      : '<p class="empty">Aún no tienes favoritos. Toca ♡ en cualquier producto.</p>';
    return;
  }
  $('#d-title').textContent = 'Tu bolsa';
  if (!state.cart.length) { b.innerHTML = '<p class="empty">Tu bolsa está vacía.</p><button class="btn btn--full" data-close>Seguir comprando</button>'; return; }
  const t = calc();
  const left = FREE_SHIP - (t.sub - t.disc);
  b.innerHTML = `
    <p class="ship-msg">${left > 0 ? `Te faltan <b>${money(left)}</b> para envío gratis` : '🎉 ¡Tienes envío gratis!'}</p>
    <div class="ship-bar"><i style="width:${Math.min(100, ((t.sub - t.disc) / FREE_SHIP) * 100)}%"></i></div>
    <ul class="items">${state.cart.map((l, i) => { const p = find(l.id); return `
      <li class="item"><div class="item__img" style="background:${bg(p)}">${p.emoji}</div><div>
        <p class="item__n">${p.name}</p><p class="item__m">${l.color} · Talla ${l.size}</p>
        <div class="item__r"><span class="qty"><button data-q="${i}" data-d="-1" aria-label="Menos">−</button>${l.qty}<button data-q="${i}" data-d="1" aria-label="Más">+</button></span><b>${money(p.price * l.qty)}</b></div>
      </div></li>`; }).join('')}</ul>
    <div class="coupon"><input id="coupon-in" placeholder="Cupón de descuento" value="${state.coupon || ''}" aria-label="Cupón"><button id="coupon-btn">${state.coupon ? 'Quitar' : 'Aplicar'}</button></div>
    <p class="coupon-msg" id="coupon-msg">${state.coupon ? `✓ Cupón ${state.coupon} aplicado (-${COUPONS[state.coupon] * 100}%)` : ''}</p>
    <div class="sum"><p><span>Subtotal</span><span>${money(t.sub)}</span></p>
      ${t.disc ? `<p><span>Descuento</span><span>-${money(t.disc)}</span></p>` : ''}
      <p><span>Envío</span><span>${t.ship ? money(t.ship) : 'Gratis'}</span></p>
      <p class="tot"><span>Total</span><span>${money(t.total)}</span></p></div>
    <form class="co" id="co">
      <input name="nombre" placeholder="Nombre completo" required autocomplete="name">
      <input name="distrito" placeholder="Distrito y ciudad (ej. Miraflores, Lima)" required autocomplete="address-level2">
      <select name="pago"><option>Yape</option><option>Plin</option><option>Tarjeta (link de pago)</option><option>Transferencia bancaria</option><option>Contraentrega (solo Lima)</option></select>
      <button class="btn btn--wa btn--full">Finalizar compra por WhatsApp</button>
    </form>`;
}

function updateCounts() {
  $('#cart-count').textContent = state.cart.reduce((a, l) => a + l.qty, 0);
  $('#fav-count').textContent = state.favs.length;
}

/* ---------- Utilidades ---------- */
function toggle(sel, open) { $(sel).classList.toggle('open', open); $(sel).setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; }
function openDrawer(which) { state.drawer = which; renderDrawer(); toggle('#drawer', true); }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); }
function bump(sel) { const el = $(sel); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

/* ---------- Eventos ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  const fav = t.closest('[data-fav]');
  if (fav) {
    e.stopPropagation();
    const id = +fav.dataset.fav;
    state.favs = state.favs.includes(id) ? state.favs.filter((x) => x !== id) : [...state.favs, id];
    persist(); updateCounts(); renderProducts(); if ($('#drawer').classList.contains('open')) renderDrawer();
    if (state.favs.includes(id)) bump('#open-fav');
    return;
  }
  const open = t.closest('[data-open]');
  if (open) { toggle('#drawer', false); openModal(open.dataset.open); return; }
  if (t.closest('[data-cat]')) { state.cat = t.closest('[data-cat]').dataset.cat; renderNav(); renderProducts(); $('#catalogo').scrollIntoView({ behavior: 'smooth' }); }
  if (t.closest('[data-color]')) { state.modal.color = t.closest('[data-color]').dataset.color; renderModalOpts(); }
  if (t.closest('[data-size]')) { state.modal.size = t.closest('[data-size]').dataset.size; renderModalOpts(); }
  if (t.closest('[data-q]')) {
    const b = t.closest('[data-q]'), l = state.cart[b.dataset.q], max = find(l.id).sizes[l.size];
    l.qty = Math.min(max, l.qty + +b.dataset.d);
    if (l.qty <= 0) state.cart.splice(b.dataset.q, 1);
    persist(); updateCounts(); renderDrawer();
  }
  if (t.id === 'coupon-btn') {
    if (state.coupon) state.coupon = null;
    else {
      const code = $('#coupon-in').value.trim().toUpperCase();
      if (COUPONS[code]) state.coupon = code;
      else { $('#coupon-msg').textContent = '✗ Cupón no válido'; return; }
    }
    persist(); renderDrawer();
  }
  if (t.closest('[data-close]') || t.id === 'modal' || t.id === 'drawer') { toggle('#modal', false); toggle('#drawer', false); }
});

document.addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.target.id === 'news') { e.target.reset(); toast('¡Gracias! Revisa tu correo 💌'); return; }
  if (e.target.id !== 'co') return;
  const f = Object.fromEntries(new FormData(e.target)), t = calc();
  const lines = state.cart.map((l) => { const p = find(l.id); return `• ${l.qty} x ${p.name} (${l.color}, ${l.size}) — ${money(p.price * l.qty)}`; });
  const msg = ['🛍️ *Nuevo pedido — LÚA Boutique*', '', ...lines, '', `Subtotal: ${money(t.sub)}`,
    t.disc ? `Descuento (${state.coupon}): -${money(t.disc)}` : '', `Envío: ${t.ship ? money(t.ship) : 'Gratis'}`, `*Total: ${money(t.total)}*`, '',
    `👤 ${f.nombre}`, `📍 ${f.distrito}`, `💳 ${f.pago}`].filter(Boolean).join('\n');
  window.open(demoWaLink(msg), '_blank', 'noopener');
  state.cart = []; state.coupon = null; persist(); updateCounts(); toggle('#drawer', false);
  toast('¡Pedido enviado! Te contactamos para el pago 🎉');
});

$('#m-add').addEventListener('click', addToCart);
$('#open-cart').addEventListener('click', () => openDrawer('cart'));
$('#open-fav').addEventListener('click', () => openDrawer('favs'));
$('#search').addEventListener('input', renderProducts);
$('#sort').addEventListener('change', renderProducts);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { toggle('#modal', false); toggle('#drawer', false); } });

renderNav(); renderProducts(); updateCounts();
