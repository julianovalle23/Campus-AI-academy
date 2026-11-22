// Plantillas de cada sección. Se ejecutan en build (plugin de Vite) y
// producen HTML estático y semántico a partir de src/data.

import { esc, join, highlightTitle, externalAttrs, newTabHint } from './html.js';
import { icons } from './icons.js';
import { brand, links, nav, stages } from '../data/site.js';
import { hero, urgency, benefits, reviews } from '../data/content.js';
import { plans } from '../data/plans.js';
import { tools, toolGroups } from '../data/tools.js';
import { cases } from '../data/cases.js';
import { faqs } from '../data/faqs.js';
import { canvas, positions, edges } from '../data/constellation.js';

/* ---------- Piezas reutilizables ---------- */

const pill = (text) => `<p class="pill">${esc(text)}</p>`;

const sectionHead = ({ tag, title, lead, id }) => `
  <header class="section-head">
    ${pill(tag)}
    <h2 id="${id}" class="section-title">${highlightTitle(title)}</h2>
    ${lead ? `<p class="section-lead">${esc(lead)}</p>` : ''}
  </header>`;

const whatsappLink = (label = 'Escríbenos por WhatsApp', cls = 'btn btn--ghost') => `
  <a class="${cls}" href="${esc(links.whatsapp)}" ${externalAttrs}>
    ${icons.whatsapp}<span>${esc(label)}</span>${newTabHint}
  </a>`;

const enrollLink = (label = 'Inscríbete', cls = 'btn btn--primary') => `
  <a class="${cls}" href="${esc(links.inscripcion)}" ${externalAttrs}>
    <span>${esc(label)}</span>${icons.arrow}${newTabHint}
  </a>`;

