import type { Observation, UserTargets } from './types';

const userId = 'fixture-user';
const day = '2026-09-17T06:00:00.000Z';

export const coldStartFixture = {
  userId,
  targets: { seasonId: null, dimensionWeights: {} } satisfies UserTargets,
  observations: [] satisfies Observation[],
};

export const normalHistoryFixture = {
  userId,
  targets: {
    seasonId: 'steady',
    dimensionWeights: { recovery: 1, connection: 1, work: 1 },
  } satisfies UserTargets,
  observations: [
    { id: 'n1', userId, dimensionId: 'recovery', metric: 'energy', value: 72, observedAt: day, source: 'self_reported' },
    { id: 'n2', userId, dimensionId: 'connection', metric: 'connection', value: 68, observedAt: day, source: 'self_reported' },
    { id: 'n3', userId, dimensionId: 'work', metric: 'load', value: 55, observedAt: day, source: 'self_reported' },
  ] satisfies Observation[],
};

export const sparseFixture = {
  userId,
  targets: { seasonId: null, dimensionWeights: { recovery: 1 } } satisfies UserTargets,
  observations: [
    { id: 's1', userId, dimensionId: 'recovery', metric: 'energy', value: 44, observedAt: day, source: 'self_reported' },
  ] satisfies Observation[],
};

export const overloadedFixture = {
  userId,
  targets: {
    seasonId: 'intense-work',
    dimensionWeights: { recovery: 1.4, work: 1.2, margin: 1.1 },
  } satisfies UserTargets,
  observations: [
    { id: 'o1', userId, dimensionId: 'recovery', metric: 'energy', value: 24, observedAt: day, source: 'self_reported' },
    { id: 'o2', userId, dimensionId: 'work', metric: 'load', value: 91, observedAt: day, source: 'self_reported' },
    { id: 'o3', userId, dimensionId: 'margin', metric: 'free_time_minutes', value: 10, observedAt: day, source: 'observed' },
  ] satisfies Observation[],
};
