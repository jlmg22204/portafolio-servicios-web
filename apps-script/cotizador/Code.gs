/**
 * Cotizador automático con Google Apps Script — JM Dev
 *
 * Flujo: formulario web → fila en Google Sheets → PDF en Drive → correo al cliente con el PDF.
 * Extras: menú propio en la hoja, reenvío de cotizaciones y reporte semanal automático.
 *
 * Instalación: ver README.md de esta carpeta.
 */

const CONFIG = {
  empresa: 'Ferretería El Puerto',
  ruc: '20000000001',
  direccion: 'Av. Pardo 123, Chimbote',
  telefono: '913 718 392',
  correoCopia: '',          // correo que recibe copia de cada cotización (opcional)
  igv: 0.18,
  vigenciaDias: 7,
  carpetaPdf: 'Cotizaciones PDF',
  hojaProductos: 'Productos',
  hojaCotizaciones: 'Cotizaciones',
};

const COLUMNAS = ['N°', 'Fecha', 'Cliente', 'DNI/RUC', 'Correo', 'Teléfono', 'Detalle', 'Subtotal', 'IGV', 'Total', 'PDF', 'Estado'];

/* =========================================================
   Web app
   ========================================================= */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Cotizador · ' + CONFIG.empresa)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Lista de productos activos para el formulario. */
function getProductos() {
  const hoja = hoja_(CONFIG.hojaProductos);
  if (hoja.getLastRow() < 2) return [];
  const filas = hoja.getRange(2, 1, hoja.getLastRow() - 1, 4).getValues();
  return filas
    .filter((f) => f[0] && f[3] !== false)
    .map((f) => ({ codigo: String(f[0]), nombre: String(f[1]), precio: Number(f[2]) }));
}

/**
 * Crea la cotización: valida, calcula, guarda en Sheets, genera el PDF y lo envía por correo.
 * @param {{cliente:string, documento:string, correo:string, telefono:string, items:{codigo:string,cantidad:number}[]}} datos
 */
function crearCotizacion(datos) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // evita números duplicados si dos personas cotizan a la vez
  try {
    validar_(datos);
    const catalogo = Object.fromEntries(getProductos().map((p) => [p.codigo, p]));
    const items = datos.items
      .filter((i) => catalogo[i.codigo] && Number(i.cantidad) > 0)
      .map((i) => {
        const p = catalogo[i.codigo];
        const cantidad = Number(i.cantidad);
        return { ...p, cantidad, importe: redondear_(p.precio * cantidad) };
      });
    if (!items.length) throw new Error('Agrega al menos un producto.');

    // Precios con IGV incluido (como se publican en Perú): se desglosa la base imponible.
    const total = redondear_(items.reduce((s, i) => s + i.importe, 0));
    const subtotal = redondear_(total / (1 + CONFIG.igv));
    const igv = redondear_(total - subtotal);

    const hoja = hoja_(CONFIG.hojaCotizaciones);
    const numero = 'COT-' + String(hoja.getLastRow()).padStart(4, '0');
    const fecha = new Date();
    const cot = { numero, fecha, ...datos, items, subtotal, igv, total };

    const pdf = generarPdf_(cot);
    const detalle = items.map((i) => `${i.cantidad} x ${i.nombre}`).join('\n');
    hoja.appendRow([numero, fecha, datos.cliente, datos.documento, datos.correo, datos.telefono,
      detalle, subtotal, igv, total, pdf.getUrl(), 'Enviada']);

    enviarCorreo_(cot, pdf);
    return { numero, total, pdfUrl: pdf.getUrl() };
  } finally {
    lock.releaseLock();
  }
}

/* =========================================================
   PDF y correo
   ========================================================= */

