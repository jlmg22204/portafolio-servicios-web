const SERVICES = [
  { id: 'valoracion', icon: '🩺', name: 'Valoración general', desc: 'Revisión completa, diagnóstico y plan de tratamiento.', min: 30, price: 50 },
  { id: 'limpieza', icon: '✨', name: 'Limpieza dental', desc: 'Profilaxis con ultrasonido y pulido.', min: 45, price: 120 },
  { id: 'resina', icon: '🦷', name: 'Resinas (caries)', desc: 'Restauraciones del color de tu diente.', min: 60, price: 150 },
  { id: 'ortodoncia', icon: '😬', name: 'Ortodoncia', desc: 'Brackets y alineadores invisibles.', min: 30, price: 80 },
  { id: 'blanqueamiento', icon: '💎', name: 'Blanqueamiento', desc: 'Resultados visibles en una sesión.', min: 90, price: 600 },
  { id: 'urgencia', icon: '🚑', name: 'Urgencia dental', desc: 'Dolor, fractura o inflamación.', min: 30, price: 90 },
];
const DOCTORS = [
  { id: 'any', name: 'Cualquier especialista disponible', emoji: '🧑‍⚕️', role: '' },
  { id: 'ana', name: 'Dra. Ana Ruiz', emoji: '👩‍⚕️', role: 'Odontología general y estética' },
  { id: 'luis', name: 'Dr. Luis Mendoza', emoji: '👨‍⚕️', role: 'Ortodoncia' },
  { id: 'sofia', name: 'Dra. Sofía Herrera', emoji: '👩‍⚕️', role: 'Endodoncia y urgencias' },
];
// Horario: Lun–Vie 9–19, Sáb 9–14, Dom cerrado. Intervalos de 30 min.
const HOURS = { 0: null, 6: [9, 14], default: [9, 19] };
const STORE = 'sonrie-citas';

const $ = (s) => document.querySelector(s);
const state = { svc: null, doctor: 'any', date: null, time: null };
const fmtDate = (d) => d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function booked() { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } }
function saveBooking(b) { try { localStorage.setItem(STORE, JSON.stringify([...booked(), b])); } catch {} }

// Pseudo-aleatorio determinista para simular agenda ocupada
function seeded(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 100) / 100; }

function slotsFor(date) {
  const range = HOURS[date.getDay()] === undefined ? HOURS.default : HOURS[date.getDay()];
  if (!range) return [];
  const now = new Date(), out = [], mine = booked();
  for (let h = range[0]; h < range[1]; h++) for (const m of [0, 30]) {
    const t = `${String(h).padStart(2, '0')}:${m ? '30' : '00'}`;
    const dt = new Date(date); dt.setHours(h, m, 0, 0);
    const past = dt < new Date(now.getTime() + 60 * 60 * 1000);
    const busy = seeded(key(date) + t + state.doctor) < 0.35 || mine.some((b) => b.date === key(date) && b.time === t && (b.doctor === state.doctor || state.doctor === 'any'));
    out.push({ t, disabled: past || busy });
  }
  return out;
}

/* ---------- Render ---------- */
$('#services').innerHTML = SERVICES.map((s) => `
  <article class="svc"><div class="svc__i">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p>
  <div class="svc__meta"><span>⏱ ${s.min} min</span><span>desde S/ ${s.price.toLocaleString('es-PE')}</span></div></article>`).join('');

$('#team').innerHTML = DOCTORS.slice(1).map((d) => `
  <article class="doc"><div class="doc__img">${d.emoji}</div><div class="doc__b"><h3>${d.name}</h3><p>${d.role}</p></div></article>`).join('');

$('#svc-opts').innerHTML = SERVICES.map((s) => `
  <button type="button" class="opt" data-svc="${s.id}"><span style="font-size:1.5rem">${s.icon}</span><span><b>${s.name}</b><small>${s.min} min · desde S/ ${s.price.toLocaleString('es-PE')}</small></span></button>`).join('');

$('#doctor').innerHTML = DOCTORS.map((d) => `<option value="${d.id}">${d.name}${d.role ? ' — ' + d.role : ''}</option>`).join('');

