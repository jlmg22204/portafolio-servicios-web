/* =========================================================
   CONFIGURACIÓN — cambia estos datos por los tuyos
   ========================================================= */
const CONFIG = {
  // Número de WhatsApp en formato internacional, sin "+" ni espacios. Ej: 5215512345678
  whatsapp: '5210000000000',
  saludo: 'Hola, vi tu trabajo en redes y me interesa una cotización.',
};

const waLink = (text) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

/* ---------- Origen del visitante (UTM) ----------
   Comparte enlaces como: https://tusitio.com/?utm_source=instagram&utm_campaign=reel_tienda
   y sabrás qué red social te trae clientes. */
const params = new URLSearchParams(location.search);
const utmSource = params.get('utm_source');
const utmCampaign = params.get('utm_campaign');

document.addEventListener('DOMContentLoaded', () => {
  // Año del footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Enlaces de WhatsApp
  const origenTxt = utmSource ? ` (Te encontré en ${utmSource})` : '';
  ['wa-direct', 'wa-float'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = waLink(CONFIG.saludo + origenTxt);
  });

  // Preseleccionar origen en el formulario según UTM
  if (utmSource) {
    const select = document.querySelector('select[name="origen"]');
    const match = [...select.options].find(
      (o) => o.text.toLowerCase() === utmSource.toLowerCase()
    );
    if (match) select.value = match.value;
  }

  // Menú móvil
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('is-open'))
  );

  // Filtros del portafolio
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project');
  filters.forEach((btn) =>
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      projects.forEach((p) =>
        p.classList.toggle('is-hidden', f !== 'all' && p.dataset.cat !== f)
      );
    })
  );

  // Botones de planes: preseleccionan el servicio
  document.querySelectorAll('[data-plan]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const map = { Despegue: 'Landing page', Negocio: 'Tienda en línea', 'A medida': 'Sistema a medida' };
      document.querySelector('select[name="servicio"]').value = map[btn.dataset.plan] || '';
    })
  );

  // Formulario → mensaje armado para WhatsApp
  const form = document.getElementById('lead-form');
  const msg = form.querySelector('.form__msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nombre.trim() || !d.servicio) {
      msg.textContent = 'Por favor escribe tu nombre y elige un servicio.';
      return;
    }
    const texto = [
      `Hola, soy ${d.nombre}${d.negocio ? ` de ${d.negocio}` : ''}.`,
      `Me interesa: ${d.servicio}.`,
      d.mensaje ? `Detalles: ${d.mensaje}` : '',
      `Te encontré en: ${d.origen}${utmCampaign ? ` (${utmCampaign})` : ''}.`,
    ].filter(Boolean).join('\n');
    msg.textContent = '¡Listo! Abriendo WhatsApp…';
    window.open(waLink(texto), '_blank', 'noopener');
    form.reset();
  });

  // Contadores animados
  const counters = document.querySelectorAll('[data-count]');
  const animate = (el) => {
    const end = +el.dataset.count;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Aparición al hacer scroll
  const revealables = document.querySelectorAll('.card, .project, .steps li, .plan, blockquote');
  revealables.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        if (en.target.dataset.count) animate(en.target);
        io.unobserve(en.target);
      }),
    { threshold: 0.15 }
  );
  revealables.forEach((el) => io.observe(el));
  counters.forEach((el) => io.observe(el));
});
