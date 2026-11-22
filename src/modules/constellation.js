// Pieza 4 · Exploración libre: constelación de las 14 herramientas.
// - Cada estrella es un <button> (toque, cursor y teclado). Una sola parada de
//   Tab (tabindex itinerante); las flechas mueven al vecino más cercano en esa
//   dirección; Inicio/Fin van a la primera/última; Enter o Espacio abren;
//   Esc cierra y devuelve el foco a la estrella.
// - Al abrir, el panel (aria-live) cuenta qué es la herramienta y las líneas
//   que la conectan se dibujan con svg.createDrawable.
// - Entrada: las estrellas aparecen y las líneas se trazan al llegar (onScroll).

import { animate } from 'animejs/animation';
import { createTimeline } from 'animejs/timeline';
import { createDrawable } from 'animejs/svg';
import { stagger, set } from 'animejs/utils';
import { tools, toolGroups } from '../data/tools.js';
import { esc } from '../templates/html.js';
import { icons } from '../templates/icons.js';
import { motionScope, onceInView, prefersReducedMotion, DUR, EASE } from '../utils/motion.js';

const DESKTOP = '(min-width: 48rem)';
const toolById = Object.fromEntries(tools.map((t) => [t.id, t]));
const groupLabel = Object.fromEntries(toolGroups.map((g) => [g.id, g.label]));

