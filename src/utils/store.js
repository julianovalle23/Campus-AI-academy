// Estado compartido mínimo entre piezas (pub/sub).
// Claves usadas:
//  - 'profile'          'empresa' | 'lider' | 'independiente'  (hero → casos, recomendador)
//  - 'recommendation'   { planId, ... }                          (recomendador → planes)
//  - 'focusMode'        Set de razones para ocultar la barra de CTA (recomendador, modales)

const state = new Map();
const listeners = new Map();

export const store = {
  get(key) {
    return state.get(key);
  },
  set(key, value) {
    state.set(key, value);
    listeners.get(key)?.forEach((fn) => fn(value));
  },
  /** Suscribe y devuelve la función para cancelar. */
  on(key, fn) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
    return () => listeners.get(key).delete(fn);
  },
};
