/* Banner superior que identifica el sitio como proyecto demo y lleva al portafolio.
   Cambia DEMO_CONFIG con tus datos: se usa en los tres demos. */
const DEMO_CONFIG = {
  autor: 'JM Dev',
  // WhatsApp de destino para los pedidos/citas de los demos (formato internacional sin "+")
  whatsapp: '51913718392',
  portafolio: '../../index.html#portafolio',
};

const demoWaLink = (text) =>
  `https://wa.me/${DEMO_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

(function () {
  const bar = document.createElement('div');
  bar.setAttribute('role', 'note');
  bar.style.cssText = [
    'position:sticky', 'top:0', 'z-index:1000', 'display:flex', 'flex-wrap:wrap',
    'gap:.4rem 1rem', 'align-items:center', 'justify-content:center', 'padding:.55rem 1rem',
    'background:#0b1020', 'color:#e6e9f5', 'font:500 13px/1.4 system-ui,sans-serif',
    'text-align:center', 'border-bottom:1px solid rgba(255,255,255,.12)',
  ].join(';');
  bar.innerHTML =
    `<span>🧪 Proyecto demo creado por <strong>${DEMO_CONFIG.autor}</strong> · Desarrollo Web Full Stack</span>` +
    `<a href="${DEMO_CONFIG.portafolio}" style="color:#22d3ee;font-weight:700;text-decoration:none">¿Quieres uno así para tu negocio? →</a>`;
  document.body.prepend(bar);
  document.documentElement.style.setProperty('--demo-bar', bar.offsetHeight + 'px');
})();
