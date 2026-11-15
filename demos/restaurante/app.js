const MENU = [
  { id: 1, cat: 'Ceviches', name: 'Ceviche clásico', desc: 'Pescado del día, leche de tigre, camote, choclo y cancha.', price: 35, emoji: '🐟', c: ['#d0ebff', '#1c7ed6'], tag: 'Más pedido' },
  { id: 2, cat: 'Ceviches', name: 'Ceviche mixto', desc: 'Pescado, pulpo, langostinos y conchas en leche de tigre.', price: 42, emoji: '🦐', c: ['#ffe3e3', '#fa5252'] },
  { id: 3, cat: 'Ceviches', name: 'Leche de tigre', desc: 'Concentrada, con trocitos de pescado y chicharrón de calamar.', price: 22, emoji: '🥛', c: ['#fff9db', '#fab005'], tag: 'Picante' },
  { id: 4, cat: 'Ceviches', name: 'Tiradito al ají amarillo', desc: 'Láminas finas de pescado en crema de ají amarillo.', price: 36, emoji: '🍋', c: ['#fff3bf', '#f59f00'] },
  { id: 5, cat: 'Entradas', name: 'Causa limeña', desc: 'Papa amarilla al ají, rellena de pollo o atún.', price: 18, emoji: '🥔', c: ['#fff3bf', '#fcc419'] },
  { id: 6, cat: 'Entradas', name: 'Anticuchos (2 palitos)', desc: 'Corazón de res a la parrilla, papa dorada y choclo.', price: 22, emoji: '🍢', c: ['#ffe8cc', '#e8590c'] },
  { id: 7, cat: 'Entradas', name: 'Papa a la huancaína', desc: 'Crema de queso y ají amarillo, huevo y aceituna.', price: 16, emoji: '🧀', c: ['#fff9db', '#f08c00'], tag: 'Veggie' },
  { id: 8, cat: 'Fondos', name: 'Lomo saltado', desc: 'Lomo fino al wok, cebolla, tomate, papas fritas y arroz.', price: 38, emoji: '🥩', c: ['#ffc9c9', '#c92a2a'], tag: 'Especial' },
  { id: 9, cat: 'Fondos', name: 'Ají de gallina', desc: 'Pechuga deshilachada en crema de ají amarillo, arroz y papa.', price: 28, emoji: '🍛', c: ['#fff3bf', '#e67700'] },
  { id: 10, cat: 'Fondos', name: 'Arroz con mariscos', desc: 'Arroz norteño con mariscos frescos y salsa criolla.', price: 40, emoji: '🥘', c: ['#ffe8cc', '#fd7e14'] },
  { id: 11, cat: 'Bebidas', name: 'Chicha morada 1 L', desc: 'Maíz morado, piña, canela y clavo. Hecha en casa.', price: 12, emoji: '🍇', c: ['#e5dbff', '#7048e8'] },
  { id: 12, cat: 'Bebidas', name: 'Limonada frozen 1 L', desc: 'Limón recién exprimido, opción con hierbabuena.', price: 12, emoji: '🍋', c: ['#ebfbee', '#40c057'] },
  { id: 13, cat: 'Bebidas', name: 'Gaseosa personal', desc: 'Inca Kola o Coca-Cola, 500 ml.', price: 5, emoji: '🥤', c: ['#fff3bf', '#fab005'] },
  { id: 14, cat: 'Postres', name: 'Picarones (4)', desc: 'Masa de zapallo y camote con miel de chancaca.', price: 14, emoji: '🍩', c: ['#e6ccb2', '#9c6644'] },
  { id: 15, cat: 'Postres', name: 'Suspiro a la limeña', desc: 'Manjar blanco con merengue al oporto.', price: 12, emoji: '🍮', c: ['#fff3bf', '#f08c00'] },
];
const ENVIO = 7, ENVIO_GRATIS = 80, HORA_ABRE = 12, HORA_CIERRA = 22;

const $ = (s) => document.querySelector(s);
const money = (n) => 'S/ ' + n.toLocaleString('es-PE');
let cart = load();
let currentCat = 'Todo';

function load() { try { return JSON.parse(localStorage.getItem('fogon22-cart')) || {}; } catch { return {}; } }
function save() { try { localStorage.setItem('fogon22-cart', JSON.stringify(cart)); } catch {} }