const logo = ({ variant, widths, display, alt = brand.name, cls = '', eager = false }) => {
  const name = variant === 'horizontal' ? 'logo-horizontal-blanca' : 'logo-principal';
  const ratio = variant === 'horizontal' ? 316 / 1400 : 704 / 950;
  const srcset = (ext) => widths.map((w) => `/logo/${name}-${w}.${ext} ${w}w`).join(', ');
  const h = Math.round(display * ratio);
  return `<picture class="${cls}">
    <source type="image/webp" srcset="${srcset('webp')}" sizes="${display}px">
    <img src="/logo/${name}-${widths[0]}.png" srcset="${srcset('png')}" sizes="${display}px"
      width="${display}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;
};

const navItem = ({ label, href, external }) =>
  external
    ? `<li><a class="nav__link" href="${esc(href)}" ${externalAttrs}>${esc(label)}${newTabHint}</a></li>`
    : `<li><a class="nav__link" href="${esc(href)}">${esc(label)}</a></li>`;

/* ---------- Secciones ---------- */

export const header = () => `
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="site-header__brand" href="#inicio" aria-label="${esc(brand.name)}, ir al inicio">
      ${logo({ variant: 'horizontal', widths: [180, 360, 540], display: 160, alt: '', eager: true })}
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-nav-toggle>
      <span class="nav-toggle__open">${icons.menu}</span>
      <span class="nav-toggle__close">${icons.close}</span>
      <span class="visually-hidden" data-nav-toggle-label>Abrir menú</span>
    </button>
    <nav class="nav" id="site-menu" aria-label="Principal" data-nav>
      <ul class="nav__list" role="list">
        ${join(nav.map(navItem))}
      </ul>
      ${enrollLink('Inscríbete', 'btn btn--primary btn--sm nav__cta')}
    </nav>
  </div>
  ${journey()}
</header>`;

/* Indicador del viaje: trayectoria fija con un punto que avanza con el scroll.
   Son enlaces reales (funcionan sin JS y con teclado); journey.js añade el
   progreso, la etapa actual (aria-current) y las revelaciones. */
const journey = () => `
  <nav class="journey" aria-label="Etapas del viaje" data-journey>
    <div class="container journey__inner">
      <div class="journey__track" aria-hidden="true">
        <span class="journey__fill" data-journey-fill></span>
        <span class="journey__ship" data-journey-ship><span class="journey__dot"></span></span>
      </div>
      <ol class="journey__stages" role="list">
        ${join(
          stages.map(
            (s, i) => `
          <li>
            <a class="journey__stage" href="#${esc(s.target)}" data-journey-stage="${esc(s.id)}"${i === 0 ? ' aria-current="step"' : ''}>
              <span class="journey__node" aria-hidden="true"></span>
              <span class="journey__label"><span class="visually-hidden">Etapa ${i + 1} de ${stages.length}: </span>${esc(s.label)}</span>
            </a>
          </li>`,
          ),
        )}
      </ol>
    </div>
  </nav>`;

export const heroSection = () => `
<section class="hero has-halos" id="inicio" data-stage="despegue" aria-labelledby="hero-title">
  <div class="hero__sky" aria-hidden="true" data-hero-sky></div>
  <div class="container hero__inner">
    <p class="pill" data-hero-in>Campuslands AI Academy</p>
    <h1 id="hero-title" class="hero__title">${highlightTitle(hero.title)}</h1>
    <p class="hero__subtitle" id="hero-subtitle" data-hero-subtitle data-hero-in aria-live="polite">${esc(hero.subtitle)}</p>

    <fieldset class="profile-picker" data-profile-picker data-hero-in aria-describedby="profile-status">
      <legend class="profile-picker__legend">${esc(hero.question)}</legend>
      <div class="profile-picker__options">
        ${join(
          hero.profiles.map(
            (p) => `
          <label class="profile-option">
            <input class="profile-option__input" type="radio" name="perfil" value="${esc(p.id)}" data-subtitle="${esc(p.subtitle)}">
            <span class="profile-option__label">${esc(p.label)}</span>
          </label>`,
          ),
        )}
      </div>
      <p class="profile-picker__status" id="profile-status" data-profile-status>Elige una opción y adaptamos la página a ti.</p>
    </fieldset>

    <div class="hero__actions" data-hero-in>
      <a class="btn btn--primary btn--lg" href="#planes" data-hero-cta>
        <span>Ver planes</span>${icons.arrow}
      </a>
      ${whatsappLink('Hablar con un especialista')}
    </div>

    <figure class="hero__quote" data-hero-in>
      <blockquote><p>«${esc(hero.quote.text)}»</p></blockquote>
      <figcaption>${esc(hero.quote.author)}</figcaption>
    </figure>
  </div>
</section>`;

export const urgencySection = () => `
<section class="section section--urgency" id="urgencia" data-stage="despegue" aria-labelledby="urgencia-title">
  <div class="container">
    ${sectionHead({ tag: '¿Por qué ahora?', title: urgency.title, id: 'urgencia-title' })}
    <ul class="grid grid--2 urgency-list" role="list">
      ${join(
        urgency.items.map(
          (i) => `
        <li class="card urgency-item">
          <h3 class="card__title">${esc(i.title)}</h3>
          <p class="card__text">${esc(i.text)}</p>
        </li>`,
        ),
      )}
    </ul>
  </div>
</section>`;

export const benefitsSection = () => `
<section class="section section--benefits" id="beneficios" data-stage="orbita" aria-labelledby="beneficios-title">
  <div class="container">
    ${sectionHead({ tag: 'Beneficios', title: benefits.title, id: 'beneficios-title' })}
    <ul class="grid grid--4 benefit-list" role="list">
      ${join(
        benefits.items.map(
          (b) => `
        <li class="card benefit">
          <span class="benefit__icon">${icons[b.icon]}</span>
          <h3 class="card__title">${esc(b.title)}</h3>
          <p class="card__text">${esc(b.text)}</p>
        </li>`,
        ),
      )}
    </ul>
  </div>
</section>`;

export const toolsSection = () => `
<section class="section section--tools has-halos" id="herramientas" data-stage="orbita" aria-labelledby="herramientas-title">
  <div class="container">
    ${sectionHead({
      tag: 'Herramientas',
      title: { before: 'Las ', highlight: '14 herramientas', after: ' de IA que vas a dominar' },
      lead: 'Tecnologías de IA que potencian tu trabajo, agrupadas por lo que te ayudan a hacer.',
      id: 'herramientas-title',
    })}
    ${constellation()}
    <div class="tools" data-tools>
      ${join(
        toolGroups.map(
          (g) => `
        <div class="tool-group">
          <h3 class="tool-group__title">${esc(g.label)}</h3>
          <ul class="tool-group__list" role="list">
            ${join(
              tools
                .filter((t) => t.group === g.id)
                .map(
                  (t) => `
              <li class="tool" id="tool-${esc(t.id)}">
                <h4 class="tool__name">${esc(t.name)}</h4>
                <p class="tool__what">${esc(t.what)}</p>
              </li>`,
                ),
            )}
          </ul>
        </div>`,
        ),
      )}
    </div>
  </div>
</section>`;

/* Constelación: estrellas = botones reales posicionados en % del lienzo;
   las líneas son SVG (una versión por disposición: móvil y escritorio). */
const pct = (v) => Math.round(v * 100) / 100;
const groupLabel = Object.fromEntries(toolGroups.map((g) => [g.id, g.label]));

// positions está en % del lienzo (x e y). El viewBox mide 100 × height, así que
// y se convierte a esas unidades; los botones usan el % directamente.
const edgeLines = (layout) => {
  const { height } = canvas[layout];
  const lines = edges.map(([a, b, kind]) => {
    const [x1, y1] = positions[a][layout];
    const [x2, y2] = positions[b][layout];
    const cls = kind === 'bridge' ? 'edge edge--bridge' : 'edge';
    const y = (v) => pct((v * height) / 100);
    return `<line class="${cls}" data-edge="${a} ${b}" x1="${x1}" y1="${y(y1)}" x2="${x2}" y2="${y(y2)}"/>`;
  });
  return `<svg class="constellation__lines constellation__lines--${layout}" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${join(lines)}</svg>`;
};


const constellation = () => `
  <div class="constellation-wrap">
    <ul class="constellation__legend" role="list" aria-hidden="true">
      ${join(toolGroups.map((g) => `<li class="legend__item" data-group="${esc(g.id)}">${esc(g.label)}</li>`))}
    </ul>
    <div class="constellation" data-constellation role="group" aria-label="Constelación de las 14 herramientas" aria-describedby="constellation-help">
      <p class="visually-hidden" id="constellation-help">Usa las flechas para moverte entre estrellas y Enter para abrir cada herramienta.</p>
      ${edgeLines('m')}
      ${edgeLines('d')}
      <ul class="constellation__stars" role="list">
        ${join(
          tools.map((t, i) => {
            const { m, d } = positions[t.id];
            const style = `--xm:${m[0]}%;--ym:${m[1]}%;--xd:${d[0]}%;--yd:${d[1]}%`;
            const flip = `${m[0] > 66 ? ' star--flip-m' : ''}${d[0] > 80 ? ' star--flip-d' : ''}`;
            return `
          <li class="star${flip}" style="${style}" data-group="${esc(t.group)}">
            <button class="star__btn" type="button" data-tool="${esc(t.id)}" aria-expanded="false" aria-controls="tool-panel" tabindex="${i === 0 ? 0 : -1}">
              <span class="star__dot" aria-hidden="true"></span>
              <span class="star__name">${esc(t.name)}<span class="visually-hidden">, ${esc(groupLabel[t.group])}</span></span>
            </button>
          </li>`;
          }),
        )}
      </ul>
    </div>
    <div class="tools-panel" id="tool-panel" data-tool-panel aria-live="polite">
      <p class="tools-panel__hint">Toca una estrella para conocer cada herramienta.</p>
    </div>
  </div>`;

export const casesSection = () => `
<section class="section section--cases" id="casos-uso" data-stage="mision" aria-labelledby="casos-title">
  <div class="container">
    ${sectionHead({
      tag: 'Antes / después',
      title: { before: 'El salto concreto de aplicar IA en ', highlight: 'tu contexto', after: '' },
      lead: 'Visualiza el salto concreto que tu equipo puede lograr al aplicar IA en su contexto operativo.',
      id: 'casos-title',
    })}
    <ul class="grid grid--2 case-list" role="list">
      ${join(
        cases.map(
          (c) => `
        <li class="case" id="caso-${esc(c.id)}" data-case data-audience="${esc(c.audience.join(' '))}">
          <p class="case__match">Para tu perfil</p>
          <h3 class="case__role">${esc(c.role)}</h3>
          <div class="case__panels">
            <div class="case__panel case__panel--before">
              <p class="case__label">Antes</p>
              <p class="case__text">${esc(c.before)}</p>
            </div>
            <div class="case__panel case__panel--after">
              <p class="case__label">Después</p>
              <p class="case__text">${esc(c.after)}</p>
            </div>
          </div>
        </li>`,
        ),
      )}
    </ul>
  </div>
</section>`;

const planCard = (p) => `
  <article class="plan" id="plan-${esc(p.id)}" data-plan="${esc(p.id)}" aria-labelledby="plan-${esc(p.id)}-name">
    <header class="plan__head">
      <p class="plan__badge">Recomendada para ti</p>
      <p class="plan__kicker">Misión</p>
      <h3 class="plan__name" id="plan-${esc(p.id)}-name">${esc(p.name)}</h3>
      <p class="plan__duration">${esc(p.duration)}</p>
    </header>
    <p class="plan__summary">${esc(p.summary)}</p>
    <p class="plan__includes-title">Incluye</p>
    <ul class="plan__includes" role="list">
      ${join(p.includes.map((i) => `<li>${icons.check}<span>${esc(i)}</span></li>`))}
    </ul>
    <a class="btn btn--primary plan__cta" href="${esc(p.cta.href)}" ${externalAttrs}>
      <span>${esc(p.cta.label)}</span>${icons.arrow}<span class="visually-hidden"> en ${esc(p.name)} (se abre en otra pestaña)</span>
    </a>
  </article>`;

export const plansSection = () => `
<section class="section section--plans has-halos" id="planes" data-stage="mision" aria-labelledby="planes-title">
  <div class="container">
    ${sectionHead({
      tag: 'Planes de formación espacial',
      title: { before: 'Elige tu ', highlight: 'misión', after: '' },
      lead: 'Elige el plan que mejor impulse tu misión hacia la inteligencia artificial.',
      id: 'planes-title',
    })}
    <section class="recommender" id="recomendador" aria-labelledby="rec-title" data-recommender>
      <div class="recommender__intro" data-rec-intro>
        <p class="recommender__kicker">Recomendador de misiones</p>
        <h3 class="recommender__title" id="rec-title">¿No sabes cuál elegir? Encuentra tu misión en <span class="highlight">3 preguntas</span>.</h3>
        <button class="btn btn--primary" type="button" data-rec-start>
          <span>Empezar</span>${icons.arrow}
        </button>
      </div>
      <div class="recommender__body" data-rec-body hidden></div>
    </section>
    <div class="plan-list" data-plan-list role="region" aria-label="Las cinco misiones" tabindex="0">
      ${join(plans.map(planCard))}
    </div>
      <p class="plans-help">¿No sabes cuál elegir? ${whatsappLink('Habla con un especialista', 'text-link')}</p>
  </div>
</section>`;

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

export const reviewsSection = () => `
<section class="section section--reviews" id="reviews" data-stage="aterrizaje" aria-labelledby="reviews-title">
  <div class="container">
    ${sectionHead({
      tag: 'Reseñas',
      title: { before: 'Historias reales de equipos que ya ', highlight: 'despegaron', after: '' },
      id: 'reviews-title',
    })}
    <ul class="grid grid--2 review-list" role="list">
      ${join(
        reviews.map(
          (r) => `
        <li>
          <figure class="review">
            <span class="review__mark">${icons.quote}</span>
            <blockquote class="review__text"><p>${esc(r.text)}</p></blockquote>
            <figcaption class="review__author">
              <span class="review__avatar" aria-hidden="true">${esc(initials(r.name))}</span>
              <span><strong class="review__name">${esc(r.name)}</strong><span class="review__role">${esc(r.role)}</span></span>
            </figcaption>
          </figure>
        </li>`,
        ),
      )}
    </ul>
  </div>
</section>`;

export const faqsSection = () => `
<section class="section section--faqs" id="faqs" data-stage="aterrizaje" aria-labelledby="faqs-title">
  <div class="container container--narrow">
    ${sectionHead({
      tag: 'Preguntas frecuentes',
      title: { before: 'Resolvemos tus dudas sobre ', highlight: 'AI Academy', after: '' },
      id: 'faqs-title',
    })}
    <div class="faq-list" data-faq>
      ${join(
        faqs.map(
          (f) => `
        <details class="faq">
          <summary class="faq__q"><span>${esc(f.q)}</span><span class="faq__icon">${icons.plus}</span></summary>
          <div class="faq__a">
            <p>${esc(f.a)}</p>
            ${f.whatsapp ? whatsappLink('Coordinar por WhatsApp', 'text-link') : ''}
          </div>
        </details>`,
        ),
      )}
    </div>
  </div>
</section>

<section class="section section--final" aria-labelledby="final-title">
  <div class="container">
    <div class="final-cta">
      <h2 id="final-title" class="final-cta__title">¿Listo para tu primera misión?</h2>
      <p class="final-cta__text">Inscríbete o escríbenos: te ayudamos a elegir la ruta para ti o para tu equipo.</p>
      <div class="final-cta__actions">
        ${enrollLink('Inscríbete ahora', 'btn btn--light btn--lg')}
        ${whatsappLink('Hablar por WhatsApp', 'btn btn--ghost-light')}
      </div>
    </div>
  </div>
</section>`;

export const footer = () => `
<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__brand">
      ${logo({ variant: 'vertical', widths: [160, 320], display: 140 })}
      <p class="site-footer__tagline">${esc(brand.tagline)}</p>
    </div>
    <nav class="site-footer__col" aria-label="Navegación del pie">
      <h2 class="site-footer__title">Navegación</h2>
      <ul class="site-footer__list" role="list">${join(nav.map(navItem))}</ul>
    </nav>
    <div class="site-footer__col">
      <h2 class="site-footer__title">Contacto</h2>
      <ul class="site-footer__list" role="list">
        <li>${whatsappLink('WhatsApp: habla con un especialista', 'nav__link')}</li>
        <li><a class="nav__link" href="${esc(links.inscripcion)}" ${externalAttrs}>Inscríbete${newTabHint}</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__legal">
    <p>© 2026 ${esc(brand.name)}. Todos los derechos reservados.</p>
    <ul class="site-footer__legal-list" role="list" aria-label="Documentos legales">
      <li><span>Política de privacidad</span></li>
      <li><span>Términos</span></li>
    </ul>
  </div>
</footer>`;

/** Mapa de marcadores en index.html → plantilla. */
export const sections = {
  header,
  hero: heroSection,
  urgency: urgencySection,
  benefits: benefitsSection,
  tools: toolsSection,
  cases: casesSection,
  plans: plansSection,
  reviews: reviewsSection,
  faqs: faqsSection,
  footer,
};
