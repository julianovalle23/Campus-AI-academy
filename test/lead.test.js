// Reglas del formulario «Solicitar información» (src/lib/lead.js).
// El flujo de n8n aplica las mismas reglas; estas pruebas fijan el contrato.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLead, PROGRAMS, STATUSES } from '../src/lib/lead.js';

test('acepta una solicitud válida y normaliza espacios y mayúsculas', () => {
  const r = validateLead({ name: '  Ana   Prueba ', email: 'ANA@Ejemplo.test', program: 'liftoff', phone: '' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.data, { name: 'Ana Prueba', email: 'ana@ejemplo.test', program: 'liftoff', phone: null });
});

test('marca los tres obligatorios vacíos', () => {
  const r = validateLead({});
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'name', 'program']);
});

test('rechaza correos mal formados', () => {
  for (const email of ['ana', 'ana@', 'ana@dominio', 'ana @x.co', '@x.co', 'a@b..co']) {
    assert.ok(validateLead({ name: 'Ana', email, program: 'ignition' }).errors?.email, email);
  }
});

test('solo acepta las cinco misiones del landing', () => {
  assert.deepEqual(
    PROGRAMS.map((p) => p.name),
    ['Ignition', 'Booster', 'Liftoff', 'Odyssey', 'Nebula'],
  );
  assert.ok(validateLead({ name: 'Ana', email: 'a@b.co', program: 'master-ia' }).errors.program);
});

test('teléfono opcional, pero válido si se escribe', () => {
  assert.equal(validateLead({ name: 'Ana', email: 'a@b.co', program: 'nebula', phone: '+57 300 000 0000' }).ok, true);
  assert.ok(validateLead({ name: 'Ana', email: 'a@b.co', program: 'nebula', phone: 'llámame' }).errors.phone);
  assert.ok(validateLead({ name: 'Ana', email: 'a@b.co', program: 'nebula', phone: '123' }).errors.phone);
});

test('estados del seguimiento', () => {
  assert.deepEqual(STATUSES, ['Nuevo', 'Contactado', 'En seguimiento', 'Cerrado']);
});