function generarPdf_(cot) {
  const plantilla = HtmlService.createTemplateFromFile('Pdf');
  plantilla.cot = cot;
  plantilla.cfg = CONFIG;
  plantilla.fmt = soles_;
  plantilla.fechaTxt = Utilities.formatDate(cot.fecha, 'America/Lima', 'dd/MM/yyyy');
  const vence = new Date(cot.fecha.getTime() + CONFIG.vigenciaDias * 864e5);
  plantilla.venceTxt = Utilities.formatDate(vence, 'America/Lima', 'dd/MM/yyyy');

  const blob = Utilities.newBlob(plantilla.evaluate().getContent(), 'text/html', cot.numero + '.html')
    .getAs('application/pdf')
    .setName(`${cot.numero} - ${cot.cliente}.pdf`);
  return carpeta_().createFile(blob);
}

function enviarCorreo_(cot, pdf) {
  const cuerpo =
    `<p>Hola ${escapar_(cot.cliente)},</p>` +
    `<p>Gracias por cotizar con <b>${CONFIG.empresa}</b>. Adjuntamos tu cotización <b>${cot.numero}</b> ` +
    `por un total de <b>${soles_(cot.total)}</b>, válida por ${CONFIG.vigenciaDias} días.</p>` +
    `<p>Para confirmar tu pedido responde este correo o escríbenos al WhatsApp ${CONFIG.telefono}.</p>` +
    `<p>Saludos,<br>${CONFIG.empresa}</p>`;
  const correo = {
    to: cot.correo,
    subject: `Cotización ${cot.numero} · ${CONFIG.empresa}`,
    htmlBody: cuerpo,
    attachments: [pdf.getAs(MimeType.PDF)],
    name: CONFIG.empresa,
  };
  if (CONFIG.correoCopia) correo.cc = CONFIG.correoCopia;
  MailApp.sendEmail(correo);
}

/* =========================================================
   Menú en la hoja, reenvío y reporte semanal
   ========================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Cotizador')
    .addItem('Reenviar cotización seleccionada', 'reenviarSeleccionada')
    .addItem('Enviarme el reporte ahora', 'enviarReporteSemanal')
    .addSeparator()
    .addItem('Activar reporte semanal (lunes 8 a.m.)', 'activarReporteSemanal')
    .addToUi();
}

function reenviarSeleccionada() {
  const hoja = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  const fila = hoja.getActiveRange().getRow();
  if (hoja.getName() !== CONFIG.hojaCotizaciones || fila < 2) {
    ui.alert('Selecciona una fila de la hoja "' + CONFIG.hojaCotizaciones + '".');
    return;
  }
  const v = hoja.getRange(fila, 1, 1, COLUMNAS.length).getValues()[0];
  const archivo = DriveApp.getFileById(v[10].match(/[-\w]{25,}/)[0]);
  MailApp.sendEmail({
    to: v[4],
    subject: `Recordatorio: cotización ${v[0]} · ${CONFIG.empresa}`,
    htmlBody: `<p>Hola ${escapar_(v[2])}, te reenviamos tu cotización <b>${v[0]}</b> por <b>${soles_(v[9])}</b>. ` +
      `¿Te ayudamos a confirmar tu pedido?</p><p>${CONFIG.empresa} · WhatsApp ${CONFIG.telefono}</p>`,
    attachments: [archivo.getAs(MimeType.PDF)],
    name: CONFIG.empresa,
  });
  hoja.getRange(fila, 12).setValue('Reenviada ' + Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM'));
  ui.alert('Cotización ' + v[0] + ' reenviada a ' + v[4]);
}

/** Resumen de los últimos 7 días al dueño de la hoja. */
function enviarReporteSemanal() {
  const hoja = hoja_(CONFIG.hojaCotizaciones);
  const desde = new Date(Date.now() - 7 * 864e5);
  const filas = hoja.getLastRow() > 1
    ? hoja.getRange(2, 1, hoja.getLastRow() - 1, COLUMNAS.length).getValues().filter((f) => f[1] >= desde)
    : [];
  const total = filas.reduce((s, f) => s + Number(f[9]), 0);
  const top = filas.slice().sort((a, b) => b[9] - a[9]).slice(0, 5)
    .map((f) => `<li>${f[0]} · ${escapar_(f[2])} · ${soles_(f[9])}</li>`).join('');
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: `📊 Reporte semanal de cotizaciones · ${CONFIG.empresa}`,
    htmlBody: `<h2>Últimos 7 días</h2><p><b>${filas.length}</b> cotizaciones por <b>${soles_(total)}</b>.</p>` +
      (top ? `<p>Las más grandes:</p><ol>${top}</ol>` : '<p>No hubo cotizaciones esta semana.</p>') +
      `<p><a href="${SpreadsheetApp.getActive().getUrl()}">Abrir la hoja</a></p>`,
  });
}

