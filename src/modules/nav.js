// Menú principal accesible en móvil:
// botón con aria-expanded, cierre con Esc, foco atrapado mientras está abierto
// y retorno del foco al botón al cerrar.

const DESKTOP = '(min-width: 72rem)';
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav]');
  const label = document.querySelector('[data-nav-toggle-label]');
  if (!toggle || !menu) return;

  const desktop = window.matchMedia(DESKTOP);
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  // Elementos del ciclo de foco: el botón (para poder cerrar) + los del panel.
  const focusables = () => [toggle, ...menu.querySelectorAll(FOCUSABLE)];

  function setOpen(open, { restoreFocus = true } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    menu.toggleAttribute('data-open', open);
    document.body.toggleAttribute('data-nav-open', open);
    if (open) {
      menu.querySelector(FOCUSABLE)?.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Al elegir un destino, cerrar sin devolver el foco al botón
  // (el navegador lo lleva a la sección).
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a') && isOpen()) setOpen(false, { restoreFocus: false });
  });

  // Si la ventana pasa a escritorio con el panel abierto, se limpia el estado.
  desktop.addEventListener('change', (event) => {
    if (event.matches && isOpen()) setOpen(false, { restoreFocus: false });
  });
}
