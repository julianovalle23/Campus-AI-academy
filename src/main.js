// Punto de entrada.
// - El hero está en pantalla al cargar: se inicia de inmediato.
// - El recorrido (indicador fijo + revelaciones) se carga cuando el navegador queda libre.
// - El recomendador y la constelación se cargan con import() al acercarse a su sección.

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections/header.css';
import './styles/sections/journey.css';
import './styles/sections/hero.css';
import './styles/sections/content.css';
import './styles/sections/constellation.css';
import './styles/sections/plans.css';
import './styles/sections/recommender.css';
import './styles/sections/closing.css';

import { initNav } from './modules/nav.js';
import { init as initHero } from './modules/hero.js';
import { whenNear, whenIdle } from './utils/lazy.js';

initNav();
initHero(document.querySelector('.hero'));

whenIdle(() =>
  import('./modules/journey.js')
    .then((m) => m.init(document.querySelector('[data-journey]')))
    .catch((error) => console.error('[journey]', error)),
);
whenNear(document.querySelector('#herramientas'), () => import('./modules/constellation.js'));
whenNear(document.querySelector('[data-recommender]'), () => import('./modules/recommender.js'));
