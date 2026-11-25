// Genera los dos flujos de n8n en JSON listos para importar
// (n8n → Workflows → Import from File). Es la misma definición que está
// creada en la instancia de prueba, con dos diferencias a propósito:
//   - El ID de la hoja y el chat de Telegram son marcadores (REEMPLAZAR_…).
//   - No lleva credenciales: se eligen en n8n después de importar.
// Así el JSON compartido no contiene secretos ni identificadores privados.
//
//   node n8n/build.mjs

import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const SHEET = 'REEMPLAZAR_CON_ID_DE_LA_HOJA';
const CHAT = 'REEMPLAZAR_CON_CHAT_ID_DE_PRUEBA';
const ORIGINS = 'http://localhost:5173,http://localhost:4173';

/* ---------- piezas ---------- */

const doc = { __rl: true, mode: 'id', value: SHEET };
const tab = (value) => ({ __rl: true, mode: 'name', value });
const col = (id) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true });
// Posiciones en el lienzo (las mismas de la instancia de prueba).
const POS = {"Formulario del landing": [0, 288], "Validar solicitud": [224, 288], "¿Solicitud válida?": [448, 288], "Guardar en Solicitudes": [672, 192], "Historial: solicitud creada": [896, 192], "Responder 201: guardada": [1120, 192], "Avisar al chat de prueba": [1344, 192], "Marcar aviso enviado": [1568, 0], "Marcar aviso fallido": [1568, 192], "Responder 500: no se guardó": [1568, 384], "Responder 422: revisar campos": [672, 384], "Panel: petición": [0, 608], "Leer petición": [224, 608], "¿Es inicio de sesión?": [448, 608], "Buscar administrador": [672, 96], "Preparar verificación": [896, 96], "Hash de la clave": [1120, 96], "¿Credenciales correctas?": [1344, 96], "Generar token": [1568, 96], "Hash del token nuevo": [1792, 96], "Guardar sesión": [2016, 96], "Responder: sesión iniciada": [2240, 0], "Responder 500: sesión no guardada": [2240, 192], "Responder 401: credenciales": [1568, 288], "Hash del token recibido": [672, 992], "Buscar sesión": [896, 992], "Validar sesión": [1120, 992], "¿Sesión vigente?": [1344, 992], "Según la acción": [1568, 816], "Leer solicitudes": [1792, 384], "Armar lista": [2016, 384], "Responder: lista": [2240, 384], "Leer solicitud": [1792, 576], "Leer historial": [2016, 576], "Armar detalle": [2240, 576], "Responder: detalle": [2464, 576], "Leer solicitud a cambiar": [1792, 864], "Calcular cambios": [2016, 864], "¿Cambios válidos?": [2240, 864], "Actualizar estado": [2464, 768], "Filas de historial": [2688, 768], "Guardar historial": [2912, 768], "Responder: cambios guardados": [3136, 576], "Responder 500: historial no guardado": [3136, 768], "Responder 500: cambio no guardado": [3136, 960], "Responder: cambio rechazado": [2464, 960], "Cerrar sesión": [1792, 1056], "Responder: sesión cerrada": [2016, 1056], "Responder 400: acción desconocida": [1792, 1248], "Responder 401: sin sesión": [1568, 1104]};

const opts = { caseSensitive: true, leftValue: '', typeValidation: 'strict' };
const isTrue = (left) => ({ leftValue: left, operator: { type: 'boolean', operation: 'true', singleValue: true } });
const strEq = (left, right) => ({ leftValue: left, operator: { type: 'string', operation: 'equals' }, rightValue: right });

