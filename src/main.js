// Punto de entrada. Fase 2: estilos + menú accesible.
// Las piezas interactivas se cargarán con import() al acercarse a cada sección (fase 3).

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections/header.css';
import './styles/sections/hero.css';
import './styles/sections/content.css';
import './styles/sections/plans.css';
import './styles/sections/closing.css';

import { initNav } from './modules/nav.js';

initNav();