export function init(section = document.querySelector('#herramientas')) {
  const sky = section?.querySelector('[data-constellation]');
  if (!sky) return;
  const panel = section.querySelector('[data-tool-panel]');
  const buttons = [...sky.querySelectorAll('.star__btn')];
  const desktop = window.matchMedia(DESKTOP);
  const svgFor = () => sky.querySelector(`.constellation__lines--${desktop.matches ? 'd' : 'm'}`);
  let selected = null;

  /* ---------- Teclado: tabindex itinerante + navegación espacial ---------- */

  const center = (el) => {
    const r = el.querySelector('.star__dot').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  const DIRS = {
    ArrowRight: [1, 0],
    ArrowLeft: [-1, 0],
    ArrowDown: [0, 1],
    ArrowUp: [0, -1],
  };

  function nearest(from, [dx, dy]) {
    const a = center(from);
    let best = null;
    let bestScore = Infinity;
    for (const b of buttons) {
      if (b === from) continue;
      const p = center(b);
      const along = (p.x - a.x) * dx + (p.y - a.y) * dy; // avance en la dirección
      if (along <= 1) continue;
      const across = Math.abs((p.x - a.x) * dy) + Math.abs((p.y - a.y) * dx); // desvío lateral
      const score = along + across * 2;
      if (score < bestScore) {
        bestScore = score;
        best = b;
      }
    }
    return best;
  }

  function moveFocus(to) {
    if (!to) return;
    buttons.forEach((b) => b.setAttribute('tabindex', b === to ? '0' : '-1'));
    to.focus();
  }

  sky.addEventListener('keydown', (e) => {
    const current = e.target.closest('.star__btn');
    if (!current) return;
    if (DIRS[e.key]) {
      e.preventDefault();
      moveFocus(nearest(current, DIRS[e.key]));
    } else if (e.key === 'Home') {
      e.preventDefault();
      moveFocus(buttons[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      moveFocus(buttons[buttons.length - 1]);
    } else if (e.key === 'Escape' && selected) {
      e.preventDefault();
      close();
    }
  });

  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selected) {
      e.preventDefault();
      close();
    }
  });

  /* ---------- Abrir / cerrar ---------- */

  sky.addEventListener('click', (e) => {
    const btn = e.target.closest('.star__btn');
    if (!btn) return;
    buttons.forEach((b) => b.setAttribute('tabindex', b === btn ? '0' : '-1'));
    if (selected === btn) close();
    else open(btn);
  });

  const resetDot = (btn) => {
    if (btn && !prefersReducedMotion()) {
      animate(btn.querySelector('.star__dot'), { scale: 1, duration: DUR.base, ease: EASE });
    }
  };

  function open(btn) {
    selected?.setAttribute('aria-expanded', 'false');
    resetDot(selected);
    selected = btn;
    btn.setAttribute('aria-expanded', 'true');
    const tool = toolById[btn.dataset.tool];
    sky.setAttribute('data-has-selection', '');
    sky.querySelectorAll('.star').forEach((s) => s.toggleAttribute('data-active', s.contains(btn)));
    highlightEdges(tool.id);

    panel.innerHTML = `
      <div class="tools-panel__card">
        <p class="pill">${esc(groupLabel[tool.group])}</p>
        <h3 class="tools-panel__name">${esc(tool.name)}</h3>
        <p class="tools-panel__label">Qué es</p>
        <p class="tools-panel__text">${esc(tool.what)}</p>
        <button class="tools-panel__close" type="button" data-panel-close>
          ${icons.close}<span class="visually-hidden">Cerrar ${esc(tool.name)}</span>
        </button>
      </div>`;
    panel.querySelector('[data-panel-close]').addEventListener('click', close);
    if (!prefersReducedMotion()) {
      animate(panel.firstElementChild, { opacity: [0, 1], y: [12, 0], duration: DUR.base, ease: EASE });
      animate(btn.querySelector('.star__dot'), { scale: [1, 1.8, 1.35], duration: DUR.slow, ease: EASE });
    }
  }

  function close() {
    if (!selected) return;
    const btn = selected;
    btn.setAttribute('aria-expanded', 'false');
    resetDot(btn);
    selected = null;
    sky.removeAttribute('data-has-selection');
    sky.querySelectorAll('.star[data-active]').forEach((s) => s.removeAttribute('data-active'));
    sky.querySelectorAll('.edge.is-active').forEach((l) => l.classList.remove('is-active'));
    panel.innerHTML = `<p class="tools-panel__hint">Toca una estrella para conocer cada herramienta.</p>`;
    btn.focus();
  }

  /* ---------- Líneas ---------- */

  function highlightEdges(id) {
    const svg = svgFor();
    sky.querySelectorAll('.edge').forEach((line) => {
      line.classList.toggle('is-active', line.dataset.edge.split(' ').includes(id));
    });
    if (prefersReducedMotion()) return;
    const active = svg.querySelectorAll('.edge.is-active');
    if (!active.length) return;
    animate(createDrawable(active), { draw: ['0 0', '0 1'], duration: DUR.slow * 1.5, ease: EASE, delay: stagger(80) });
  }

  /* ---------- Entrada ---------- */

  motionScope(sky, (scope) => {
    if (scope.matches.reduceMotion) return;
    const notYetVisible = sky.getBoundingClientRect().top > window.innerHeight;
    if (!notYetVisible) return;
    const dots = sky.querySelectorAll('.star__dot');
    const names = sky.querySelectorAll('.star__name');
    set(dots, { scale: 0 });
    set(names, { opacity: 0 });
    const lines = () => createDrawable(svgFor().querySelectorAll('.edge'));
    set(lines(), { draw: '0 0' });

    onceInView(
      sky,
      () =>
        createTimeline({ defaults: { ease: EASE } })
          .add(dots, { scale: [0, 1], duration: DUR.slow, delay: stagger(45, { from: 'center' }) }, 0)
          .add(lines(), { draw: ['0 0', '0 1'], duration: DUR.slow * 2, delay: stagger(40) }, 200)
          .add(names, { opacity: [0, 1], duration: DUR.slow, delay: stagger(30) }, 300),
      'bottom-=20% top',
    );
  });

  // Si cambia la disposición (móvil ↔ escritorio), la otra versión de líneas
  // debe verse completa.
  desktop.addEventListener('change', () => {
    set(createDrawable(svgFor().querySelectorAll('.edge')), { draw: '0 1' });
  });
}
