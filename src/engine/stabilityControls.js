/**
 * Stability Controls — Dampening and Bounds
 *
 * Prevents feedback loops from causing unrealistic oscillation or divergence.
 * Two mechanisms:
 *   1. Dampening: Effects propagate partially per year with lag
 *   2. Hard bounds: Every metric has a floor and ceiling
 */

import { STABILITY } from '../data/knowledgeBase.js';

/**
 * Clamp a value to its defined bounds
 */
export function clamp(metric, value) {
  const bounds = STABILITY.bounds[metric];
  if (!bounds) return value;
  return Math.max(bounds.min, Math.min(bounds.max, value));
}

/**
 * Apply dampening to a change in value.
 * Returns the portion of the change that takes effect this year.
 * The remainder carries over to the next year via the carryover return.
 *
 * @param {string} effectType - Key in STABILITY.dampening
 * @param {number} fullChange - The full magnitude of the change
 * @returns {{ applied: number, carryover: number }}
 */
export function dampen(effectType, fullChange) {
  const factor = STABILITY.dampening[effectType] ?? STABILITY.dampening.feedbackStrength;
  const applied = fullChange * factor;
  const carryover = fullChange - applied;
  return { applied, carryover };
}

/**
 * Apply policy effect with multi-year ramp-up.
 * Policies don't take full effect immediately.
 *
 * @param {number} fullEffect - The policy's maximum effect
 * @param {number} yearsActive - How many years the policy has been active
 * @returns {number} The actual effect this year
 */
export function policyRampUp(fullEffect, yearsActive) {
  if (yearsActive <= 0) return 0;
  const delay = STABILITY.dampening.policyEffectDelay;
  // Year 1: 40%, Year 2: 70%, Year 3+: 100%
  const ramp = Math.min(1.0, delay + (1 - delay) * ((yearsActive - 1) / 2));
  return fullEffect * ramp;
}

/**
 * Apply global feedback dampening to prevent runaway loops.
 * All feedback effects pass through this before being applied.
 */
export function dampenFeedback(change) {
  return change * STABILITY.dampening.feedbackStrength;
}

/**
 * Get bounds for a metric (for UI display)
 */
export function getBounds(metric) {
  return STABILITY.bounds[metric] ?? { min: 0, max: 100 };
}
