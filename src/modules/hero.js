// Pieza 1 · Hero que reacciona al visitante.
// 1) Primera elección «¿Quién eres?»: cambia el subtítulo, destaca los casos de
//    uso de ese perfil y precarga la primera respuesta del recomendador.
// 2) Campo de estrellas en 3 capas con parallax: sigue al cursor en escritorio,
//    al toque y a la inclinación en el celular. Va detrás, nunca reduce el
//    contraste del texto (las estrellas son puntos pequeños y tenues).
// 3) Entrada con createTimeline (< 1,2 s). El titular (LCP) no se oculta y el
//    botón «Ver planes» es clicable desde el primer instante.

import { createTimeline } from 'animejs/timeline';
import { animate } from 'animejs/animation';
import { createAnimatable } from 'animejs/animatable';
import { motionScope, token, DUR, EASE } from '../utils/motion.js';
import { store } from '../utils/store.js';

const LAYERS = [
  { depth: 10, density: 1 / 9000, size: [0.6, 1.1], alpha: [0.25, 0.55] },
  { depth: 22, density: 1 / 16000, size: [0.9, 1.5], alpha: [0.35, 0.7] },
  { depth: 40, density: 1 / 42000, size: [1.3, 2.1], alpha: [0.5, 0.9] },
];
const BLEED = 48; // px extra por lado para que el parallax no deje bordes vacíos
const MAX_DPR = 2;

let entered = false;

export function init(hero = document.querySelector('.hero')) {
  if (!hero) return;
  const sky = hero.querySelector('[data-hero-sky]');
  const canvases = buildSky(sky);

  motionScope(hero, (scope) => {
    const reduce = scope.matches.reduceMotion;
    const intro = hero.querySelectorAll('[data-hero-in]');

    if (reduce || entered) {
      animate([...intro, ...canvases], { opacity: 1, duration: 0 });
    } else {
      entered = true;
      createTimeline({ defaults: { duration: DUR.slow, ease: EASE } })
        .add(canvases, { opacity: [0, 1], duration: DUR.slow * 2 }, 0)
        .add(intro, { opacity: [0, 1], y: [16, 0], delay: (_, i) => i * 110 }, 0);
      // Último elemento termina en ~0,9 s: por debajo de 1,2 s.
    }

    if (reduce) return;
    return startParallax(hero, canvases);
  });

  initProfiles(hero);
}

/* ---------------- Perfiles ---------------- */

function initProfiles(hero) {
  const subtitle = hero.querySelector('[data-hero-subtitle]');
  const status = hero.querySelector('[data-profile-status]');
  const inputs = hero.querySelectorAll('.profile-option__input');

  inputs.forEach((input) =>
    input.addEventListener('change', () => {
      if (!input.checked) return;
      swapText(subtitle, input.dataset.subtitle);
      status.innerHTML = `Listo: destacamos los <a href="#casos-uso">casos de uso para ti</a> y precargamos el recomendador de planes.`;
      store.set('profile', input.value);
      highlightCases(input.value);
    }),
  );
}

function swapText(el, text) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = text;
    return;
  }
  animate(el, {
    opacity: 0,
    y: -8,
    duration: DUR.fast,
    ease: 'inQuad',
    onComplete: () => {
      el.textContent = text;
      animate(el, { opacity: [0, 1], y: [8, 0], duration: DUR.base, ease: EASE });
    },
  });
}

function highlightCases(profile) {
  document.querySelectorAll('[data-case]').forEach((card) => {
    card.toggleAttribute('data-match', card.dataset.audience.split(' ').includes(profile));
  });
}

/* ---------------- Campo de estrellas ---------------- */

function buildSky(sky) {
  if (!sky) return [];
  const canvases = LAYERS.map(() => {
    const c = document.createElement('canvas');
    c.className = 'hero__stars';
    sky.append(c);
    return c;
  });

  const draw = () => {
    const { width, height } = sky.getBoundingClientRect();
    const w = width + BLEED * 2;
    const h = height + BLEED * 2;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const colors = [token('--white'), token('--soft-violet')];
    canvases.forEach((canvas, i) => {
      const layer = LAYERS[i];
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      const count = Math.round(w * h * layer.density);
      for (let s = 0; s < count; s += 1) {
        ctx.globalAlpha = rand(...layer.alpha);
        ctx.fillStyle = colors[s % 5 === 0 ? 1 : 0];
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, rand(...layer.size), 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  draw();
  let lastWidth = sky.clientWidth;
  new ResizeObserver(() => {
    // Solo redibuja si cambia el ancho (evita redibujar al ocultarse la barra del navegador móvil).
    if (sky.clientWidth === lastWidth) return;
    lastWidth = sky.clientWidth;
    draw();
  }).observe(sky);
  return canvases;
}

function startParallax(hero, canvases) {
  const movers = canvases.map((c) => createAnimatable(c, { x: 900, y: 900, ease: 'out(3)' }));
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(hero);

  // nx, ny en [-0.5, 0.5]: las capas se mueven en sentido contrario (profundidad)
  const move = (nx, ny) => {
    if (!visible) return;
    movers.forEach((m, i) => {
      m.x(-nx * LAYERS[i].depth);
      m.y(-ny * LAYERS[i].depth);
    });
  };
  const fromPoint = (x, y) => {
    const r = hero.getBoundingClientRect();
    move((x - r.left) / r.width - 0.5, (y - r.top) / r.height - 0.5);
  };

  const onPointer = (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') fromPoint(e.clientX, e.clientY);
  };
  const onTouch = (e) => {
    const t = e.touches[0];
    if (t) fromPoint(t.clientX, t.clientY);
  };
  const onLeave = () => move(0, 0);
  // Inclinación: solo donde no exige permiso (en iOS el toque cubre la interacción).
  const canTilt =
    'DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function';
  const onTilt = (e) => {
    if (e.gamma == null || e.beta == null) return;
    move(clamp(e.gamma / 60, -0.5, 0.5), clamp((e.beta - 45) / 60, -0.5, 0.5));
  };

  hero.addEventListener('pointermove', onPointer);
  hero.addEventListener('pointerleave', onLeave);
  hero.addEventListener('touchstart', onTouch, { passive: true });
  hero.addEventListener('touchmove', onTouch, { passive: true });
  if (canTilt) window.addEventListener('deviceorientation', onTilt);

  return () => {
    io.disconnect();
    hero.removeEventListener('pointermove', onPointer);
    hero.removeEventListener('pointerleave', onLeave);
    hero.removeEventListener('touchstart', onTouch);
    hero.removeEventListener('touchmove', onTouch);
    if (canTilt) window.removeEventListener('deviceorientation', onTilt);
    movers.forEach((m) => m.revert());
  };
}

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
