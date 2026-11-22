// Íconos de trazo simples (SVG inline, heredan currentColor). Sin librerías.

const svg = (body, size = 24) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  practice: svg('<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/><circle cx="18" cy="8" r="1.5"/>'),
  deliverables: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>'),
  support: svg('<path d="M5 18v-5a7 7 0 0 1 14 0v5"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/>'),
  routes: svg('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5"/>'),
  whatsapp: svg('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9.5 9.5c.3 1.6 1.4 3 3 3.9l1-1 2 1v1.1c-3.3.4-6.7-2.6-7.1-6.1H9.5l1 2z"/>', 20),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 20),
  external: svg('<path d="M14 5h5v5"/><path d="M19 5l-8 8"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>', 16),
  check: svg('<path d="M5 12.5l4 4 10-10"/>', 18),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 20),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  quote: svg('<path d="M9 7H6a2 2 0 0 0-2 2v3h5v5H4M20 7h-3a2 2 0 0 0-2 2v3h5v5h-5"/>', 28),
};
