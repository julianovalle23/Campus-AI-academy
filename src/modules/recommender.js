// Pieza 3 · Recomendador de planes (interfaz).
// Tres preguntas → misión sugerida con el porqué, su inscripción, una
// alternativa y una tabla para comparar las cinco. Al terminar, la tarjeta
// recomendada se resalta en la sección de planes.
// La decisión la toma recommendPlan() (src/modules/recommend.js, función pura).

import { animate } from 'animejs/animation';
import { createTimeline } from 'animejs/timeline';
import { stagger } from 'animejs/utils';
import { recommendPlan } from './recommend.js';
import { questions, teamFromProfile } from '../data/recommender.js';
import { plans, planById } from '../data/plans.js';
import { esc } from '../templates/html.js';
import { icons } from '../templates/icons.js';
import { motionScope, onceInView, prefersReducedMotion, DUR, EASE } from '../utils/motion.js';
import { store } from '../utils/store.js';

export function init(root = document.querySelector('[data-recommender]')) {
  if (!root) return;
  const intro = root.querySelector('[data-rec-intro]');
  const body = root.querySelector('[data-rec-body]');
  const answers = {};
  let step = 0;
  let prefilled = false;

  const prefillFromProfile = (profile) => {
    if (!profile || answers.team) return;
    answers.team = teamFromProfile[profile];
    prefilled = true;
  };
  prefillFromProfile(store.get('profile'));
  store.on('profile', (p) => {
    // Si la persona cambia de perfil antes de empezar, se actualiza la precarga.
    if (body.hidden) {
      delete answers.team;
      prefillFromProfile(p);
    }
  });

  root.querySelector('[data-rec-start]').addEventListener('click', () => {
    intro.hidden = true;
    body.hidden = false;
    store.set('recommenderActive', true);
    goTo(0);
  });

  /* ---------- Pasos ---------- */

  function goTo(next) {
    step = next;
    transition(() => {
      body.innerHTML = renderStep(step);
      wireStep();
      body.querySelector('[data-rec-heading]').focus();
    });
  }

  function renderStep(i) {
    const q = questions[i];
    const isLast = i === questions.length - 1;
    const note =
      i === 0 && prefilled && answers.team
        ? `<p class="rec-step__note">Precargamos esta respuesta según el perfil que elegiste al inicio. Puedes cambiarla.</p>`
        : '';
    return `
      <form class="rec-step" data-rec-form novalidate>
        <p class="rec-step__progress">Pregunta ${i + 1} de ${questions.length}</p>
        <div class="rec-step__bar" aria-hidden="true"><span style="--rec-progress:${(i + 1) / questions.length}"></span></div>
        <fieldset class="rec-step__fieldset">
          <legend class="rec-step__legend" tabindex="-1" data-rec-heading>
            <span class="step-num" aria-hidden="true">${i + 1}</span>
            <span>${esc(q.title)}</span>
          </legend>
          ${note}
          <div class="rec-options">
            ${q.options
              .map(
                (o) => `
              <label class="rec-option">
                <input class="rec-option__input" type="radio" name="${esc(q.id)}" value="${esc(o.value)}"${answers[q.id] === o.value ? ' checked' : ''}>
                <span class="rec-option__label">${esc(o.label)}</span>
              </label>`,
              )
              .join('')}
          </div>
        </fieldset>
        <div class="rec-step__actions">
          ${i > 0 ? `<button class="btn btn--ghost" type="button" data-rec-back>Atrás</button>` : ''}
          <button class="btn btn--primary" type="submit" data-rec-next${answers[q.id] ? '' : ' disabled'}>
            <span>${isLast ? 'Ver mi misión' : 'Siguiente'}</span>${icons.arrow}
          </button>
        </div>
      </form>`;
  }

  function wireStep() {
    const form = body.querySelector('[data-rec-form]');
    const next = form.querySelector('[data-rec-next]');
    const q = questions[step];
    form.addEventListener('change', (e) => {
      answers[q.id] = e.target.value;
      if (q.id === 'team') prefilled = false;
      next.disabled = false;
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!answers[q.id]) return;
      if (step < questions.length - 1) goTo(step + 1);
      else showResult();
    });
    form.querySelector('[data-rec-back]')?.addEventListener('click', () => goTo(step - 1));
  }

  /* ---------- Resultado ---------- */

  function showResult() {
    const result = recommendPlan(answers);
    const plan = planById[result.planId];
    const alt = result.alternativeId ? planById[result.alternativeId] : null;

    transition(() => {
      body.innerHTML = `
        <div class="rec-result" data-rec-result>
          <p class="recommender__kicker">Tu misión recomendada</p>
          <h4 class="rec-result__name" tabindex="-1" data-rec-heading>
            ${esc(plan.name)} <span class="rec-result__duration">${esc(plan.duration)}</span>
          </h4>
          <p class="rec-result__summary">${esc(plan.summary)}</p>
          <p class="rec-result__why-title">Por qué te la recomendamos</p>
          <ul class="rec-result__reasons" role="list">
            ${result.reasons.map((r) => `<li>${icons.check}<span>${esc(r)}</span></li>`).join('')}
          </ul>
          ${
            alt
              ? `<p class="rec-result__alt">También puedes considerar <a href="#plan-${esc(alt.id)}" data-rec-goto="${esc(alt.id)}">${esc(alt.name)} (${esc(alt.duration)})</a>.</p>`
              : ''
          }
          <div class="rec-result__actions">
            <a class="btn btn--primary" href="${esc(plan.cta.href)}" target="_blank" rel="noopener">
              <span>${esc(plan.cta.label)} en ${esc(plan.name)}</span>${icons.arrow}<span class="visually-hidden"> (se abre en otra pestaña)</span>
            </a>
            <button class="btn btn--ghost" type="button" aria-expanded="false" aria-controls="rec-compare" data-rec-compare>Comparar las 5 misiones</button>
          </div>
          <div class="rec-compare" id="rec-compare" hidden>
            ${renderCompare(plan.id)}
          </div>
          <div class="rec-result__links">
            <a class="text-link" href="#plan-${esc(plan.id)}" data-rec-goto="${esc(plan.id)}">Ver ${esc(plan.name)} en los planes</a>
            <button class="text-link" type="button" data-rec-restart>Volver a empezar</button>
          </div>
        </div>`;
      wireResult();
      body.querySelector('[data-rec-heading]').focus();
      if (!prefersReducedMotion()) {
        createTimeline({ defaults: { ease: EASE, duration: DUR.slow } })
          .add(body.querySelector('.rec-result__name'), { opacity: [0, 1], scale: [0.96, 1] })
          .add(body.querySelectorAll('.rec-result__reasons li'), { opacity: [0, 1], x: [-12, 0], delay: stagger(90) }, '-=250');
      }
    });

    store.set('recommendation', result);
    store.set('recommenderActive', false);
  }

  function renderCompare(recommendedId) {
    return `
      <div class="rec-compare__scroll" role="region" aria-label="Comparación de misiones" tabindex="0">
        <table class="rec-compare__table">
          <caption class="visually-hidden">Comparación de las cinco misiones</caption>
          <thead><tr><th scope="col">Misión</th><th scope="col">Duración</th><th scope="col">Formato</th><th scope="col">Ideal para</th></tr></thead>
          <tbody>
            ${plans
              .map(
                (p) => `
              <tr${p.id === recommendedId ? ' class="is-recommended"' : ''}>
                <th scope="row">${esc(p.name)}${p.id === recommendedId ? ' <span class="rec-compare__tag">Recomendada</span>' : ''}</th>
                <td>${esc(p.duration)}</td>
                <td>${esc(p.format)}</td>
                <td>${esc(p.summary)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
  }

  function wireResult() {
    const toggle = body.querySelector('[data-rec-compare]');
    const panel = body.querySelector('#rec-compare');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Ocultar comparación' : 'Comparar las 5 misiones';
      panel.hidden = !open;
      if (open && !prefersReducedMotion()) {
        animate(panel, { opacity: [0, 1], y: [-8, 0], duration: DUR.base, ease: EASE });
      }
    });
    body.querySelectorAll('[data-rec-goto]').forEach((link) =>
      link.addEventListener('click', (e) => {
        e.preventDefault();
        focusPlan(link.dataset.recGoto);
      }),
    );
    body.querySelector('[data-rec-restart]').addEventListener('click', () => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      prefilled = false;
      prefillFromProfile(store.get('profile'));
      store.set('recommenderActive', true);
      goTo(0);
    });
  }

  /* ---------- Transiciones ---------- */

  function transition(render) {
    if (prefersReducedMotion() || !body.firstElementChild) {
      render();
      return;
    }
    animate(body.firstElementChild, {
      opacity: 0,
      x: -16,
      duration: DUR.fast,
      ease: 'inQuad',
      onComplete: () => {
        render();
        animate(body.firstElementChild, { opacity: [0, 1], x: [16, 0], duration: DUR.base, ease: EASE });
      },
    });
  }

  initPlanHighlight();
}

