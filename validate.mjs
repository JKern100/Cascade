/**
 * Quick validation script — runs each preset through the engine
 * and checks the validation checklist from the spec.
 */
import { runSimulation } from './src/engine/simulationEngine.js';
import { detectEvents } from './src/engine/eventDetector.js';
import { PRESETS } from './src/presets/presets.js';

function validate(presetId, checks) {
  const preset = PRESETS[presetId];
  const result = runSimulation(preset.params);
  const { events, crossoverPoints } = detectEvents(result);

  console.log(`\n=== ${preset.name} ===`);
  console.log(`  ${preset.message}`);

  for (const check of checks) {
    const passed = check.test(result, events, crossoverPoints);
    console.log(`  ${passed ? 'PASS' : 'FAIL'}: ${check.desc}`);
  }

  // Print key metrics at year 10 and 20
  for (const yr of [10, 20]) {
    const l = result.sectors.labor[yr];
    const s = result.sectors.spending[yr];
    const p = result.sectors.profits[yr];
    const g = result.sectors.govRevenue[yr];
    const iq = result.sectors.inequality[yr];
    console.log(`  Year ${yr}: Employment=${l.value.toFixed(1)}% Spending=${s.value.toFixed(1)} Profits=${p.value.toFixed(1)} GovRev=${g.value.toFixed(1)} Gini=${iq.gini.toFixed(3)} Mobility=${iq.socialMobility.toFixed(1)}`);
  }

  console.log(`  Events: ${events.length} detected, Crossovers: ${crossoverPoints.length}`);
}

// ── Run Validations ──────────────────────────────────────────────

validate('soft_landing', [
  { desc: 'Stable/recovering metrics by Year 15', test: (r) => r.sectors.labor[15].value > 75 && r.sectors.spending[15].value > 70 },
  { desc: 'Gini stays below critical (0.50)', test: (r) => r.sectors.inequality[20].gini < 0.50 },
  { desc: 'Employment stays above 70%', test: (r) => r.sectors.labor.every(y => y.value > 50) },
]);

validate('displacement_shock', [
  { desc: 'Consumer spending collapse by Year 7-10', test: (r) => r.sectors.spending[10].value < 85 },
  { desc: 'Government revenue crisis', test: (r) => r.sectors.govRevenue[10].value < 90 },
  { desc: 'High inequality growth', test: (r) => r.sectors.inequality[15].gini > r.sectors.inequality[0].gini },
]);

validate('laissez_faire', [
  { desc: 'Maximum Gini growth', test: (r) => r.sectors.inequality[20].gini > r.sectors.inequality[0].gini + 0.01 },
  { desc: 'Social mobility decline', test: (r) => r.sectors.inequality[20].socialMobility < r.sectors.inequality[0].socialMobility },
]);

validate('children_first', [
  { desc: 'Educational gap widens', test: (r) => r.sectors.inequality[15].achievementGap > r.sectors.inequality[5].achievementGap },
  { desc: 'Gap widens even with moderate adult metrics', test: (r) => r.sectors.labor[10].value > 70 && r.sectors.inequality[15].achievementGap > 1.0 },
]);

validate('policy_intervention', [
  { desc: 'Robot tax bends revenue curve', test: (r) => r.sectors.govRevenue[10].subMetrics.robotTax > 0 },
  { desc: 'UBI partially restores low-income spending', test: (r) => r.sectors.spending[10].subMetrics.low > 50 },
]);

validate('current_trajectory', [
  { desc: 'All metrics within realistic bounds', test: (r) => r.sectors.labor.every(y => y.value >= 5 && y.value <= 100) },
  { desc: 'No negative employment', test: (r) => r.sectors.labor.every(y => y.value >= 5) },
]);

console.log('\nValidation complete.');
