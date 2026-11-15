# Portafolio y plan de ventas — Desarrollador Web Full Stack

Landing page profesional + plan completo para **vender servicios de desarrollo web en redes sociales** (Facebook, Instagram, TikTok, LinkedIn y WhatsApp Business).

**Stack de la landing:** HTML5 · CSS3 · JavaScript (sin dependencias) · lista para GitHub Pages.

---

## 📁 Estructura

```
├── index.html                      # Landing / portafolio (destino de todos los enlaces de redes)
├── css/styles.css                  # Estilos responsivos, modo oscuro
├── js/main.js                      # WhatsApp, formulario, filtros, UTM, animaciones
├── img/                            # Favicon e imagen para compartir (Open Graph)
├── demos/
│   ├── demo-banner.js              # Banner "Proyecto demo" + WhatsApp de los demos (DEMO_CONFIG)
│   ├── restaurante/                # Fogón 22: menú digital, carrito y pedido a WhatsApp
│   ├── clinica/                    # Sonríe: agenda de citas en 3 pasos con horarios disponibles
│   └── tienda/                     # LÚA Boutique: catálogo, tallas, cupones y checkout
├── docs/
│   ├── 01-plan-marketing-redes.md  # Estrategia completa: posicionamiento, contenido, embudo, ads, plan 90 días
│   ├── 02-calendario-30-dias.csv   # Calendario de publicaciones (ábrelo en Excel / Google Sheets)
│   ├── 03-guiones-venta.md         # Bios, copys, respuestas de WhatsApp, objeciones, seguimiento
│   ├── 04-tablero-kpis.csv         # Registro semanal de métricas
│   ├── 05-plantilla-propuesta.md   # Plantilla de cotización para clientes
│   ├── 06-precios.md               # Investigación de mercado (Chimbote/Perú) y tarifas
│   └── 07-crear-redes.md           # Guía paso a paso para crear cada red + primeras publicaciones
├── marca/                          # Logo, portadas, destacadas y publicaciones listas para subir
└── .github/workflows/pages.yml     # Publicación automática en GitHub Pages
```

## ✅ Primeros pasos

1. **Personaliza tus datos**
   - `js/main.js` → `CONFIG.whatsapp` con tu número en formato internacional (ej. `5215512345678`).
   - `index.html` → reemplaza enlaces de redes (`TU_PAGINA`, `TU_USUARIO`).
   - Sustituye los proyectos de ejemplo del portafolio y los testimonios por los reales.
2. **Publica la web**: en GitHub → *Settings → Pages → Source: GitHub Actions*. Cada `push` a `main` actualiza el sitio en `https://jlmg22204.github.io/portafolio-servicios-web/`.
3. **Configura tus redes** siguiendo la sección 3 de [`docs/01-plan-marketing-redes.md`](docs/01-plan-marketing-redes.md).
4. **Usa enlaces con UTM** en cada red (ej. `?utm_source=instagram&utm_campaign=bio`): el origen llega automáticamente en el mensaje de WhatsApp.
5. **Sigue el calendario** de [`docs/02-calendario-30-dias.csv`](docs/02-calendario-30-dias.csv) y registra resultados cada semana en `docs/04-tablero-kpis.csv`.

## 🧩 Funciones de la landing

- Diseño responsivo y rápido (sin frameworks, ideal para PageSpeed 90+).
- Botón flotante y formulario que arman el mensaje de WhatsApp con los datos del prospecto.
- Detección de origen (`utm_source`, `utm_campaign`) para saber qué red trae clientes.
- Portafolio con filtros por categoría y formato *Reto → Solución → Resultado*.
- Planes, proceso de trabajo, testimonios y preguntas frecuentes (resuelven objeciones antes de la venta).
- Etiquetas Open Graph para que el enlace se vea profesional al compartirlo en Facebook y WhatsApp.

## 🧪 Proyectos demo

| Demo | Qué muestra | Enlace |
|---|---|---|
| 🔥 Fogón 22 (restaurante) | Carta peruana con buscador y categorías, carrito, envío gratis automático, delivery/recojo, pedido a WhatsApp | `/demos/restaurante/` |
| 🦷 Sonríe (clínica dental) | Reserva en 3 pasos, especialistas, días y horarios disponibles/ocupados, confirmación | `/demos/clinica/` |
| 🌙 LÚA (boutique) | Catálogo con filtros y orden, vista rápida, colores y tallas con stock, favoritos, cupones (`LUA10`), checkout | `/demos/tienda/` |

Cambia `DEMO_CONFIG` en `demos/demo-banner.js` con tu nombre y WhatsApp. Cada demo da material para varias publicaciones: graba la pantalla del celular usando el flujo completo.

## 🗺️ Siguientes mejoras sugeridas

- [ ] Agregar Meta Pixel y Google Analytics 4.
- [ ] Versión Laravel con formulario que guarde leads en base de datos y panel para gestionarlos.
- [ ] Dominio propio (ej. `tunombre.dev`).
