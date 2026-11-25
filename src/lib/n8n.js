// Direcciones de los webhooks de n8n. No son secretos: el formulario es
// público y el panel exige una sesión que n8n verifica contra Google Sheets.
// Se configuran en .env.local (ver .env.example):
//   VITE_N8N_URL=https://tu-instancia-n8n/webhook
// Si falta, los formularios lo dicen con claridad en lugar de fingir un envío.

const base = (import.meta.env?.VITE_N8N_URL ?? '').replace(/\/+$/, '');

export const n8nConfigured = Boolean(base);

/**
 * POST JSON a un webhook. Devuelve { status, body } o lanza si no hay red.
 * El encabezado de ngrok evita su página de aviso en instancias de prueba.
 */
export async function postWebhook(path, payload) {
  if (!base) {
    console.warn('[n8n] Falta VITE_N8N_URL en .env.local: no se envió nada.');
    return { status: 0, body: { error: 'El envío no está configurado todavía.' } };
  }
  const headers = { 'Content-Type': 'application/json' };
  if (/ngrok/.test(base)) headers['ngrok-skip-browser-warning'] = '1';
  const res = await fetch(`${base}/${path}`, { method: 'POST', headers, body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}