function wf(name, description, settings = {}) {
  const nodes = [];
  const connections = {};
  let x = 0;
  const api = {
    node(name, type, typeVersion, parameters, extra = {}) {
      nodes.push({ id: randomUUID(), name, type, typeVersion, position: POS[name] ?? [x, 0], parameters, ...extra });
      x += 220;
      return name;
    },
    /** Conecta from[output] → to. */
    link(from, to, output = 0) {
      const outs = (connections[from] ??= { main: [] }).main;
      while (outs.length <= output) outs.push([]);
      outs[output].push({ node: to, type: 'main', index: 0 });
    },
    build: () => ({ name, nodes, connections, settings: { executionOrder: 'v1', ...settings }, meta: { description } }),
  };
  return api;
}

const sheets = (operation, sheetName, extra = {}) => ({
  resource: 'sheet',
  operation,
  authentication: 'oAuth2',
  documentId: doc,
  sheetName: tab(sheetName),
  ...extra,
});
const write = (sheetName, operation, value, schema, matchingColumns) =>
  sheets(operation, sheetName, {
    columns: { mappingMode: 'defineBelow', value, schema: schema.map(col), ...(matchingColumns ? { matchingColumns } : {}) },
    options: { cellFormat: 'RAW' }, // Sheets no interpreta fórmulas ni convierte teléfonos o fechas
  });
const read = (sheetName, filters, firstMatch) =>
  sheets('read', sheetName, {
    ...(filters ? { filtersUI: { values: filters } } : {}),
    options: firstMatch ? { returnFirstMatch: true } : {},
  });
const respond = (body, code) => ({ respondWith: 'json', responseBody: body, options: { responseCode: code } });
const webhook = (path) => ({ httpMethod: 'POST', path, responseMode: 'responseNode', options: { allowedOrigins: ORIGINS } });

/* =========================================================
   Flujo 1 · Recibir solicitud y avisar
   ========================================================= */

const VALIDAR = `// Mismas reglas que src/lib/lead.js del landing: aquí se vuelven a aplicar.
const PROGRAMAS = { ignition: 'Ignition', booster: 'Booster', liftoff: 'Liftoff', odyssey: 'Odyssey', nebula: 'Nebula' };
const b = $json.body || {};
const limpiar = (v) => (typeof v === 'string' ? v.trim().replace(/\\s+/g, ' ') : '');
const nombre = limpiar(b.name);
const correo = limpiar(b.email).toLowerCase();
const programa = limpiar(b.program);
const telefono = limpiar(b.phone);
const errores = {};
if (b.website) errores.form = 'No pudimos procesar la solicitud.';
if (!nombre) errores.name = 'Escribe tu nombre.';
else if (nombre.length < 2) errores.name = 'El nombre debe tener al menos 2 caracteres.';
else if (nombre.length > 100) errores.name = 'El nombre admite hasta 100 caracteres.';
if (!correo) errores.email = 'Escribe tu correo electrónico.';
else if (correo.length > 254 || !/^[^\\s@]+@[^\\s@.]+(\\.[^\\s@.]+)+$/.test(correo)) errores.email = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
if (!programa) errores.program = 'Elige el programa que te interesa.';
else if (!PROGRAMAS[programa]) errores.program = 'Elige uno de los programas de la lista.';
if (telefono) {
  const digitos = telefono.replace(/\\D/g, '').length;
  if (telefono.length > 20 || !/^\\+?[\\d\\s().-]+$/.test(telefono) || digitos < 7 || digitos > 15)
    errores.phone = 'Escribe un teléfono válido (solo números, de 7 a 15 dígitos) o déjalo vacío.';
}
if (Object.keys(errores).length) return { json: { valido: false, errores } };
const ahora = new Date();
const id = 'S-' + ahora.toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
// Texto del aviso, escapado para parse_mode HTML. El teléfono solo si existe.
const e = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lineas = ['<b>Nueva solicitud de información</b> (' + id + ')', '',
  '<b>Nombre:</b> ' + e(nombre), '<b>Correo:</b> ' + e(correo), '<b>Programa:</b> ' + e(PROGRAMAS[programa])];
if (telefono) lineas.push('<b>Teléfono:</b> ' + e(telefono));
lineas.push('', 'Búscala en el panel con el código ' + id + '.');
return { json: {
  valido: true, id, fecha: ahora.toISOString(), nombre, correo,
  programa: PROGRAMAS[programa], telefono, estado: 'Nuevo', aviso: 'pendiente',
  mensaje: lineas.join('\\n'),
} };`;

