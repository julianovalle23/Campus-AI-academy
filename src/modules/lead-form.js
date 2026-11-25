// Formulario «Solicitar información».
// - Valida con las mismas reglas que el servidor (src/lib/lead.js).
// - Si hay errores, no envía nada: marca los campos y lleva el foco al resumen.
// - Envía al webhook de n8n (flujo «1 · Recibir solicitud»), que vuelve a
//   validar, guarda en Google Sheets y avisa a Telegram. Solo muestra la
//   confirmación si n8n responde 201 (fila guardada). Lo demás es un error.
// - Si el recomendador sugirió una misión, la preselecciona (se puede cambiar).

import { validateLead, programName } from '../lib/lead.js';
import { store } from '../utils/store.js';
import { postWebhook } from '../lib/n8n.js';

const FIELDS = ['name', 'email', 'program', 'phone'];
const LABELS = { name: 'Nombre', email: 'Correo electrónico', program: 'Programa de interés', phone: 'Teléfono' };

export function init(root = document.querySelector('[data-lead]')) {
  if (!root) return;
  const form = root.querySelector('[data-lead-form]');
  const summary = root.querySelector('[data-lead-summary]');
  const status = root.querySelector('[data-lead-status]');
  const submit = root.querySelector('[data-lead-submit]');
  const submitLabel = root.querySelector('[data-lead-submit-label]');
  const done = root.querySelector('[data-lead-done]');
  const doneTitle = root.querySelector('[data-lead-done-title]');
  const doneText = root.querySelector('[data-lead-done-text]');
  const program = form.elements.program;
  let touchedProgram = false;
  let sending = false;

  /* ---------- precarga desde el recomendador ---------- */
  const prefill = (rec) => {
    if (!rec?.planId || touchedProgram || !programName(rec.planId)) return;
    program.value = rec.planId;
  };
  prefill(store.get('recommendation'));
  store.on('recommendation', prefill);
  program.addEventListener('change', () => (touchedProgram = true));

  /* ---------- errores ---------- */
  const errorEl = (name) => form.querySelector(`[data-error-for="${name}"]`);

  function showErrors(errors) {
    for (const name of FIELDS) {
      const input = form.elements[name];
      const el = errorEl(name);
      const msg = errors[name];
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      el.hidden = !msg;
      el.textContent = msg ?? '';
    }
  }

  function showSummary(errors) {
    const names = FIELDS.filter((n) => errors[n]);
    if (!names.length) {
      summary.hidden = true;
      summary.innerHTML = '';
      return;
    }
    summary.innerHTML = `<p class="lead-form__summary-title">Revisa ${names.length === 1 ? 'este campo' : `estos ${names.length} campos`}:</p>
      <ul role="list">${names
        .map((n) => `<li><a href="#lead-${n}" data-goto="${n}">${LABELS[n]}: ${errors[n]}</a></li>`)
        .join('')}</ul>`;
    summary.hidden = false;
    summary.focus();
  }

  summary.addEventListener('click', (event) => {
    const link = event.target.closest('[data-goto]');
    if (!link) return;
    event.preventDefault();
    form.elements[link.dataset.goto].focus();
  });

  // Al corregir un campo marcado, se revalida solo ese campo.
  form.addEventListener('input', (event) => {
    const name = event.target.name;
    if (!FIELDS.includes(name) || event.target.getAttribute('aria-invalid') !== 'true') return;
    const { errors = {} } = validateLead(readForm());
    const el = errorEl(name);
    if (!errors[name]) {
      event.target.removeAttribute('aria-invalid');
      el.hidden = true;
      el.textContent = '';
    } else {
      el.textContent = errors[name];
    }
  });

  const readForm = () => Object.fromEntries(FIELDS.map((n) => [n, form.elements[n].value]));

  function setSending(on) {
    sending = on;
    submit.disabled = on;
    submit.toggleAttribute('data-loading', on);
    form.setAttribute('aria-busy', String(on));
    submitLabel.textContent = on ? 'Enviando…' : 'Enviar solicitud';
  }

  function setStatus(text, kind = '') {
    status.textContent = text;
    status.dataset.kind = kind;
  }

  /* ---------- envío ---------- */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    setStatus('');

    const result = validateLead(readForm());
    if (!result.ok) {
      showErrors(result.errors);
      showSummary(result.errors);
      return; // Formulario inválido: no se envía nada.
    }
    showErrors({});
    showSummary({});
    setSending(true);
    setStatus('Enviando tu solicitud…');

    let status;
    let body;
    try {
      ({ status, body } = await postWebhook('aia-solicitud', { ...readForm(), website: form.elements.website.value }));
    } catch {
      setSending(false);
      setStatus('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.', 'error');
      return;
    }
    setSending(false);

    // Solo un 201 con ok significa que n8n guardó la fila en Google Sheets.
    if (status === 201 && body.ok) {
      const { name, program: planId } = result.data;
      form.hidden = true;
      done.hidden = false;
      doneText.textContent = `Gracias, ${name.split(' ')[0]}. Guardamos tu interés en ${programName(planId)}; el equipo de AI Academy te contactará al correo que indicaste.`;
      setStatus('');
      doneTitle.focus();
      return;
    }
    if (status === 422 && body.fields && FIELDS.some((n) => body.fields[n])) {
      showErrors(body.fields);
      showSummary(body.fields);
      setStatus('');
      return;
    }
    // 500, sin configurar, etc.: mensaje sin detalles técnicos.
    setStatus(body.error || 'No pudimos guardar tu solicitud. Intenta de nuevo en unos minutos.', 'error');
  });

  root.querySelector('[data-lead-again]').addEventListener('click', () => {
    form.reset();
    touchedProgram = false;
    prefill(store.get('recommendation'));
    done.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
}
