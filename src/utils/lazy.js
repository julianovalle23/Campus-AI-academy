// Carga diferida: ejecuta `load` (un import()) cuando `el` se acerca al viewport.

const MARGIN = '75% 0px';

/**
 * @param {Element | null} el
 * @param {() => Promise<{ init: (el: Element) => void }>} load
 */
export function whenNear(el, load) {
  if (!el) return;
  const run = () =>
    load()
      .then((mod) => mod.init(el))
      .catch((error) => console.error('[lazy] No se pudo cargar el módulo', error));

  if (!('IntersectionObserver' in window)) {
    run();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    },
    { rootMargin: MARGIN },
  );
  io.observe(el);
}

/** Ejecuta cuando el navegador está libre (tras el primer pintado). */
export function whenIdle(fn) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 1500 });
  else window.setTimeout(fn, 200);
}
