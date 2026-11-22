// Casos de uso: antes / después (texto literal de la landing actual).
// `audience` conecta cada caso con la elección del hero.

export const cases = [
  {
    id: 'empresario',
    role: 'Empresario / Emprendedor',
    audience: ['empresa'],
    before:
      'Procesos comerciales manuales, lanzamientos lentos y decisiones a ciegas por falta de contenido y reportes actualizados.',
    after:
      'Asistentes de IA que crean emails, propuestas y reportes en minutos, con métricas claras para escalar ventas sin fricción.',
  },
  {
    id: 'innovacion',
    role: 'Director(a) de Innovación',
    audience: ['empresa', 'lider'],
    before:
      'Pilotos desconectados que no escalan y escasa evidencia para justificar inversión ante la dirección.',
    after:
      'Workshops intensivos de 4h con agentes funcionales, casos de uso claros y métricas de eficiencia listas para presentar.',
  },
  {
    id: 'independiente',
    role: 'Profesional Independiente',
    audience: ['independiente'],
    before:
      'Demasiado tiempo en tareas repetitivas, poco foco en vender y mínima diferenciación frente al mercado.',
    after:
      'Prompts estratégicos que generan propuestas, automatizan el seguimiento y entregan resultados personalizados en segundos.',
  },
  {
    id: 'rrhh',
    role: 'Líder de RR. HH.',
    audience: ['lider'],
    before: 'Onboarding genérico, procesos manuales y nulo acompañamiento adaptado a cada rol.',
    after:
      'Rutas de microlearning con bots que guían, responden dudas y capturan feedback continuo de forma automática.',
  },
];
