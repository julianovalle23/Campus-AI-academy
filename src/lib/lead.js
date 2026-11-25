// Reglas de la solicitud de información (funciones puras). El formulario las
// usa para avisar antes de enviar; el flujo de n8n aplica las mismas reglas
// al recibir (nodo «Validar solicitud» de n8n/1-recibir-solicitud.json), así que el navegador no decide solo.
//
// Los programas son las cinco misiones que ya existen en src/data/plans.js;
// no se agregan cursos nuevos.

import { plans } from '../data/plans.js';

export const PROGRAMS = plans.map((p) => ({ id: p.id, name: p.name }));
export const programName = (id) => PROGRAMS.find((p) => p.id === id)?.name ?? null;

/** Estados del seguimiento, en orden. El primero es el inicial. */
export const STATUSES = ['Nuevo', 'Contactado', 'En seguimiento', 'Cerrado'];
export const INITIAL_STATUS = STATUSES[0];

export const LIMITS = { name: 100, email: 254, phone: 20 };

// Formato práctico de correo: algo@dominio.tld, sin espacios.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
// Teléfono: dígitos con +, espacios, guiones, puntos o paréntesis; 7 a 15 dígitos.
const PHONE_CHARS_RE = /^\+?[\d\s().-]+$/;

const clean = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

/**
 * Valida y normaliza una solicitud.
 * @returns {{ ok: true, data: {name,email,program,phone} } | { ok: false, errors: Record<string,string> }}
 */
export function validateLead(input = {}) {
  const name = clean(input.name);
  const email = clean(input.email).toLowerCase();
  const program = clean(input.program);
  const phone = clean(input.phone);
  const errors = {};

  if (!name) errors.name = 'Escribe tu nombre.';
  else if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.';
  else if (name.length > LIMITS.name) errors.name = `El nombre admite hasta ${LIMITS.name} caracteres.`;

  if (!email) errors.email = 'Escribe tu correo electrónico.';
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email))
    errors.email = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';

  if (!program) errors.program = 'Elige el programa que te interesa.';
  else if (!programName(program)) errors.program = 'Elige uno de los programas de la lista.';

  if (phone) {
    const digits = phone.replace(/\D/g, '').length;
    if (phone.length > LIMITS.phone || !PHONE_CHARS_RE.test(phone) || digits < 7 || digits > 15)
      errors.phone = 'Escribe un teléfono válido (solo números, de 7 a 15 dígitos) o déjalo vacío.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { name, email, program, phone: phone || null } };
}