function flujoSolicitud() {
  const w = wf(
    'AI Academy · 1 · Recibir solicitud y avisar',
    'Recibe el formulario del landing, valida, guarda en Google Sheets y avisa a un chat privado de prueba en Telegram.',
  );
  const v = '$("Validar solicitud").item.json';
  const hook = w.node('Formulario del landing', 'n8n-nodes-base.webhook', 2.1, webhook('aia-solicitud'), { webhookId: randomUUID() });
  const validar = w.node('Validar solicitud', 'n8n-nodes-base.code', 2, { mode: 'runOnceForEachItem', jsCode: VALIDAR });
  const valida = w.node('¿Solicitud válida?', 'n8n-nodes-base.if', 2.2, {
    conditions: { options: opts, conditions: [isTrue('={{ $json.valido }}')], combinator: 'and' },
  });
  const r422 = w.node('Responder 422: revisar campos', 'n8n-nodes-base.respondToWebhook', 1.5,
    respond('={{ JSON.stringify({ ok: false, error: "Revisa los campos marcados.", fields: $json.errores }) }}', 422));
  const guardar = w.node(
    'Guardar en Solicitudes', 'n8n-nodes-base.googleSheets', 4.7,
    write('Solicitudes', 'append', {
      id: '={{ $json.id }}', fecha: '={{ $json.fecha }}', nombre: '={{ $json.nombre }}', correo: '={{ $json.correo }}',
      programa: '={{ $json.programa }}', telefono: '={{ $json.telefono }}', estado: '={{ $json.estado }}',
      actualizado: '={{ $json.fecha }}', aviso: '={{ $json.aviso }}',
    }, ['id', 'fecha', 'nombre', 'correo', 'programa', 'telefono', 'estado', 'actualizado', 'aviso']),
    { onError: 'continueErrorOutput' },
  );
  const r500 = w.node('Responder 500: no se guardó', 'n8n-nodes-base.respondToWebhook', 1.5,
    respond('{ "ok": false, "error": "No pudimos guardar tu solicitud. Intenta de nuevo en unos minutos." }', 500));
  const hist = w.node(
    'Historial: solicitud creada', 'n8n-nodes-base.googleSheets', 4.7,
    write('Historial', 'append', {
      fecha: `={{ ${v}.fecha }}`, solicitud_id: `={{ ${v}.id }}`, campo: 'creación', antes: '', despues: 'Nuevo', quien: 'Formulario del landing',
    }, ['fecha', 'solicitud_id', 'campo', 'antes', 'despues', 'quien']),
    { onError: 'continueRegularOutput' },
  );
  const r201 = w.node('Responder 201: guardada', 'n8n-nodes-base.respondToWebhook', 1.5,
    respond(`={{ JSON.stringify({ ok: true, id: ${v}.id }) }}`, 201));
  const tg = w.node(
    'Avisar al chat de prueba', 'n8n-nodes-base.telegram', 1.2,
    {
      resource: 'message', operation: 'sendMessage', chatId: CHAT, text: `={{ ${v}.mensaje }}`,
      additionalFields: { parse_mode: 'HTML', appendAttribution: false, disable_web_page_preview: true },
    },
    { onError: 'continueErrorOutput', webhookId: randomUUID() },
  );
  const marca = (estado) =>
    w.node(`Marcar aviso ${estado}`, 'n8n-nodes-base.googleSheets', 4.7,
      write('Solicitudes', 'update', { id: `={{ ${v}.id }}`, aviso: estado }, ['id', 'aviso'], ['id']));
  const ok = marca('enviado');
  const ko = marca('fallido');

  w.link(hook, validar);
  w.link(validar, valida);
  w.link(valida, guardar, 0);
  w.link(valida, r422, 1);
  w.link(guardar, hist, 0);
  w.link(guardar, r500, 1); // sin guardado no hay aviso
  w.link(hist, r201);
  w.link(r201, tg);
  w.link(tg, ok, 0);
  w.link(tg, ko, 1);
  return w.build();
}

