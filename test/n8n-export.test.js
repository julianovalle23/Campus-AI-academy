// Contrato de los flujos exportados (n8n/*.json): sin secretos ni IDs reales,
// y con las ramas de error donde deben ir (sin guardado no hay aviso ni historial).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (f) => JSON.parse(readFileSync(new URL(`../n8n/${f}`, import.meta.url), 'utf8'));
const solicitud = load('1-recibir-solicitud.json');
const panel = load('2-panel-api.json');
const out = (wf, from, i) => (wf.connections[from]?.main[i] ?? []).map((c) => c.node);

test('no llevan credenciales ni el ID real de la hoja', () => {
  for (const wf of [solicitud, panel]) {
    const raw = JSON.stringify(wf);
    assert.ok(!wf.nodes.some((n) => n.credentials), wf.name);
    for (const n of wf.nodes.filter((n) => n.parameters.documentId))
      assert.equal(n.parameters.documentId.value, 'REEMPLAZAR_CON_ID_DE_LA_HOJA', n.name);
    assert.ok(!/bot\d+:|ngrok/i.test(raw), 'token o URL');
  }
  assert.ok(JSON.stringify(solicitud).includes('REEMPLAZAR_CON_CHAT_ID_DE_PRUEBA'));
});

test('todas las conexiones apuntan a nodos existentes', () => {
  for (const wf of [solicitud, panel]) {
    const names = new Set(wf.nodes.map((n) => n.name));
    assert.equal(names.size, wf.nodes.length, 'nombres únicos');
    for (const [from, { main }] of Object.entries(wf.connections)) {
      assert.ok(names.has(from), from);
      for (const c of main.flat()) assert.ok(names.has(c.node), c.node);
    }
  }
});

test('solicitud: inválida → 422; fallo al guardar → 500 y sin aviso', () => {
  assert.deepEqual(out(solicitud, '¿Solicitud válida?', 1), ['Responder 422: revisar campos']);
  assert.deepEqual(out(solicitud, 'Guardar en Solicitudes', 1), ['Responder 500: no se guardó']);
  assert.deepEqual(out(solicitud, 'Guardar en Solicitudes', 0), ['Historial: solicitud creada']);
  assert.deepEqual(out(solicitud, 'Responder 201: guardada', 0), ['Avisar al chat de prueba']);
  assert.deepEqual(out(solicitud, 'Avisar al chat de prueba', 0), ['Marcar aviso enviado']);
  assert.deepEqual(out(solicitud, 'Avisar al chat de prueba', 1), ['Marcar aviso fallido']);
});

test('panel: sin sesión → 401; fallo al actualizar → 500 sin historial', () => {
  assert.deepEqual(out(panel, '¿Sesión vigente?', 1), ['Responder 401: sin sesión']);
  assert.deepEqual(out(panel, '¿Credenciales correctas?', 1), ['Responder 401: credenciales']);
  assert.deepEqual(out(panel, 'Actualizar estado', 1), ['Responder 500: cambio no guardado']);
  assert.deepEqual(out(panel, 'Actualizar estado', 0), ['Filas de historial']);
  assert.deepEqual(out(panel, 'Guardar historial', 1), ['Responder 500: historial no guardado']);
  assert.equal(panel.settings.saveDataSuccessExecution, 'none');
});
