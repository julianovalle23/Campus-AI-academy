// Helpers mínimos para generar HTML desde los datos en tiempo de build.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para insertarlo en HTML o en atributos. */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Une partes de HTML ya seguras (arrays se aplanan, null/false se omiten). */
export const join = (parts) => parts.flat(Infinity).filter((p) => p || p === 0).join('');

/** Titular con una palabra destacada en Soft Violet (recurso del manual). */
export const highlightTitle = ({ before = '', highlight = '', after = '' }) =>
  `${esc(before)}<span class="highlight">${esc(highlight)}</span>${esc(after)}`;

/** Atributos para un enlace externo (abre en otra pestaña de forma segura). */
export const externalAttrs = 'target="_blank" rel="noopener"';

/** Sufijo accesible para enlaces que abren otra pestaña. */
export const newTabHint = '<span class="visually-hidden"> (se abre en otra pestaña)</span>';

/** Marca visible de dato pendiente. */
export const todo = (text) => `<span class="todo" role="note">TODO: ${esc(text)}</span>`;
