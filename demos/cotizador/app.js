/* Simulación del cotizador con Google Apps Script.
   La versión real está en /apps-script/cotizador (usa Sheets, Drive y Gmail). */
const EMPRESA = { nombre: 'Ferretería El Puerto', ruc: '20000000001', direccion: 'Av. Pardo 123, Chimbote', tel: '913 718 392' };
const PRODUCTOS = [
  { codigo: 'CEM-01', nombre: 'Cemento Sol tipo I (bolsa 42.5 kg)', precio: 31.5 },
  { codigo: 'FIE-12', nombre: 'Fierro corrugado 1/2" x 9 m', precio: 38.9 },
  { codigo: 'LAD-KK', nombre: 'Ladrillo King Kong 18 huecos (millar)', precio: 950 },
  { codigo: 'ARE-GR', nombre: 'Arena gruesa (m³)', precio: 65 },
  { codigo: 'PIN-LT', nombre: 'Pintura látex blanco (galón)', precio: 48 },
  { codigo: 'PVC-04', nombre: 'Tubo PVC desagüe 4" x 3 m', precio: 29.9 },
  { codigo: 'CAL-ZN', nombre: 'Calamina zincada 0.25 mm x 3.6 m', precio: 27.5 },
  { codigo: 'CLA-03', nombre: 'Clavos de 3" (kg)', precio: 7.5 },
];
// URL de la app web real (Implementar → URL que termina en /exec). Vacío = botón oculto.
const REAL_URL = 'https://script.google.com/macros/s/AKfycbwd1faIW5MPbyVzEBD_w8VC3zPSdWMgT9imWtk0XTt2iUR2CIJ_xOVxHjv2FM1qzD9h/exec';
const IGV = 0.18, VIGENCIA = 7, KEY = 'cotizador-demo';
const SEED = [
  { numero: 'COT-0001', fecha: '2026-11-10T09:12', cliente: 'Inversiones Santa Rosa EIRL', documento: '20612345671', total: 1840.5 },
  { numero: 'COT-0002', fecha: '2026-11-12T16:40', cliente: 'Carlos Mendoza', documento: '41234567', total: 389.4 },
];

