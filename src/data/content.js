// Textos de secciones (hero, urgencia, beneficios, reseñas).
// Literales de la landing actual salvo donde se indica.

export const hero = {
  quote: {
    text: 'No es la especie más fuerte ni la más inteligente la que sobrevive, sino la que mejor se adapta a los cambios.',
    author: 'Charles Darwin',
  },
  // Titular literal; la palabra destacada va en Soft Violet.
  title: { before: 'Evoluciona a la velocidad de la ', highlight: 'tecnología', after: '.' },
  // Subtítulo por defecto (brief del manual de marca, pág. 2).
  subtitle:
    'Ayudamos a empresas, líderes y profesionales a pasar de usar herramientas a integrar la IA en su trabajo, sus procesos y sus resultados.',
  question: '¿Quién eres?',
  // Perfiles de la primera elección. `subtitle` reescribe el mensaje con
  // datos que ya existen en la landing (no se inventan cifras).
  profiles: [
    {
      id: 'empresa',
      label: 'Empresa',
      subtitle:
        'Formamos a tu equipo con casos reales de tu industria: presencial en tus instalaciones, en Campuslands o virtual.',
    },
    {
      id: 'lider',
      label: 'Líder de equipo',
      subtitle:
        'Lleva a tu equipo de los pilotos sueltos a agentes funcionales, con métricas de eficiencia listas para presentar.',
    },
    {
      id: 'independiente',
      label: 'Independiente',
      subtitle:
        'Deja las tareas repetitivas a la IA y dedica tu tiempo a vender, con prompts y automatizaciones que puedes usar desde el primer día.',
    },
  ],
};

export const urgency = {
  title: { before: 'Cada semana sin IA aplicada cuesta ', highlight: 'velocidad', after: ' y competitividad' },
  items: [
    {
      title: 'La IA ya es estándar operativo',
      text: 'Las empresas líderes integran IA en procesos diarios; cada semana de espera amplía la brecha competitiva.',
    },
    {
      title: 'El costo de esperar se acumula',
      text: 'Más horas manuales y más retrabajo frente a competidores que automatizan desde hoy.',
    },
    {
      title: 'Tu talento quiere crear, no repetir',
      text: 'Los equipos buscan herramientas que liberen tiempo para tareas estratégicas; si no se las das, las buscarán fuera.',
    },
    {
      title: 'Efecto compuesto del aprendizaje',
      text: 'Cada día sin práctica resta valor acumulado en prompts, agentes y casos listos para escalar.',
    },
  ],
};

export const benefits = {
  title: { before: '¿Por qué elegir ', highlight: 'Campuslands AI Academy', after: '?' },
  items: [
    { icon: 'practice', title: 'Formación práctica', text: 'Sesiones personalizadas de 4h, 8h y 12h con casos reales para tu negocio.' },
    { icon: 'deliverables', title: 'Entregables listos', text: 'Banco de prompts, guías operativas y agentes base adaptados a tu industria.' },
    { icon: 'support', title: 'Soporte continuo', text: 'Comunidad privada de WhatsApp y soporte posventa para resolver dudas.' },
    { icon: 'routes', title: 'Rutas flexibles', text: 'Cursos presenciales y virtuales por niveles con resultados medibles.' },
  ],
};

// Reseñas literales de la landing actual («IA Academy» → «AI Academy»).
// Se omiten las fechas relativas («Hace 2 semanas») porque caducan.
// TODO: confirmar que los testimonios están autorizados (manual, pág. 23).
export const reviews = [
  {
    name: 'Laura Gómez',
    role: 'Tech Lead en InnovApp',
    text: 'AI Academy nos dio herramientas concretas para acelerar nuestros procesos. El enfoque práctico nos permitió aplicar lo aprendido desde el primer día.',
  },
  {
    name: 'Carlos Herrera',
    role: 'Director de Talento, Grupo Andino',
    text: 'La formación de 8 horas fue ideal para nuestro equipo. Los casos por industria marcaron la diferencia y resolvieron dudas específicas.',
  },
  {
    name: 'Juliana Restrepo',
    role: 'Fundadora de CrecePyme',
    text: 'Más que un curso, fue una experiencia de estrategia digital. Las automatizaciones de seguimiento nos ahorran horas cada semana.',
  },
  {
    name: 'Miguel Ángel López',
    role: 'Profesor universitario',
    text: 'Excelente acompañamiento. Adaptaron el contenido a educación superior y nos dejaron material listo para incorporar en clase.',
  },
];
