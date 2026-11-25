// Panel de solicitudes. Los datos viven en Google Sheets y solo se leen o
// cambian a través del flujo de n8n «2 · API del panel», que exige una sesión:
// sin token vigente responde 401 y aquí solo se muestra el inicio de sesión.
// El token se guarda en sessionStorage (se borra al cerrar la pestaña) y
// vence a las 8 horas. Cada solicitud tiene su dirección (#S-…) para retomarla.

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/sections/lead.css';
import './admin.css';
import { esc } from '../templates/html.js';
import { STATUSES } from '../lib/lead.js';
import { postWebhook, n8nConfigured } from '../lib/n8n.js';

const $ = (sel) => document.querySelector(sel);
const views = document.querySelectorAll('[data-view]');
const rows = $('[data-rows]');
const detail = $('[data-detail]');
const filters = $('[data-filters]');
const count = $('[data-count]');
const TOKEN_KEY = 'aia-panel-token';
let leads = [];
let selectedId = null;

/* ---------- utilidades ---------- */

const fmt = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' });
const when = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? esc(iso ?? '') : `<time datetime="${esc(iso)}">${esc(fmt.format(d))}</time>`;
};
const statusBadge = (s) => `<span class="badge" data-status="${esc(s)}">${esc(s)}</span>`;
const notifyLabel = { pendiente: 'Pendiente', enviado: 'Enviado', fallido: 'Falló' };
const notifyBadge = (s) => `<span class="badge badge--notify" data-notify="${esc(s)}">${esc(notifyLabel[s] ?? s ?? '—')}</span>`;

function show(name) {
  views.forEach((v) => (v.hidden = v.dataset.view !== name));
}

class AuthError extends Error {}

/** Llama al flujo del panel con el token de la sesión actual. */
async function api(accion, data = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) throw new AuthError();
  const { status, body } = await postWebhook('aia-panel', { accion, token, ...data });
  if (status === 401) {
    sessionStorage.removeItem(TOKEN_KEY);
    showLogin('Tu sesión terminó. Vuelve a iniciar sesión.');
    throw new AuthError();
  }
  if (status < 200 || status >= 300 || !body.ok) throw Object.assign(new Error(body.error || 'Error'), { status, body });
  return body;
}

/* ---------- sesión ---------- */

function showLogin(message = '') {
  $('[data-user]').hidden = true;
  $('[data-login-msg]').textContent = message;
  show('login');
  $('#login-user').focus();
}

$('[data-login-form]').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const msg = $('[data-login-msg]');
  const button = $('[data-login-submit]');
  const usuario = form.username.value.trim();
  const clave = form.password.value;
  if (!usuario || !clave) {
    msg.textContent = 'Escribe tu usuario y tu contraseña.';
    return;
  }
  button.disabled = true;
  msg.textContent = 'Verificando…';
  try {
    const { status, body } = await postWebhook('aia-panel', { accion: 'login', usuario, clave });
    if (status !== 200 || !body.token) {
      msg.textContent = body.error || 'No pudimos iniciar sesión.';
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, body.token);
    form.reset();
    msg.textContent = '';
    await start();
  } catch {
    msg.textContent = 'No pudimos conectar con el servidor.';
  } finally {
    button.disabled = false;
  }
});

$('[data-logout]').addEventListener('click', async () => {
  await api('salir').catch(() => {});
  sessionStorage.removeItem(TOKEN_KEY);
  leads = [];
  rows.innerHTML = '';
  detail.innerHTML = '';
  history.replaceState(null, '', location.pathname);
  showLogin('Cerraste sesión.');
});

/* ---------- lista ---------- */

