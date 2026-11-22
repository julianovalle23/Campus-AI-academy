// Scope de Anime.js con la media query de movimiento reducido.
// Cada pieza crea su scope: si la persona activa o desactiva
// prefers-reduced-motion, Anime.js revierte y vuelve a montar la pieza.

import { createScope } from 'animejs/scope';
import { onScroll } from 'animejs/events';

export const MEDIA = {
  reduceMotion: '(prefers-reduced-motion: reduce)',
};

/**
 * @param {Element} root  raíz de la pieza
 * @param {(scope: import('animejs').Scope) => (void | (() => void))} setup
 */
export function motionScope(root, setup) {
  return createScope({ root, mediaQueries: MEDIA }).add(setup);
}

export const prefersReducedMotion = () => window.matchMedia(MEDIA.reduceMotion).matches;

/** Lee un token CSS (p. ej. '--soft-violet') para usarlo en canvas. */
export const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Duraciones base en ms (espejo de los tokens --dur-*). */
export const DUR = { fast: 150, base: 250, slow: 450 };
export const EASE = 'outQuint';

/**
 * Ejecuta `fn` una sola vez cuando `target` entra en pantalla (onScroll de Anime.js).
 * Se escucha entrar, actualizar y salir: aunque un ancla salte la sección,
 * el efecto se aplica y nada queda oculto.
 */
export function onceInView(target, fn, enter = 'bottom-=12% top') {
  let done = false;
  let io;
  const run = () => {
    if (done) return;
    done = true;
    io?.disconnect();
    fn();
  };
  // Red de seguridad: si el navegador no emite scroll (p. ej. salto programático),
  // el IntersectionObserver garantiza que el contenido no quede oculto.
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && run());
    io.observe(target);
  }
  return onScroll({ target, enter, onEnter: run, onUpdate: run, onLeave: run });
}
