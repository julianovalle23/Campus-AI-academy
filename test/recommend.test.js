import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendPlan } from '../src/modules/recommend.js';
import { questions } from '../src/data/recommender.js';

const rec = (team, time, goal) => recommendPlan({ team, time, goal });

test('regla 1: objetivo a la medida → Odyssey', () => {
  assert.equal(rec('empresa', '8', 'medida').planId, 'odyssey');
  assert.equal(rec('solo', 'flexible', 'medida').planId, 'odyssey');
  assert.equal(rec('empresa', '8', 'medida').alternativeId, 'booster');
  assert.equal(rec('solo', 'flexible', 'medida').alternativeId, 'nebula');
});

test('regla 2: a mi ritmo → Nebula, con la misión del objetivo como alternativa', () => {
  const r = rec('solo', 'flexible', 'automatizar');
  assert.equal(r.planId, 'nebula');
  assert.equal(r.alternativeId, 'liftoff');
});

test('regla 3: el objetivo define la misión base cuando hay tiempo', () => {
  assert.equal(rec('solo', '12', 'entender').planId, 'ignition');
  assert.equal(rec('solo', '12', 'dominar').planId, 'booster');
  assert.equal(rec('solo', '12', 'automatizar').planId, 'liftoff');
});

test('regla 4: el tiempo disponible limita la misión', () => {
  const r = rec('solo', '4', 'automatizar');
  assert.equal(r.planId, 'ignition');
  assert.equal(r.alternativeId, 'liftoff');
  assert.equal(rec('equipo', '8', 'automatizar').planId, 'booster');
});

test('regla 4: con tiempo de sobra sugiere la siguiente misión que cabe', () => {
  assert.equal(rec('solo', '12', 'entender').alternativeId, 'booster');
  assert.equal(rec('solo', '8', 'dominar').alternativeId, null);
});

test('regla 5: empresa → Odyssey como alternativa', () => {
  const r = rec('empresa', '8', 'dominar');
  assert.equal(r.planId, 'booster');
  assert.equal(r.alternativeId, 'odyssey');
});

test('siempre explica el porqué y nunca repite la misión como alternativa', () => {
  for (const team of questions[0].options.map((o) => o.value))
    for (const time of questions[1].options.map((o) => o.value))
      for (const goal of questions[2].options.map((o) => o.value)) {
        const r = rec(team, time, goal);
        assert.ok(r.reasons.length >= 1, `${team}/${time}/${goal} sin razones`);
        assert.notEqual(r.planId, r.alternativeId);
      }
});

test('rechaza respuestas incompletas o inválidas', () => {
  assert.throws(() => recommendPlan({ team: 'solo', time: '8' }), TypeError);
  assert.throws(() => rec('solo', '6', 'entender'), TypeError);
});
