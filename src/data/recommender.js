// Preguntas del recomendador de misiones. La lógica vive en
// src/modules/recommend.js (función pura y testeable).

export const questions = [
  {
    id: 'team',
    title: '¿Para quién es la formación?',
    options: [
      { value: 'solo', label: 'Solo para mí' },
      { value: 'equipo', label: 'Para mi equipo (2 a 10 personas)' },
      { value: 'empresa', label: 'Para mi empresa o varias áreas' },
    ],
  },
  {
    id: 'time',
    title: '¿Cuánto tiempo pueden dedicarle?',
    options: [
      { value: '4', label: 'Media jornada (4 horas)' },
      { value: '8', label: 'Una jornada (8 horas)' },
      { value: '12', label: 'Más de una jornada (12 horas)' },
      { value: 'flexible', label: 'A mi ritmo, sin horario fijo' },
    ],
  },
  {
    id: 'goal',
    title: '¿Qué quieres lograr?',
    options: [
      { value: 'entender', label: 'Entender la IA y empezar a usarla' },
      { value: 'dominar', label: 'Dominar herramientas y crear agentes para mi rol' },
      { value: 'automatizar', label: 'Automatizar procesos de mi operación' },
      { value: 'medida', label: 'Un programa a la medida de mi empresa' },
    ],
  },
];

/** Respuesta precargada a la primera pregunta según el perfil elegido en el hero. */
export const teamFromProfile = {
  independiente: 'solo',
  lider: 'equipo',
  empresa: 'empresa',
};
