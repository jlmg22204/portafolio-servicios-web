const MENU = [
  { id: 1, cat: 'Tacos', name: 'Tacos al pastor (3)', desc: 'Cerdo marinado al trompo, piña, cebolla y cilantro.', price: 75, emoji: '🌮', c: ['#ffd8a8', '#ff922b'], tag: 'Más pedido' },
  { id: 2, cat: 'Tacos', name: 'Tacos de suadero (3)', desc: 'Suadero dorado en su jugo, salsa verde cruda.', price: 80, emoji: '🌮', c: ['#ffe8cc', '#fd7e14'] },
  { id: 3, cat: 'Tacos', name: 'Tacos de birria (3)', desc: 'Con consomé para dipear, queso Oaxaca gratinado.', price: 110, emoji: '🌮', c: ['#ffc9c9', '#e03131'], tag: 'Picante' },
  { id: 4, cat: 'Tacos', name: 'Tacos de coliflor (3)', desc: 'Coliflor rostizada al pastor, opción vegetariana.', price: 70, emoji: '🥦', c: ['#d3f9d8', '#40c057'], tag: 'Veggie' },
  { id: 5, cat: 'Antojitos', name: 'Quesadilla de flor de calabaza', desc: 'Tortilla de maíz azul hecha a mano, queso y flor.', price: 55, emoji: '🫓', c: ['#fff3bf', '#fab005'] },
  { id: 6, cat: 'Antojitos', name: 'Sopes de tinga (2)', desc: 'Frijol, tinga de pollo, crema, queso fresco.', price: 65, emoji: '🫔', c: ['#ffe8cc', '#e8590c'] },
  { id: 7, cat: 'Antojitos', name: 'Guacamole con totopos', desc: 'Aguacate al momento, chile serrano y limón.', price: 90, emoji: '🥑', c: ['#d8f5a2', '#74b816'] },
  { id: 8, cat: 'Platos fuertes', name: 'Arrachera al fogón', desc: '300 g, cebollitas, nopal asado, frijoles y tortillas.', price: 245, emoji: '🥩', c: ['#ffc9c9', '#c92a2a'], tag: 'Especial' },
  { id: 9, cat: 'Platos fuertes', name: 'Enchiladas suizas', desc: 'Pollo, salsa verde cremosa, gratinadas.', price: 145, emoji: '🫕', c: ['#e9fac8', '#82c91e'] },
  { id: 10, cat: 'Platos fuertes', name: 'Pozole rojo', desc: 'Cerdo, maíz cacahuazintle, tostadas y guarniciones.', price: 135, emoji: '🍲', c: ['#ffe3e3', '#f03e3e'] },
  { id: 11, cat: 'Bebidas', name: 'Agua de horchata 1 L', desc: 'Receta de la casa con canela.', price: 45, emoji: '🥛', c: ['#f8f9fa', '#ced4da'] },
  { id: 12, cat: 'Bebidas', name: 'Agua de jamaica 1 L', desc: 'Natural, poco dulce.', price: 45, emoji: '🍹', c: ['#ffdeeb', '#d6336c'] },
  { id: 13, cat: 'Bebidas', name: 'Refresco de vidrio', desc: 'Varios sabores, 355 ml.', price: 30, emoji: '🥤', c: ['#d0ebff', '#1c7ed6'] },
  { id: 14, cat: 'Postres', name: 'Churros con chocolate', desc: '5 churros recién hechos, chocolate caliente.', price: 70, emoji: '🍫', c: ['#e6ccb2', '#7f5539'] },
  { id: 15, cat: 'Postres', name: 'Flan napolitano', desc: 'Cremoso, con caramelo de piloncillo.', price: 55, emoji: '🍮', c: ['#fff3bf', '#f08c00'] },
];
const ENVIO = 35, ENVIO_GRATIS = 300, HORA_ABRE = 13, HORA_CIERRA = 23;

const $ = (s) => document.querySelector(s);
const money = (n) => '$' + n.toLocaleString('es-MX');
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
  const pickup = document.querySelector('input[name="tipo"]:checked').value !== 'Entrega a domicilio';
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
  const pickup = document.querySelector('input[name="tipo"]:checked').value !== 'Entrega a domicilio';
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
    if (cart[id] === 1) toast('✓ ' + MENU.find((d) => d.id == id).name + ' agregado');
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
    `👤 ${f.nombre}`, `📦 ${f.tipo}`, f.tipo === 'Entrega a domicilio' ? `📍 ${f.direccion}` : '',
    f.notas ? `📝 ${f.notas}` : '',
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  window.open(demoWaLink(msg), '_blank', 'noopener');
  cart = {}; render(); openCart(false); e.target.reset(); renderCart();
  toast('¡Pedido enviado! 🎉');
});

// Abierto / cerrado según la hora local
const h = new Date().getHours();
const open = h >= HORA_ABRE && h < HORA_CIERRA;
$('#status').textContent = open ? `Abierto ahora · cierra a las ${HORA_CIERRA}:00` : `Cerrado · abrimos a las ${HORA_ABRE}:00 (puedes programar tu pedido)`;
$('#status').className = 'status ' + (open ? 'open' : 'closed');

renderTabs(); render();
