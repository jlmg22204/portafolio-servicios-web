# Cotizador automático con Google Apps Script

Formulario web → **fila en Google Sheets** → **PDF en Google Drive** → **correo al cliente con el PDF adjunto**.
También incluye un **menú propio en la hoja** para reenviar cotizaciones y un **reporte semanal automático** por correo.

Demo simulada (para mostrar en redes): `demos/cotizador/` del sitio.

## Archivos

| Archivo | Qué hace |
|---|---|
| `Code.gs` | Lógica: productos, cálculo con IGV, guardado en Sheets, PDF, correo, menú, reporte semanal |
| `Index.html` | Formulario web que ve el cliente |
| `Pdf.html` | Plantilla del PDF de la cotización |
| `appsscript.json` | Zona horaria (America/Lima), permisos y configuración de la app web |

## Instalación (10 minutos)

1. Crea una hoja nueva en <https://sheets.new> y ponle de nombre **"Cotizador – Ferretería El Puerto"**.
2. Menú **Extensiones → Apps Script**.
3. En el editor:
   - Reemplaza el contenido de `Código.gs` por el de **`Code.gs`**.
   - Botón **＋ → HTML**, nombre `Index` → pega **`Index.html`**.
   - Botón **＋ → HTML**, nombre `Pdf` → pega **`Pdf.html`**.
   - ⚙️ **Configuración del proyecto** → marca *"Mostrar el archivo de manifiesto appsscript.json"* → pega **`appsscript.json`**.
4. Edita el bloque `CONFIG` al inicio de `Code.gs` (nombre de la empresa, RUC, dirección, teléfono).
5. Selecciona la función **`configurarHoja`** y pulsa **Ejecutar**. Acepta los permisos.
   (Google mostrará "Google no verificó esta app": es normal en scripts propios → *Configuración avanzada → Ir a…*).
   Se crean las hojas **Cotizaciones** y **Productos** con 8 productos de ejemplo y la carpeta **"Cotizaciones PDF"** en tu Drive.
6. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Copia la **URL de la aplicación web**: ese es el enlace del cotizador.
7. Vuelve a la hoja y recarga: aparece el menú **⚙️ Cotizador**. Usa *"Activar reporte semanal"* si quieres el resumen de cada lunes.

## Pruébalo

1. Abre la URL de la app web, llena tus datos con **tu propio correo** y elige productos.
2. En segundos verás: la fila nueva en **Cotizaciones**, el PDF en la carpeta de Drive y el correo con el PDF adjunto.
3. Selecciona la fila en la hoja → **⚙️ Cotizador → Reenviar cotización seleccionada**.

## Cómo venderlo a clientes

- Se adapta a cualquier negocio que cotiza: ferreterías, imprentas, talleres, distribuidoras, eventos, transporte.
- El cliente **no paga servidor**: corre en su propia cuenta de Google.
- Precio sugerido: **S/ 600** (paquete de 3 automatizaciones: cotización en PDF, reenvío y reporte semanal) o **desde S/ 900** si incluye inventario o más hojas.

## Problemas frecuentes

| Mensaje / síntoma | Solución |
|---|---|
| "Google no verificó esta app" | Normal en scripts propios: *Configuración avanzada → Ir a Cotizador (no seguro) → Permitir*. |
| `Falta la hoja "Productos"` | No se ejecutó `configurarHoja`. Ejecútala desde el editor. |
| `No HTML file named Index/Pdf was found` | Los archivos HTML deben llamarse exactamente `Index` y `Pdf` (sin `.html`, con mayúscula). |
| La app web muestra "Necesitas permiso" | En la implementación, "Quién tiene acceso" debe ser **Cualquier usuario**. |
| Cambié el código y la app web no cambia | *Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar*. La URL se mantiene. |
| No aparece el menú ⚙️ Cotizador | Recarga la hoja (F5) y espera unos segundos. |
| No llega el correo | Revisa Spam y la cuota diaria de correos. Mira el error en *Ejecuciones* (ícono ☰▶ del editor). |

## Límites a tener en cuenta

- Cuota de correos de Google: ~100 destinatarios/día con cuenta gratuita de Gmail y ~1,500/día con Google Workspace.
- Cada ejecución puede durar hasta 6 minutos (de sobra para una cotización).
- Los precios de la hoja **Productos** se consideran con IGV incluido; el PDF desglosa la base imponible y el IGV (18%).
- La cotización no es un comprobante electrónico SUNAT. Para emitir boletas o facturas se integra con un proveedor de facturación electrónica (OSE/PSE).