function renderDays() {
  const days = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) { const d = new Date(today); d.setDate(d.getDate() + i); days.push(d); }
  $('#days').innerHTML = days.map((d) => {
    const free = slotsFor(d).some((s) => !s.disabled);
    return `<button type="button" class="day${state.date === key(d) ? ' sel' : ''}" data-day="${key(d)}" ${free ? '' : 'disabled'}>
      <small>${d.toLocaleDateString('es-PE', { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('es-PE', { month: 'short' })}</small></button>`;
  }).join('');
  if (!state.date) { const first = $('#days .day:not([disabled])'); if (first) state.date = first.dataset.day, first.classList.add('sel'); }
  renderSlots();
}

function renderSlots() {
  const d = new Date(state.date + 'T00:00:00');
  $('#slots').innerHTML = slotsFor(d).map((s) =>
    `<button type="button" class="slot${state.time === s.t ? ' sel' : ''}" data-time="${s.t}" ${s.disabled ? 'disabled' : ''}>${s.t}</button>`).join('');
  $('#to3').disabled = !state.time;
}

function go(step) {
  document.querySelectorAll('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel != step));
  document.querySelectorAll('.steps li').forEach((li) => {
    li.classList.toggle('is-active', li.dataset.step == step);
    li.classList.toggle('is-done', li.dataset.step < step);
  });
  if (step === 2) renderDays();
  if (step === 3) {
    const s = SERVICES.find((x) => x.id === state.svc), doc = DOCTORS.find((x) => x.id === state.doctor);
    $('#summary').innerHTML = `<span>${s.icon} <b>${s.name}</b> · ${s.min} min</span>
      <span>📅 ${fmtDate(new Date(state.date + 'T00:00:00'))} · <b>${state.time} h</b></span><span>${doc.emoji} ${doc.name}</span>`;
  }
  $('#booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Eventos ---------- */
document.addEventListener('click', (e) => {
  const svc = e.target.closest('[data-svc]'), day = e.target.closest('[data-day]'),
        slot = e.target.closest('[data-time]'), next = e.target.closest('[data-next]');
  if (svc) {
    state.svc = svc.dataset.svc;
    document.querySelectorAll('.opt').forEach((o) => o.classList.toggle('sel', o === svc));
    $('#to2').disabled = false;
  }
  if (day && !day.disabled) {
    state.date = day.dataset.day; state.time = null;
    document.querySelectorAll('.day').forEach((d) => d.classList.toggle('sel', d === day));
    renderSlots();
  }
  if (slot && !slot.disabled) { state.time = slot.dataset.time; renderSlots(); }
  if (next) go(+next.dataset.next);
});
$('#doctor').addEventListener('change', (e) => { state.doctor = e.target.value; state.time = null; });

$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const s = SERVICES.find((x) => x.id === state.svc), doc = DOCTORS.find((x) => x.id === state.doctor);
  const fecha = fmtDate(new Date(state.date + 'T00:00:00'));
  saveBooking({ date: state.date, time: state.time, doctor: state.doctor, svc: state.svc });
  const msg = ['🦷 *Nueva cita — Clínica Dental Sonríe*', '',
    `Servicio: ${s.name}`, `Fecha: ${fecha}`, `Hora: ${state.time} h`, `Especialista: ${doc.name}`, '',
    `Paciente: ${f.nombre}`, `WhatsApp: ${f.tel}`, f.primera, f.motivo ? `Motivo: ${f.motivo}` : ''].filter(Boolean).join('\n');
  $('#done-text').innerHTML = `<b>${f.nombre.split(' ')[0]}</b>, te esperamos el <b>${fecha}</b> a las <b>${state.time} h</b> para tu ${s.name.toLowerCase()}.`;
  window.open(demoWaLink(msg), '_blank', 'noopener');
  go(4);
});

$('#again').addEventListener('click', () => {
  Object.assign(state, { svc: null, date: null, time: null });
  document.querySelectorAll('.opt').forEach((o) => o.classList.remove('sel'));
  $('#to2').disabled = true; $('#form').reset(); go(1);
});

// Preseleccionar servicio desde la tarjeta "Servicios"
document.querySelectorAll('.svc').forEach((card, i) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => { document.querySelector(`[data-svc="${SERVICES[i].id}"]`).click(); go(1); });
});