/* =========================================================
   Flujo 2 · API del panel
   ========================================================= */

const code = {
  leer: `const b = $json.body || {};
const s = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const acciones = ['login', 'listar', 'detalle', 'actualizar', 'salir'];
return { json: {
  accion: acciones.includes(b.accion) ? b.accion : 'desconocida',
  usuario: s(b.usuario, 60).toLowerCase(),
  clave: typeof b.clave === 'string' ? b.clave.slice(0, 200) : '',
  token: s(b.token, 200),
  id: s(b.id, 40),
  estado: s(b.estado, 40),
  nota: s(b.nota, 2001),
} };`,
  verificar: `const p = $('Leer petición').item.json;
const a = $json || {};
const activo = ['si', 'sí', 'true', '1', 'x'].includes(String(a.activo ?? '').trim().toLowerCase());
const existe = Boolean(a.usuario && a.salt && a.hash && activo && p.clave);
// Si el usuario no existe se calcula igual un hash, para no revelar cuáles existen.
return { json: {
  existe,
  material: (existe ? String(a.salt) : 'sin-usuario') + p.clave,
  esperado: existe ? String(a.hash).toLowerCase() : 'x',
  usuario: String(a.usuario || ''),
  nombre: String(a.nombre || a.usuario || ''),
} };`,
  sesion: `const p = $('Leer petición').item.json;
const s = $json || {};
const vigente = Boolean(s.token_hash && s.expira && Date.parse(s.expira) > Date.now());
return { json: { ...p, clave: undefined, token: undefined, valida: vigente,
  admin: vigente ? String(s.nombre || s.usuario) : '', token_hash: $('Hash del token recibido').item.json.token_hash } };`,
  lista: `const leads = $input.all().map((i) => i.json).filter((r) => r.id)
  .map((r) => ({ id: String(r.id), fecha: r.fecha, nombre: r.nombre, correo: r.correo, programa: r.programa,
    telefono: r.telefono ? String(r.telefono) : '', estado: r.estado, actualizado: r.actualizado, aviso: r.aviso }))
  .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
return [{ json: { ok: true, admin: $('Validar sesión').first().json.admin, leads } }];`,
  detalle: `const r = $('Leer solicitud').first().json || {};
if (!r.id) return [{ json: { codigo: 404, cuerpo: { ok: false, error: 'No encontramos esa solicitud.' } } }];
const historial = $input.all().map((i) => i.json).filter((h) => h.fecha)
  .map((h) => ({ fecha: h.fecha, campo: h.campo, antes: h.antes ?? '', despues: h.despues ?? '', quien: h.quien }))
  .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
const lead = { id: String(r.id), fecha: r.fecha, nombre: r.nombre, correo: r.correo, programa: r.programa,
  telefono: r.telefono ? String(r.telefono) : '', estado: r.estado, actualizado: r.actualizado, aviso: r.aviso };
return [{ json: { codigo: 200, cuerpo: { ok: true, lead, historial } } }];`,
  cambios: `const ESTADOS = ['Nuevo', 'Contactado', 'En seguimiento', 'Cerrado'];
const p = $('Validar sesión').first().json;
const r = $input.first().json || {};
const fallo = (codigo, error) => [{ json: { listo: false, codigo, cuerpo: { ok: false, error } } }];
if (p.estado && !ESTADOS.includes(p.estado)) return fallo(422, 'Estado no válido.');
if (p.nota.length > 2000) return fallo(422, 'La nota admite hasta 2000 caracteres.');
if (!r.id) return fallo(404, 'No encontramos esa solicitud.');
const ahora = new Date().toISOString();
const filas = [];
const nuevoEstado = p.estado && p.estado !== r.estado ? p.estado : r.estado;
if (nuevoEstado !== r.estado) filas.push({ fecha: ahora, solicitud_id: String(r.id), campo: 'estado', antes: r.estado, despues: nuevoEstado, quien: p.admin });
if (p.nota) filas.push({ fecha: ahora, solicitud_id: String(r.id), campo: 'nota', antes: '', despues: p.nota, quien: p.admin });
if (!filas.length) return fallo(422, 'No hay cambios: elige otro estado o escribe una nota.');
return [{ json: { listo: true, id: String(r.id), estado: nuevoEstado, actualizado: ahora, filas } }];`,
  filas: `return $('Calcular cambios').first().json.filas.map((f) => ({ json: f }));`,
};

