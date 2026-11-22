// Datos globales del sitio: marca, enlaces reales y navegación.
// Fuente: https://campuslands.aiacademy.com.co (extraído el 22 nov 2026).
// Los enlaces NO se modifican; solo el texto precargado de WhatsApp corrige
// «IA Academy» → «AI Academy» (manual de marca, pág. 8). El número se conserva.

const BASE = 'https://campuslands.aiacademy.com.co';

export const brand = {
  name: 'Campuslands AI Academy',
  short: 'AI Academy',
  tagline:
    'Transformamos la productividad de los equipos con una adopción de IA práctica, guiada y amigable.',
};

export const links = {
  inscripcion: `${BASE}/inscripcion`,
  diagnostico: `${BASE}/diagnostico`,
  certificado: `${BASE}/certificado`,
  whatsapp:
    'https://wa.me/573052105674?text=' +
    encodeURIComponent('Hola, quiero información del curso de IA de Campuslands AI Academy'),
  // La landing publicada también apunta estos enlaces a «#»; no se conocen
  // destinos reales y no se inventan páginas legales.
  privacidad: null,
  terminos: null,
};

/**
 * Etapas del viaje. Cada sección de la página declara a cuál pertenece
 * (data-stage) y el indicador de progreso las usa para navegar.
 */
export const stages = [
  { id: 'despegue', label: 'Despegue', target: 'inicio' },
  { id: 'orbita', label: 'Órbita', target: 'beneficios' },
  { id: 'mision', label: 'Misión', target: 'casos-uso' },
  { id: 'aterrizaje', label: 'Aterrizaje', target: 'reviews' },
];

/** Menú principal, en el orden narrativo de la página. */
export const nav = [
  { label: '¿Por qué ahora?', href: '#urgencia' },
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Herramientas', href: '#herramientas' },
  { label: 'Casos de uso', href: '#casos-uso' },
  { label: 'Planes', href: '#planes' },
  { label: 'FAQs', href: '#faqs' },
  { label: 'Diagnóstico', href: links.diagnostico, external: true },
  { label: 'Certificado', href: links.certificado, external: true },
];