function renderList() {
  const estado = filters.estado.value;
  const q = filters.q.value.trim().toLowerCase();
  const visible = leads.filter(
    (l) =>
      (!estado || l.estado === estado) &&
      (!q || [l.nombre, l.correo, l.telefono, l.id].some((v) => String(v ?? '').toLowerCase().includes(q))),
  );
  count.textContent = `${visible.length} de ${leads.length} ${leads.length === 1 ? 'solicitud' : 'solicitudes'}`;
  rows.innerHTML = visible.length
    ? visible
        .map(
          (l) => `
      <tr data-id="${esc(l.id)}"${l.id === selectedId ? ' aria-current="true"' : ''}>
        <td>${esc(l.id)}</td>
        <td>${when(l.fecha)}</td>
        <td><a class="admin-row-link" href="#${esc(l.id)}">${esc(l.nombre)}</a><span class="admin-sub">${esc(l.correo)}</span></td>
        <td>${esc(l.programa)}</td>
        <td>${statusBadge(l.estado)}</td>
        <td>${notifyBadge(l.aviso)}</td>
      </tr>`,
        )
        .join('')
    : `<tr><td colspan="6" class="admin-empty">${leads.length ? 'No hay solicitudes con estos filtros.' : 'Aún no hay solicitudes.'}</td></tr>`;
}

async function loadList() {
  const data = await api('listar');
  leads = data.leads ?? [];
  $('[data-user-name]').textContent = `Sesión: ${data.admin}`;
  renderList();
}

filters.addEventListener('input', renderList);
filters.addEventListener('submit', (e) => e.preventDefault());
$('[data-refresh]').addEventListener('click', () => {
  loadList().catch(() => {});
  if (selectedId) loadDetail(selectedId).catch(() => {});
});

/* ---------- detalle ---------- */

const fieldLabel = { creación: 'Solicitud recibida', estado: 'Estado', nota: 'Nota añadida' };

function historyText(h) {
  if (h.campo === 'creación') return `Se creó con estado ${statusBadge(h.despues)}`;
  if (h.campo === 'estado') return `${statusBadge(h.antes)} → ${statusBadge(h.despues)}`;
  if (h.campo === 'nota') return `«${esc(h.despues)}»`;
  return esc(h.despues ?? '');
}

function renderDetail({ lead, historial }) {
  const notes = historial.filter((h) => h.campo === 'nota');
  detail.innerHTML = `
    <header class="admin-detail__head">
      <p class="admin-detail__kicker">Solicitud ${esc(lead.id)}</p>
      <h2 class="admin-detail__title" id="detail-title" tabindex="-1">${esc(lead.nombre)}</h2>
      <p>${statusBadge(lead.estado)} <span class="admin-sub" style="display:inline">Aviso Telegram:</span> ${notifyBadge(lead.aviso)}</p>
    </header>

    <dl class="admin-data">
      <div><dt>Correo</dt><dd><a href="mailto:${esc(lead.correo)}">${esc(lead.correo)}</a></dd></div>
      <div><dt>Teléfono</dt><dd>${lead.telefono ? esc(lead.telefono) : '<span class="admin-muted">No lo indicó</span>'}</dd></div>
      <div><dt>Programa</dt><dd>${esc(lead.programa)}</dd></div>
      <div><dt>Recibida</dt><dd>${when(lead.fecha)}</dd></div>
      <div><dt>Última actualización</dt><dd>${when(lead.actualizado)}</dd></div>
    </dl>

    <form class="admin-form admin-update" data-update novalidate>
      <h3 class="admin-detail__section">Actualizar seguimiento</h3>
      <div class="lead-field">
        <label class="lead-field__label" for="u-status">Estado</label>
        <select class="lead-input lead-input--select" id="u-status" name="status">
          ${STATUSES.map((s) => `<option value="${esc(s)}"${s === lead.estado ? ' selected' : ''}>${esc(s)}</option>`).join('')}
        </select>
      </div>
      <div class="lead-field">
        <label class="lead-field__label" for="u-note">Nueva nota <span class="lead-field__optional">(opcional)</span></label>
        <textarea class="lead-input admin-textarea" id="u-note" name="note" rows="3" maxlength="2000"
          placeholder="Qué se habló, próximo paso, fecha acordada…"></textarea>
      </div>
      <p class="admin-msg" data-update-msg role="status" aria-live="polite"></p>
      <button class="btn btn--primary" type="submit" data-update-submit>Guardar cambios</button>
    </form>

    <section aria-labelledby="notes-title">
      <h3 class="admin-detail__section" id="notes-title">Notas (${notes.length})</h3>
      ${
        notes.length
          ? `<ol class="admin-notes" role="list">${notes
              .map((n) => `<li class="admin-note"><p>${esc(n.despues)}</p><p class="admin-sub">${esc(n.quien)} · ${when(n.fecha)}</p></li>`)
              .join('')}</ol>`
          : '<p class="admin-muted">Aún no hay notas.</p>'
      }
    </section>

    <section aria-labelledby="history-title">
      <h3 class="admin-detail__section" id="history-title">Historial de cambios</h3>
      <table class="admin-table admin-history">
        <thead><tr><th scope="col">Cuándo</th><th scope="col">Qué cambió</th><th scope="col">Detalle</th><th scope="col">Quién</th></tr></thead>
        <tbody>${historial
          .map(
            (h) => `<tr><td>${when(h.fecha)}</td><td>${esc(fieldLabel[h.campo] ?? h.campo)}</td><td>${historyText(h)}</td><td>${esc(h.quien)}</td></tr>`,
          )
          .join('')}</tbody>
      </table>
    </section>`;

  detail.querySelector('[data-update]').addEventListener('submit', (e) => save(e, lead));
}