function flujoPanel() {
  // Las ejecuciones llevan contraseñas y tokens en la entrada: no se guardan.
  const w = wf(
    'AI Academy · 2 · API del panel de solicitudes',
    'Inicio de sesión, lista, detalle, cambios de estado, notas e historial del panel sobre Google Sheets.',
    { saveDataSuccessExecution: 'none', saveDataErrorExecution: 'none', saveManualExecutions: false },
  );
  const R = 'n8n-nodes-base.respondToWebhook';
  const S = 'n8n-nodes-base.googleSheets';
  const C = 'n8n-nodes-base.crypto';
  const sha = (value, dataPropertyName) => ({ action: 'hash', type: 'SHA256', value, dataPropertyName, encoding: 'hex' });
  const ifNode = (name, conditions) => w.node(name, 'n8n-nodes-base.if', 2.2, { conditions: { options: opts, conditions, combinator: 'and' } });
  const always = { alwaysOutputData: true };

  const hook = w.node('Panel: petición', 'n8n-nodes-base.webhook', 2.1, webhook('aia-panel'), { webhookId: randomUUID() });
  const leer = w.node('Leer petición', 'n8n-nodes-base.code', 2, { mode: 'runOnceForEachItem', jsCode: code.leer });
  const esLogin = ifNode('¿Es inicio de sesión?', [strEq('={{ $json.accion }}', 'login')]);

  // login
  const admin = w.node('Buscar administrador', S, 4.7, read('Administradores', [{ lookupColumn: 'usuario', lookupValue: '={{ $json.usuario || "-" }}' }], true), always);
  const verif = w.node('Preparar verificación', 'n8n-nodes-base.code', 2, { mode: 'runOnceForEachItem', jsCode: code.verificar });
  const hClave = w.node('Hash de la clave', C, 2, sha('={{ $json.material }}', 'calculado'));
  const correcta = ifNode('¿Credenciales correctas?', [isTrue('={{ $json.existe }}'), strEq('={{ $json.calculado }}', '={{ $json.esperado }}')]);
  const gen = w.node('Generar token', C, 2, { action: 'generate', encodingType: 'hex', stringLength: 64, dataPropertyName: 'token' });
  const hNuevo = w.node('Hash del token nuevo', C, 2, sha('={{ $json.token }}', 'token_hash'));
  const guardarSes = w.node('Guardar sesión', S, 4.7,
    write('Sesiones', 'append', {
      token_hash: '={{ $json.token_hash }}', usuario: '={{ $json.usuario }}', nombre: '={{ $json.nombre }}',
      expira: '={{ $now.plus(8, "hours").toUTC().toISO() }}',
    }, ['token_hash', 'usuario', 'nombre', 'expira']),
    { onError: 'continueErrorOutput' });
  const rLogin = w.node('Responder: sesión iniciada', R, 1.5,
    respond('={{ JSON.stringify({ ok: true, token: $("Hash del token nuevo").item.json.token, nombre: $("Hash del token nuevo").item.json.nombre }) }}', 200));
  const rSesErr = w.node('Responder 500: sesión no guardada', R, 1.5, respond('{ "ok": false, "error": "No pudimos iniciar sesión. Intenta de nuevo." }', 500));
  const r401cred = w.node('Responder 401: credenciales', R, 1.5, respond('{ "ok": false, "error": "Usuario o contraseña incorrectos." }', 401));

  // sesión
  const hRecibido = w.node('Hash del token recibido', C, 2, sha('={{ $json.token || "sin-token" }}', 'token_hash'));
  const buscarSes = w.node('Buscar sesión', S, 4.7, read('Sesiones', [{ lookupColumn: 'token_hash', lookupValue: '={{ $json.token_hash }}' }], true), always);
  const validarSes = w.node('Validar sesión', 'n8n-nodes-base.code', 2, { mode: 'runOnceForEachItem', jsCode: code.sesion });
  const vigente = ifNode('¿Sesión vigente?', [isTrue('={{ $json.valida }}')]);
  const r401 = w.node('Responder 401: sin sesión', R, 1.5, respond('{ "ok": false, "error": "Inicia sesión para continuar." }', 401));
  const regla = (k) => ({ outputKey: k, conditions: { options: opts, conditions: [strEq('={{ $json.accion }}', k)], combinator: 'and' } });
  const accion = w.node('Según la acción', 'n8n-nodes-base.switch', 3.2, {
    rules: { values: ['listar', 'detalle', 'actualizar', 'salir'].map(regla) },
    options: { fallbackOutput: 'extra', renameFallbackOutput: 'Desconocida' },
  });
  const r400 = w.node('Responder 400: acción desconocida', R, 1.5, respond('{ "ok": false, "error": "Acción no válida." }', 400));

  // listar
  const todas = w.node('Leer solicitudes', S, 4.7, read('Solicitudes'), always);
  const lista = w.node('Armar lista', 'n8n-nodes-base.code', 2, { mode: 'runOnceForAllItems', jsCode: code.lista });
  const rLista = w.node('Responder: lista', R, 1.5, respond('={{ JSON.stringify($json) }}', 200));

  // detalle
  const una = w.node('Leer solicitud', S, 4.7, read('Solicitudes', [{ lookupColumn: 'id', lookupValue: '={{ $json.id || "-" }}' }], true), always);
  const historial = w.node('Leer historial', S, 4.7,
    read('Historial', [{ lookupColumn: 'solicitud_id', lookupValue: '={{ $("Validar sesión").first().json.id || "-" }}' }]),
    { ...always, executeOnce: true });
  const detalle = w.node('Armar detalle', 'n8n-nodes-base.code', 2, { mode: 'runOnceForAllItems', jsCode: code.detalle });
  const rDetalle = w.node('Responder: detalle', R, 1.5, respond('={{ JSON.stringify($json.cuerpo) }}', '={{ $json.codigo }}'));

  // actualizar
  const aCambiar = w.node('Leer solicitud a cambiar', S, 4.7, read('Solicitudes', [{ lookupColumn: 'id', lookupValue: '={{ $json.id || "-" }}' }], true), always);
  const cambios = w.node('Calcular cambios', 'n8n-nodes-base.code', 2, { mode: 'runOnceForAllItems', jsCode: code.cambios });
  const listos = ifNode('¿Cambios válidos?', [isTrue('={{ $json.listo }}')]);
  const rRechazo = w.node('Responder: cambio rechazado', R, 1.5, respond('={{ JSON.stringify($json.cuerpo) }}', '={{ $json.codigo }}'));
  const actualizar = w.node('Actualizar estado', S, 4.7,
    write('Solicitudes', 'update', { id: '={{ $json.id }}', estado: '={{ $json.estado }}', actualizado: '={{ $json.actualizado }}' }, ['id', 'estado', 'actualizado'], ['id']),
    { onError: 'continueErrorOutput' });
  const rCambioErr = w.node('Responder 500: cambio no guardado', R, 1.5, respond('{ "ok": false, "error": "No se guardaron los cambios. Intenta de nuevo." }', 500));
  const filas = w.node('Filas de historial', 'n8n-nodes-base.code', 2, { mode: 'runOnceForAllItems', jsCode: code.filas });
  const guardarHist = w.node('Guardar historial', S, 4.7,
    write('Historial', 'append', {
      fecha: '={{ $json.fecha }}', solicitud_id: '={{ $json.solicitud_id }}', campo: '={{ $json.campo }}',
      antes: '={{ $json.antes }}', despues: '={{ $json.despues }}', quien: '={{ $json.quien }}',
    }, ['fecha', 'solicitud_id', 'campo', 'antes', 'despues', 'quien']),
    { onError: 'continueErrorOutput' });
  const rGuardado = w.node('Responder: cambios guardados', R, 1.5, respond('{ "ok": true }', 200), { executeOnce: true });
  const rHistErr = w.node('Responder 500: historial no guardado', R, 1.5,
    respond('{ "ok": false, "error": "El estado se guardó, pero el historial no. Vuelve a abrir la solicitud y revisa." }', 500));

  // salir
  const cerrar = w.node('Cerrar sesión', S, 4.7,
    write('Sesiones', 'update', { token_hash: '={{ $json.token_hash }}', expira: '1970-01-01T00:00:00.000Z' }, ['token_hash', 'expira'], ['token_hash']),
    { onError: 'continueRegularOutput' });
  const rSalir = w.node('Responder: sesión cerrada', R, 1.5, respond('{ "ok": true }', 200));

  w.link(hook, leer);
  w.link(leer, esLogin);
  w.link(esLogin, admin, 0);
  w.link(esLogin, hRecibido, 1);
  w.link(admin, verif);
  w.link(verif, hClave);
  w.link(hClave, correcta);
  w.link(correcta, gen, 0);
  w.link(correcta, r401cred, 1);
  w.link(gen, hNuevo);
  w.link(hNuevo, guardarSes);
  w.link(guardarSes, rLogin, 0);
  w.link(guardarSes, rSesErr, 1);
  w.link(hRecibido, buscarSes);
  w.link(buscarSes, validarSes);
  w.link(validarSes, vigente);
  w.link(vigente, accion, 0);
  w.link(vigente, r401, 1);
  w.link(accion, todas, 0);
  w.link(accion, una, 1);
  w.link(accion, aCambiar, 2);
  w.link(accion, cerrar, 3);
  w.link(accion, r400, 4);
  w.link(todas, lista);
  w.link(lista, rLista);
  w.link(una, historial);
  w.link(historial, detalle);
  w.link(detalle, rDetalle);
  w.link(aCambiar, cambios);
  w.link(cambios, listos);
  w.link(listos, actualizar, 0);
  w.link(listos, rRechazo, 1);
  w.link(actualizar, filas, 0);
  w.link(actualizar, rCambioErr, 1); // si no se actualizó, no se escribe historial
  w.link(filas, guardarHist);
  w.link(guardarHist, rGuardado, 0);
  w.link(guardarHist, rHistErr, 1);
  w.link(cerrar, rSalir);
  return w.build();
}

export const workflows = { solicitud: flujoSolicitud(), panel: flujoPanel() };

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('build.mjs')) {
  const dir = new URL('.', import.meta.url);
  writeFileSync(new URL('1-recibir-solicitud.json', dir), JSON.stringify(workflows.solicitud, null, 2) + '\n');
  writeFileSync(new URL('2-panel-api.json', dir), JSON.stringify(workflows.panel, null, 2) + '\n');
  console.log('Escritos n8n/1-recibir-solicitud.json y n8n/2-panel-api.json');
}