const $ = (s) => document.querySelector(s);
const soles = (n) => 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round = (n) => Math.round(n * 100) / 100;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtFecha = (d) => new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtHora = (d) => new Date(d).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
const qty = {};
let rows = load();
let last = null;

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || SEED.slice(); } catch { return SEED.slice(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch {} }

/* ---------- Formulario ---------- */
function renderProds() {
  $('#prods').innerHTML = PRODUCTOS.map((p) => `
    <div class="prod${qty[p.codigo] ? ' on' : ''}">
      <span>${p.nombre}<small>${soles(p.precio)}</small></span>
      <span class="qty"><button type="button" data-d="-1" data-c="${p.codigo}" aria-label="Menos">−</button><input type="number" min="0" value="${qty[p.codigo] || 0}" data-c="${p.codigo}" aria-label="Cantidad de ${p.nombre}"><button type="button" data-d="1" data-c="${p.codigo}" aria-label="Más">+</button></span>
    </div>`).join('');
  renderTotal();
}
const items = () => PRODUCTOS.filter((p) => qty[p.codigo] > 0).map((p) => ({ ...p, cantidad: qty[p.codigo], importe: round(p.precio * qty[p.codigo]) }));
function renderTotal() { $('#total').textContent = soles(items().reduce((s, i) => s + i.importe, 0)); }

$('#prods').addEventListener('click', (e) => {
  const b = e.target.closest('[data-d]'); if (!b) return;
  qty[b.dataset.c] = Math.max(0, (qty[b.dataset.c] || 0) + +b.dataset.d);
  renderProds();
});
$('#prods').addEventListener('input', (e) => {
  if (!e.target.dataset.c) return;
  qty[e.target.dataset.c] = Math.max(0, parseInt(e.target.value, 10) || 0);
  e.target.closest('.prod').classList.toggle('on', qty[e.target.dataset.c] > 0);
  renderTotal();
});

$('#fill').addEventListener('click', () => {
  const f = $('#form');
  f.cliente.value = 'Constructora Los Pinos SAC'; f.documento.value = '20601234567';
  f.telefono.value = '987 654 321'; f.correo.value = 'compras@lospinos.pe';
  Object.assign(qty, { 'CEM-01': 40, 'FIE-12': 25, 'ARE-GR': 3, 'CLA-03': 5 });
  renderProds();
});

/* ---------- Generar ---------- */
function validar(d) {
  if (!d.cliente.trim()) return 'Escribe el nombre del cliente.';
  if (!/^\d{8}$|^\d{11}$/.test(d.documento)) return 'DNI (8 dígitos) o RUC (11 dígitos) no válido.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.correo)) return 'Correo no válido.';
  if (!items().length) return 'Agrega al menos un producto.';
  return '';
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

$('#form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  d.documento = d.documento.replace(/\D/g, '');
  const err = validar(d);
  $('#error').textContent = err;
  if (err) return;

  const its = items();
  const total = round(its.reduce((s, i) => s + i.importe, 0));
  const subtotal = round(total / (1 + IGV));
  const numero = 'COT-' + String(rows.length + 1).padStart(4, '0');
  last = { ...d, numero, fecha: new Date().toISOString(), items: its, total, subtotal, igv: round(total - subtotal) };

  $('#submit').disabled = true;
  const steps = $('#steps'); steps.hidden = false;
  steps.querySelectorAll('p').forEach((p) => (p.className = ''));
  const run = async (n, fn) => { const p = steps.querySelector(`[data-s="${n}"]`); p.className = 'run'; await wait(750); fn(); p.className = 'done'; };

  await run(1, () => { rows.push({ numero, fecha: last.fecha, cliente: d.cliente, documento: d.documento, total }); save(); renderSheet(numero); show('sheet'); });
  await run(2, () => { renderPdf(); ping('pdf'); });
  await run(3, () => { renderMail(); ping('mail'); });

  toast(`✓ ${numero} enviada a ${d.correo}`);
  $('#submit').disabled = false;
  e.target.reset(); Object.keys(qty).forEach((k) => delete qty[k]); renderProds();
});

/* ---------- Vistas ---------- */
function renderSheet(nuevo) {
  $('#sheet-body').innerHTML = rows.map((r, i) => `
    <tr class="${r.numero === nuevo ? 'new' : ''}"><td>${i + 2}</td><td>${r.numero}</td><td>${fmtFecha(r.fecha)} ${fmtHora(r.fecha)}</td>
    <td>${esc(r.cliente)}</td><td>${r.documento}</td><td>${soles(r.total)}</td><td><a href="#" data-pdf="${r.numero}">${r.numero}.pdf</a></td><td><span class="st">Enviada</span></td></tr>`).join('');
  const sum = rows.reduce((s, r) => s + r.total, 0);
  $('#k-count').textContent = rows.length;
  $('#k-sum').textContent = soles(sum);
  $('#k-avg').textContent = soles(rows.length ? sum / rows.length : 0);
  const sc = $('.gs__scroll'); sc.scrollTop = sc.scrollHeight;
}

function renderPdf() {
  const c = last, vence = new Date(Date.parse(c.fecha) + VIGENCIA * 864e5);
  $('#pdf').innerHTML = `
    <div class="pdf__head"><div><div class="pdf__emp">${EMPRESA.nombre}</div>
      <div class="pdf__muted">RUC ${EMPRESA.ruc} · ${EMPRESA.direccion} · Tel. ${EMPRESA.tel}</div></div>
      <div class="pdf__box">COTIZACIÓN<b>${c.numero}</b></div></div>
    <p><b>Cliente:</b> ${esc(c.cliente)} · <b>DNI/RUC:</b> ${c.documento}<br><b>Correo:</b> ${esc(c.correo)}${c.telefono ? ` · <b>Teléfono:</b> ${esc(c.telefono)}` : ''}<br>
      <b>Fecha:</b> ${fmtFecha(c.fecha)} · <b>Válida hasta:</b> ${fmtFecha(vence)}</p>
    <table><tr><th>Código</th><th>Descripción</th><th class="r">Cant.</th><th class="r">P. unit.</th><th class="r">Importe</th></tr>
      ${c.items.map((i) => `<tr><td>${i.codigo}</td><td>${i.nombre}</td><td class="r">${i.cantidad}</td><td class="r">${soles(i.precio)}</td><td class="r">${soles(i.importe)}</td></tr>`).join('')}</table>
    <div class="pdf__tot"><p><span>Op. gravada</span><span>${soles(c.subtotal)}</span></p><p><span>IGV (18%)</span><span>${soles(c.igv)}</span></p>
      <p class="g"><span>TOTAL</span><span>${soles(c.total)}</span></p></div>
    <div class="pdf__foot">Precios incluyen IGV. Cotización válida por ${VIGENCIA} días, sujeta a stock. Documento generado automáticamente con Google Apps Script.</div>`;
  $('#pdf-empty').hidden = true; $('#pdf-wrap').hidden = false;
}

function renderMail() {
  const c = last;
  $('#mail').innerHTML = `
    <div class="mail__top"><div class="mail__subj">Cotización ${c.numero} · ${EMPRESA.nombre}</div>
      <div class="mail__from"><span class="mail__av">FE</span><div><b>${EMPRESA.nombre}</b><br><span style="color:var(--muted)">para ${esc(c.correo)} · ahora</span></div></div></div>
    <div class="mail__body"><p>Hola ${esc(c.cliente)},</p>
      <p>Gracias por cotizar con <b>${EMPRESA.nombre}</b>. Adjuntamos tu cotización <b>${c.numero}</b> por un total de <b>${soles(c.total)}</b>, válida por ${VIGENCIA} días.</p>
      <p>Para confirmar tu pedido responde este correo o escríbenos al WhatsApp ${EMPRESA.tel}.</p>
      <p>Saludos,<br>${EMPRESA.nombre}</p>
      <div><button class="mail__att" type="button" data-open-pdf><span>PDF</span>${c.numero} - ${esc(c.cliente)}.pdf</button></div></div>`;
  $('#mail-empty').hidden = true; $('#mail').hidden = false;
}

function show(tab) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.view').forEach((v) => (v.hidden = v.dataset.view !== tab));
}
function ping(tab) { const t = document.querySelector(`.tab[data-tab="${tab}"]`); t.classList.remove('ping'); void t.offsetWidth; t.classList.add('ping'); }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }

document.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab'); if (tab) show(tab.dataset.tab);
  if (e.target.closest('[data-open-pdf]')) show('pdf');
  const a = e.target.closest('[data-pdf]');
  if (a) { e.preventDefault(); if (last && a.dataset.pdf === last.numero) show('pdf'); else toast('En la versión real, este enlace abre el PDF guardado en Google Drive.'); }
});
$('#print').addEventListener('click', () => window.print());
$('#reset').addEventListener('click', () => { rows = SEED.slice(); save(); renderSheet(); toast('Datos del demo reiniciados'); });

if (REAL_URL) { const b = $('#real'); b.href = REAL_URL; b.hidden = false; }
renderProds(); renderSheet();