function activarReporteSemanal() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'enviarReporteSemanal')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('enviarReporteSemanal').timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).inTimezone('America/Lima').create();
  SpreadsheetApp.getUi().alert('Listo: recibirás el reporte cada lunes a las 8 a.m.');
}

/* =========================================================
   Instalación: ejecutar UNA vez desde el editor
   ========================================================= */

function configurarHoja() {
  const ss = SpreadsheetApp.getActive();
  let p = ss.getSheetByName(CONFIG.hojaProductos);
  if (!p) {
    p = ss.insertSheet(CONFIG.hojaProductos);
    p.appendRow(['Código', 'Producto', 'Precio (S/ inc. IGV)', 'Activo']);
    [
      ['CEM-01', 'Cemento Sol tipo I (bolsa 42.5 kg)', 31.5],
      ['FIE-12', 'Fierro corrugado 1/2" x 9 m', 38.9],
      ['LAD-KK', 'Ladrillo King Kong 18 huecos (millar)', 950],
      ['ARE-GR', 'Arena gruesa (m³)', 65],
      ['PIN-LT', 'Pintura látex blanco (galón)', 48],
      ['PVC-04', 'Tubo PVC desagüe 4" x 3 m', 29.9],
      ['CAL-ZN', 'Calamina zincada 0.25 mm x 3.6 m', 27.5],
      ['CLA-03', 'Clavos de 3" (kg)', 7.5],
    ].forEach((r) => p.appendRow([...r, true]));
    p.getRange('C2:C').setNumberFormat('"S/" #,##0.00');
    p.getRange('D2:D').insertCheckboxes();
    estilizar_(p);
  }
  let c = ss.getSheetByName(CONFIG.hojaCotizaciones);
  if (!c) {
    c = ss.insertSheet(CONFIG.hojaCotizaciones, 0);
    c.appendRow(COLUMNAS);
    c.getRange('B2:B').setNumberFormat('dd/MM/yyyy HH:mm');
    c.getRange('H2:J').setNumberFormat('"S/" #,##0.00');
    c.setColumnWidth(7, 280);
    estilizar_(c);
  }
  carpeta_();
  const hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hoja1 && ss.getSheets().length > 2) ss.deleteSheet(hoja1);
  SpreadsheetApp.getUi().alert('Hojas listas. Ahora implementa la app web (Implementar → Nueva implementación).');
}

/* =========================================================
   Utilidades
   ========================================================= */

function hoja_(nombre) {
  const h = SpreadsheetApp.getActive().getSheetByName(nombre);
  if (!h) throw new Error(`Falta la hoja "${nombre}". Ejecuta configurarHoja().`);
  return h;
}

function carpeta_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('CARPETA_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* fue borrada: se crea otra */ }
  }
  const carpeta = DriveApp.createFolder(CONFIG.carpetaPdf);
  props.setProperty('CARPETA_ID', carpeta.getId());
  return carpeta;
}

function validar_(d) {
  if (!d || !String(d.cliente || '').trim()) throw new Error('Escribe el nombre del cliente.');
  if (!/^\d{8}$|^\d{11}$/.test(String(d.documento || ''))) throw new Error('DNI (8 dígitos) o RUC (11 dígitos) no válido.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.correo || ''))) throw new Error('Correo no válido.');
  if (!Array.isArray(d.items)) throw new Error('Agrega al menos un producto.');
}

function estilizar_(hoja) {
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, hoja.getLastColumn())
    .setFontWeight('bold').setBackground('#0b1020').setFontColor('#ffffff');
  hoja.autoResizeColumns(1, hoja.getLastColumn());
}

function redondear_(n) { return Math.round(n * 100) / 100; }
function soles_(n) { return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function escapar_(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
