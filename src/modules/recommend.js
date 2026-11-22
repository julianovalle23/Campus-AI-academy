// Lógica del recomendador de misiones: función pura, sin DOM ni animación.
// Reglas (en orden; también documentadas en el README):
//  1. Objetivo «a la medida»            → Odyssey.
//  2. Tiempo «a mi ritmo»               → Nebula (pregrabado).
//  3. Si no, el objetivo define la misión base:
//       entender → Ignition · dominar → Booster · automatizar → Liftoff.
//  4. Tope de tiempo: si la misión base dura más de las horas disponibles,
//     se recomienda la misión más completa que cabe, y la base queda como
//     siguiente paso (alternativa).
//  5. Empresa o varias áreas (y la misión no es Odyssey) → la alternativa
//     sugerida pasa a ser Odyssey, que se adapta a industria y roles.
// Las razones citan textos literales de los planes (src/data/plans.js).

import { plans, planById } from '../data/plans.js';

const GOAL_PLAN = { entender: 'ignition', dominar: 'booster', automatizar: 'liftoff' };
const TIMED = plans.filter((p) => p.hours != null).sort((a, b) => a.hours - b.hours);

const VALID = {
  team: ['solo', 'equipo', 'empresa'],
  time: ['4', '8', '12', 'flexible'],
  goal: ['entender', 'dominar', 'automatizar', 'medida'],
};

const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * @param {{ team: string, time: string, goal: string }} answers
 * @returns {{ planId: string, reasons: string[], alternativeId: string | null }}
 */
export function recommendPlan(answers) {
  for (const key of Object.keys(VALID)) {
    if (!VALID[key].includes(answers?.[key])) {
      throw new TypeError(`Respuesta inválida para «${key}»: ${answers?.[key]}`);
    }
  }
  const { team, time, goal } = answers;
  const hours = time === 'flexible' ? null : Number(time);
  const reasons = [];
  let planId;
  let alternativeId = null;

  if (goal === 'medida') {
    // Regla 1
    planId = 'odyssey';
    reasons.push(
      `Buscas un programa a la medida: Odyssey es un ${lower(planById.odyssey.includes[0])} y te deja elegir herramientas, duración y profundidad.`,
    );
    alternativeId = hours ? fitByHours(hours).id : 'nebula';
  } else if (hours === null) {
    // Regla 2
    planId = 'nebula';
    reasons.push(
      `Prefieres avanzar a tu ritmo: Nebula es pregrabado, con ${lower(planById.nebula.includes[2])}.`,
    );
    alternativeId = GOAL_PLAN[goal];
  } else {
    // Reglas 3 y 4
    const base = planById[GOAL_PLAN[goal]];
    reasons.push(goalReason(goal));
    if (base.hours > hours) {
      const fit = fitByHours(hours);
      planId = fit.id;
      reasons.push(
        `Con ${hours} horas disponibles, ${fit.name} (${fit.duration}) es la misión que completas; ${base.name} queda como siguiente paso.`,
      );
      alternativeId = base.id;
    } else {
      planId = base.id;
      reasons.push(`Cabe en el tiempo que tienes: ${base.name} dura ${base.duration}.`);
      const next = TIMED.find((p) => p.hours > base.hours && p.hours <= hours);
      alternativeId = next ? next.id : null;
    }
  }

  if (team === 'equipo' && planId !== 'nebula') {
    reasons.push('Para tu equipo: las sesiones se personalizan con casos reales de tu negocio.');
  }
  if (team === 'empresa' && planId !== 'odyssey') {
    // Regla 5
    reasons.push(
      `Para una empresa o varias áreas, Odyssey suma ${lower(planById.odyssey.includes[2])}: vale la pena compararlo.`,
    );
    alternativeId = 'odyssey';
  }

  if (alternativeId === planId) alternativeId = null;
  return { planId, reasons, alternativeId };
}

/** La misión en vivo más completa que cabe en las horas disponibles. */
function fitByHours(hours) {
  return [...TIMED].reverse().find((p) => p.hours <= hours) ?? TIMED[0];
}

function goalReason(goal) {
  const p = planById[GOAL_PLAN[goal]];
  const intro = {
    entender: 'Quieres entender la IA y empezar a usarla',
    dominar: 'Quieres dominar herramientas y crear agentes para tu rol',
    automatizar: 'Quieres automatizar procesos de tu operación',
  }[goal];
  const detail = { entender: 0, dominar: 3, automatizar: 2 }[goal];
  return `${intro}. ${p.name} incluye: «${p.includes[detail]}».`;
}