/* ---------- Resaltado en la sección de planes ---------- */

function initPlanHighlight() {
  const list = document.querySelector('[data-plan-list]');
  if (!list) return;

  motionScope(list, (scope) => {
    const reduce = scope.matches.reduceMotion;
    const off = store.on('recommendation', ({ planId }) => {
      list.querySelectorAll('[data-plan]').forEach((card) => {
        card.toggleAttribute('data-recommended', card.dataset.plan === planId);
      });
      const card = list.querySelector(`[data-plan="${planId}"]`);
      scrollCarouselTo(list, card, reduce);
      if (reduce) return;
      // Pulso cuando la tarjeta entra en pantalla (o de inmediato si ya se ve).
      onceInView(card, () => animate(card, { scale: [1, 1.03, 1], duration: DUR.slow * 2, ease: EASE }));
    });
    return off;
  });
}

/** En el carrusel móvil, desplaza horizontalmente hasta la tarjeta. */
function scrollCarouselTo(list, card, reduce) {
  if (list.scrollWidth <= list.clientWidth) return;
  const pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
  const left = card.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - pad;
  list.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
}

/** Lleva la vista y el foco a una tarjeta de plan. */
function focusPlan(id) {
  const card = document.getElementById(`plan-${id}`);
  if (!card) return;
  const list = card.closest('[data-plan-list]');
  scrollCarouselTo(list, card, prefersReducedMotion());
  card.setAttribute('tabindex', '-1');
  card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  card.focus({ preventScroll: true });
}
