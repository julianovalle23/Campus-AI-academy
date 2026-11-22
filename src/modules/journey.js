// Pieza 2 · Recorrido narrativo con el scroll.
// - Un punto ("la nave") avanza por la trayectoria Despegue → Órbita → Misión → Aterrizaje.
//   Cada etapa es un grupo de secciones ([data-stage-group]); su avance lo mide
//   un ScrollObserver de Anime.js (onScroll) y se pinta con transform.
// - La etapa actual se marca con aria-current="step"; los enlaces navegan.
// - Las secciones se revelan al entrar (onScroll + stagger). Con movimiento
//   reducido no hay revelaciones ni pulsos: el indicador sigue informando.

import { animate } from 'animejs/animation';
import { onScroll } from 'animejs/events';
import { stagger, set } from 'animejs/utils';
import { motionScope, onceInView, DUR, EASE } from '../utils/motion.js';

const REVEAL =
  '.section-head, .grid > li, .plan, .faq, .final-cta, .recommender, .constellation, .tools-panel, .plans-help';

export function init(bar = document.querySelector('[data-journey]')) {
  if (!bar) return;
  const groups = [...document.querySelectorAll('[data-stage-group]')];
  const links = [...bar.querySelectorAll('[data-journey-stage]')];
  const ship = bar.querySelector('[data-journey-ship]');
  const last = groups.length - 1;
  let active = 0;

  motionScope(document.body, (scope) => {
    const reduce = scope.matches.reduceMotion;

    const setActive = (index) => {
      if (index === active) return;
      active = index;
      links.forEach((link, i) =>
        i === index ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'),
      );
      if (!reduce) {
        // Pulso de "llegada a una nueva etapa" en la nave y en la etiqueta.
        animate(ship.firstElementChild, { scale: [1, 1.8, 1], duration: DUR.slow * 2, ease: EASE });
        animate(links[index].querySelector('.journey__node'), {
          scale: [1, 1.6, 1],
          duration: DUR.slow * 2,
          ease: EASE,
        });
      }
    };

    const observers = [];

    // El avance de cada etapa se lee del getter `progress` de su ScrollObserver
    // (calculado a partir del scroll actual), así los saltos bruscos —un ancla,
    // Inicio/Fin— no dejan etapas desactualizadas.
    const render = () => {
      const progress = observers.map((o) => o.progress);
      // El punto viaja de la etapa 1 a la 4: la última etapa no suma recorrido.
      const travelled = progress.slice(0, last).reduce((sum, p) => sum + p, 0);
      bar.style.setProperty('--journey', String(travelled / last));
      const completed = progress.filter((p) => p >= 0.999).length;
      setActive(Math.min(completed, last));
    };

    groups.forEach((group) => {
      observers.push(
        onScroll({
          target: group,
          // La etapa avanza mientras el centro del viewport recorre el grupo.
          enter: 'center top',
          leave: 'center bottom',
          onUpdate: render,
          onEnter: render,
          onLeave: render,
        }),
      );
    });

    // Respaldo: tras cualquier scroll (incluido el pie, fuera de todo grupo).
    let frame = 0;
    const onWindowScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    requestAnimationFrame(render);
    const stopFallback = () => window.removeEventListener('scroll', onWindowScroll);

    if (reduce) return stopFallback;

    // Revelación por sección: solo las que aún no se ven (nada parpadea arriba).
    document.querySelectorAll('main .section').forEach((section) => {
      if (section.getBoundingClientRect().top < window.innerHeight) return;
      const items = section.querySelectorAll(REVEAL);
      if (!items.length) return;
      set(items, { opacity: 0, y: 24 });
      onceInView(section, () =>
        animate(items, { opacity: 1, y: 0, duration: DUR.slow * 1.6, delay: stagger(70), ease: EASE }),
      );
    });

    return stopFallback;
  });
}