async function loadDetail(id, { focus = false } = {}) {
  selectedId = id;
  rows.querySelectorAll('tr[data-id]').forEach((tr) => tr.toggleAttribute('aria-current', tr.dataset.id === id));
  detail.innerHTML = '<p class="admin-muted">Cargando solicitud…</p>';
  try {
    renderDetail(await api('detalle', { id }));
    if (focus) detail.querySelector('#detail-title').focus();
  } catch (error) {
    if (error instanceof AuthError) return;
    detail.innerHTML = `<p class="admin-msg">${esc(error.status === 404 ? 'No encontramos esa solicitud.' : 'No pudimos cargar la solicitud.')}</p>`;
  }
}

async function save(event, lead) {
  event.preventDefault();
  const form = event.currentTarget;
  const msg = form.querySelector('[data-update-msg]');
  const button = form.querySelector('[data-update-submit]');
  const estado = form.status.value;
  const nota = form.note.value.trim();
  const payload = { id: lead.id };
  if (estado !== lead.estado) payload.estado = estado;
  if (nota) payload.nota = nota;
  if (!payload.estado && !payload.nota) {
    msg.textContent = 'No hay cambios: elige otro estado o escribe una nota.';
    return;
  }
  button.disabled = true;
  msg.textContent = 'Guardando…';
  try {
    await api('actualizar', payload);
  } catch (error) {
    if (error instanceof AuthError) return;
    // Solo se informa éxito si n8n confirmó que escribió en Google Sheets.
    msg.textContent = error.body?.error || 'No se guardaron los cambios. Intenta de nuevo.';
    button.disabled = false;
    return;
  }
  // Se vuelve a leer desde Sheets: lo que se ve es lo que quedó guardado.
  await loadDetail(lead.id);
  const okMsg = detail.querySelector('[data-update-msg]');
  if (okMsg) okMsg.textContent = 'Cambios guardados.';
  loadList().catch(() => {});
}

function routeFromHash({ focus = true } = {}) {
  const id = decodeURIComponent(location.hash.slice(1));
  if (/^S-[\w-]{3,40}$/.test(id)) loadDetail(id, { focus });
}
window.addEventListener('hashchange', () => routeFromHash());

/* ---------- arranque ---------- */

async function start() {
  if (!n8nConfigured) {
    showLogin('El panel no está configurado: falta VITE_N8N_URL en .env.local.');
    return;
  }
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    showLogin();
    return;
  }
  filters.estado.innerHTML =
    '<option value="">Todos</option>' + STATUSES.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  try {
    await loadList();
  } catch (error) {
    if (!(error instanceof AuthError)) showLogin('No pudimos conectar con el servidor. Intenta de nuevo.');
    return;
  }
  $('[data-user]').hidden = false;
  show('app');
  routeFromHash({ focus: false });
}

start();
