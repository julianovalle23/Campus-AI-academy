// Disposición de la constelación de herramientas (presentación, no contenido).
// Coordenadas [x, y] en % del lienzo: `m` = móvil (lienzo alto), `d` = escritorio (ancho).
// Las estrellas de un mismo grupo forman una figura; las líneas `bridge`
// unen los grupos para que el recorrido se lea como una sola constelación.

export const canvas = {
  m: { width: 100, height: 190 }, // relación del lienzo en móvil
  d: { width: 100, height: 56 }, // relación del lienzo en escritorio
};

export const positions = {
  chatgpt: { m: [16, 5], d: [8, 26] },
  claude: { m: [62, 4], d: [20, 12] },
  gemini: { m: [40, 13], d: [22, 42] },
  'ms-copilot': { m: [10, 21], d: [8, 64] },
  perplexity: { m: [60, 23], d: [26, 78] },
  notebooklm: { m: [20, 35], d: [40, 16] },
  'notion-ai': { m: [62, 39], d: [52, 34] },
  'read-ai': { m: [30, 48], d: [40, 52] },
  make: { m: [14, 60], d: [52, 76] },
  zapier: { m: [60, 62], d: [64, 60] },
  midjourney: { m: [22, 74], d: [72, 14] },
  elevenlabs: { m: [58, 78], d: [86, 30] },
  heygen: { m: [32, 87], d: [74, 44] },
  'github-copilot': { m: [56, 95], d: [88, 76] },
};

export const edges = [
  // Asistentes
  ['chatgpt', 'claude'],
  ['claude', 'gemini'],
  ['gemini', 'chatgpt'],
  ['gemini', 'ms-copilot'],
  ['ms-copilot', 'perplexity'],
  ['gemini', 'perplexity'],
  // Conocimiento
  ['notebooklm', 'notion-ai'],
  ['notion-ai', 'read-ai'],
  ['read-ai', 'notebooklm'],
  // Automatización
  ['make', 'zapier'],
  // Creación
  ['midjourney', 'elevenlabs'],
  ['elevenlabs', 'heygen'],
  ['heygen', 'midjourney'],
  // Puentes entre grupos
  ['gemini', 'read-ai', 'bridge'],
  ['read-ai', 'make', 'bridge'],
  ['zapier', 'heygen', 'bridge'],
  ['elevenlabs', 'github-copilot', 'bridge'],
];
