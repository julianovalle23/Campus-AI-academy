// Las cinco misiones. Nombres, duraciones y «incluye» son literales de la
// landing actual: no se modifican. Solo se agrega `summary` (una línea que
// resume para quién es, derivada de los propios ítems) y metadatos para el
// recomendador (`hours`, `format`).

import { links } from './site.js';

export const plans = [
  {
    id: 'ignition',
    name: 'Ignition',
    duration: '4 horas',
    hours: 4,
    format: 'en vivo',
    summary: 'Tu primer encendido: entiende la IA y úsala como asistente diario.',
    includes: [
      'Comprende el impacto real de la IA en tu industria',
      'Domina la IA generativa de tu elección como asistente diario',
      'Conoce las 10 herramientas de IA más relevantes',
      'Aprende a crear agentes básicos de IA en vivo',
    ],
    cta: { label: 'Inscríbete ahora', href: links.inscripcion },
  },
  {
    id: 'booster',
    name: 'Booster',
    duration: '8 horas',
    hours: 8,
    format: 'en vivo',
    summary: 'Más empuje: prompting preciso y agentes para tu rol.',
    includes: [
      'Todo Ignition con enfoque profesional avanzado',
      'Técnicas de prompting para resultados precisos',
      'Domina 2 herramientas de IA a tu elección',
      'Construye agentes personalizados para tu rol',
    ],
    cta: { label: 'Inscríbete ahora', href: links.inscripcion },
  },
  {
    id: 'liftoff',
    name: 'Liftoff',
    duration: '12 horas',
    hours: 12,
    format: 'en vivo',
    summary: 'Despegue completo: automatiza procesos reales de tu operación.',
    includes: [
      'Todo Booster enfocado en escalar tu operación',
      'Domina una herramienta de IA adicional elegida',
      'Aprende a automatizar procesos reales con n8n',
      'Diseña flujos automáticos aplicados a tu negocio',
    ],
    cta: { label: 'Inscríbete ahora', href: links.inscripcion },
  },
  {
    id: 'odyssey',
    name: 'Odyssey',
    duration: 'Personalizado',
    hours: null,
    format: 'a la medida',
    summary: 'Una misión diseñada para tu empresa, con acompañamiento estratégico.',
    includes: [
      'Programa 100% personalizado para tu empresa',
      'Elige herramientas, duración y profundidad',
      'Casos de uso reales según tu industria y roles',
      'Acompañamiento estratégico con sesiones tácticas',
    ],
    cta: { label: 'Inscríbete ahora', href: links.inscripcion },
  },
  {
    id: 'nebula',
    name: 'Nebula',
    duration: 'Pregrabado',
    hours: null,
    format: 'a tu ritmo',
    summary: 'Aprende a tu ritmo, por niveles y con comunidad.',
    includes: [
      'Contenidos organizados por niveles de aprendizaje',
      'Evaluaciones continuas para medir el progreso',
      'Acceso flexible 24/7 a materiales, recursos y actualizaciones',
      'Comunidad activa de soporte y aprendizaje colaborativo',
    ],
    cta: { label: 'Accede ahora', href: links.inscripcion },
  },
];

export const planById = Object.fromEntries(plans.map((p) => [p.id, p]));