function renderTabs() {
  const cats = ['Todo', ...new Set(MENU.map((d) => d.cat))];
  $('#tabs').innerHTML = cats.map((c) => `<button class="tab${c === currentCat ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('');
}

function renderMenu() {
  const q = $('#search').value.trim().toLowerCase();
  const items = MENU.filter((d) => (currentCat === 'Todo' || d.cat === currentCat) &&
    (d.name + d.desc).toLowerCase().includes(q));
  $('#empty').hidden = items.length > 0;
  $('#grid').innerHTML = items.map((d) => `
    <article class="dish">
      <div class="dish__img" style="--c1:${d.c[0]};--c2:${d.c[1]}">${d.tag ? `<span class="dish__tag">${d.tag}</span>` : ''}${d.emoji}</div>
      <div class="dish__body">
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <div class="dish__foot">
          <span class="price">${money(d.price)}</span>
          ${cart[d.id]
            ? `<span class="qty"><button data-dec="${d.id}" aria-label="Quitar">−</button><b>${cart[d.id]}</b><button data-inc="${d.id}" aria-label="Agregar">+</button></span>`
            : `<button class="add" data-inc="${d.id}">Agregar</button>`}
        </div>
      </div>
    </article>`).join('');
}

function totals() {
  const sub = Object.entries(cart).reduce((s, [id, q]) => s + MENU.find((d) => d.id == id).price * q, 0);
  const pickup = document.querySelector('input[name="tipo"]:checked').value !== 'Delivery';
  const envio = sub === 0 || pickup || sub >= ENVIO_GRATIS ? 0 : ENVIO;
  return { sub, envio, total: sub + envio };
}

function renderCart() {
  const ids = Object.keys(cart);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  $('#cart-count').textContent = count;
  $('#cart-empty').hidden = ids.length > 0;
  $('#checkout').hidden = ids.length === 0;
  $('#lines').innerHTML = ids.map((id) => {
    const d = MENU.find((x) => x.id == id);
    return `<li class="line"><span class="line__emoji">${d.emoji}</span>
      <div><div class="line__name">${d.name}</div><div class="line__price">${money(d.price)} c/u · ${money(d.price * cart[id])}</div></div>
      <span class="qty"><button data-dec="${id}" aria-label="Quitar">−</button><b>${cart[id]}</b><button data-inc="${id}" aria-label="Agregar">+</button></span></li>`;
  }).join('');
  const t = totals();
  $('#subtotal').textContent = money(t.sub);
  $('#envio').textContent = t.envio ? money(t.envio) : 'Gratis';
  $('#total').textContent = money(t.total);
  const pickup = document.querySelector('input[name="tipo"]:checked').value !== 'Delivery';
  $('#direccion').hidden = pickup;
  $('#direccion').required = !pickup;
}

function render() { renderMenu(); renderCart(); save(); }

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1600);
}

function openCart(open) {
  $('#drawer').classList.toggle('open', open);
  $('#drawer').setAttribute('aria-hidden', !open);
}

document.addEventListener('click', (e) => {
  const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), tab = e.target.closest('.tab');
  if (inc) {
    const id = inc.dataset.inc; cart[id] = (cart[id] || 0) + 1;
    if (cart[id] === 1) toast('✓ Agregado: ' + MENU.find((d) => d.id == id).name);
    $('#open-cart').classList.remove('bump'); void $('#open-cart').offsetWidth; $('#open-cart').classList.add('bump');
    render();
  }
  if (dec) { const id = dec.dataset.dec; cart[id]--; if (cart[id] <= 0) delete cart[id]; render(); }
  if (tab) { currentCat = tab.dataset.cat; renderTabs(); renderMenu(); }
});
$('#search').addEventListener('input', renderMenu);
$('#open-cart').addEventListener('click', () => openCart(true));
$('#close-cart').addEventListener('click', () => openCart(false));
$('#drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer') openCart(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openCart(false); });
document.querySelectorAll('input[name="tipo"]').forEach((r) => r.addEventListener('change', renderCart));

$('#checkout').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const t = totals();
  const lines = Object.entries(cart).map(([id, q]) => {
    const d = MENU.find((x) => x.id == id);
    return `• ${q} x ${d.name} — ${money(d.price * q)}`;
  });
  const msg = [
    '🔥 *Nuevo pedido — Fogón 22*', '', ...lines, '',
    `Subtotal: ${money(t.sub)}`, `Envío: ${t.envio ? money(t.envio) : 'Gratis'}`, `*Total: ${money(t.total)}*`, '',
    `👤 ${f.nombre}`, `📦 ${f.tipo}`, f.tipo === 'Delivery' ? `📍 ${f.direccion}` : '',
    f.notas ? `📝 ${f.notas}` : '',
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  window.open(demoWaLink(msg), '_blank', 'noopener');
  cart = {}; render(); openCart(false); e.target.reset(); renderCart();
  toast('¡Pedido enviado! 🎉');
});

// Abierto / cerrado según la hora local
const h = new Date().getHours();
const open = h >= HORA_ABRE && h < HORA_CIERRA;
$('#status').textContent = open ? `Abierto ahora · cierra a las ${HORA_CIERRA}:00` : `Cerrado · abrimos a las ${HORA_ABRE}:00 (puedes dejar tu pedido programado)`;
$('#status').className = 'status ' + (open ? 'open' : 'closed');

renderTabs(); render();
