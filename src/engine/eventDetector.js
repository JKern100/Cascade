/**
 * Event Detector — Identifies crossovers, tipping points, recovery signals, and milestones
 *
 * Runs post-simulation to annotate the dataset with significant events.
 */

import { INEQUALITY_BASELINES } from '../data/knowledgeBase.js';

/**
 * Detect all significant events in a simulation result
 * @param {object} result - Output from runSimulation()
 * @returns {object} { events: [...], crossoverPoints: [...] }
 */
export function detectEvents(result) {
  const { sectors } = result;
  const events = [];
  const crossoverPoints = [];

  for (let year = 1; year <= 20; year++) {
    const y = year;

    // ── Crossover Points ─────────────────────────────────────
    // Year when cumulative demand destruction exceeds automation savings
    const profit = sectors.profits[year];
    const prevProfit = sectors.profits[year - 1];
    if (profit && prevProfit) {
      if (prevProfit.subMetrics.costSavings >= prevProfit.subMetrics.demandLoss &&
          profit.subMetrics.costSavings < profit.subMetrics.demandLoss) {
        crossoverPoints.push({
          year: y,
          type: 'demand_destruction_crossover',
          title: 'Demand Destruction Crossover',
          description: `Year ${y}: Consumer demand loss now exceeds automation cost savings. Business profit gains from automation are being eroded by the shrinking customer base.`,
          metrics: {
            costSavings: profit.subMetrics.costSavings.toFixed(1),
            demandLoss: profit.subMetrics.demandLoss.toFixed(1),
            profitIndex: profit.value.toFixed(1),
          },
        });
      }
    }

    // ── Tipping Points ───────────────────────────────────────
    // Employment drops below critical threshold
    const labor = sectors.labor[year];
    if (labor && labor.healthStatus === 'critical' &&
        sectors.labor[year - 1]?.healthStatus !== 'critical') {
      events.push({
        year: y,
        type: 'tipping_point',
        sector: 'labor',
        severity: 'critical',
        title: 'Employment Crisis',
        description: `Year ${y}: Net employment drops to ${labor.value.toFixed(1)}%. The labor market has entered critical territory.`,
      });
    }

    // Consumer spending collapse
    const spend = sectors.spending[year];
    if (spend && spend.value < 70 && sectors.spending[year - 1]?.value >= 70) {
      events.push({
        year: y,
        type: 'tipping_point',
        sector: 'spending',
        severity: 'critical',
        title: 'Consumer Spending Collapse',
        description: `Year ${y}: Consumer spending drops below 70% of baseline. The demand side of the economy is in serious contraction.`,
      });
    }

    // Government revenue crisis
    const gov = sectors.govRevenue[year];
    if (gov && gov.value < 65 && sectors.govRevenue[year - 1]?.value >= 65) {
      events.push({
        year: y,
        type: 'tipping_point',
        sector: 'govRevenue',
        severity: 'critical',
        title: 'Fiscal Crisis',
        description: `Year ${y}: Government revenue falls to ${gov.value.toFixed(1)}% of baseline. Current safety net programs become fiscally unsustainable without new revenue sources.`,
      });
    }

    // ── Inequality Milestones ────────────────────────────────
    const ineq = sectors.inequality[year];
    const prevIneq = sectors.inequality[year - 1];

    if (ineq && prevIneq) {
      // Gini crosses warning threshold
      if (prevIneq.gini < INEQUALITY_BASELINES.giniWarningThreshold &&
          ineq.gini >= INEQUALITY_BASELINES.giniWarningThreshold) {
        events.push({
          year: y,
          type: 'inequality_milestone',
          severity: 'warning',
          title: 'Inequality Warning Level',
          description: `Year ${y}: Gini coefficient reaches ${ineq.gini.toFixed(3)}, crossing the historical instability threshold of ${INEQUALITY_BASELINES.giniWarningThreshold}.`,
        });
      }

      // Gini crosses critical threshold
      if (prevIneq.gini < INEQUALITY_BASELINES.giniCriticalThreshold &&
          ineq.gini >= INEQUALITY_BASELINES.giniCriticalThreshold) {
        events.push({
          year: y,
          type: 'inequality_milestone',
          severity: 'critical',
          title: 'Severe Inequality',
          description: `Year ${y}: Gini coefficient reaches ${ineq.gini.toFixed(3)}. Inequality is now at levels historically associated with significant social instability.`,
        });
      }

      // Children's achievement gap milestone
      if (ineq.achievementGap > 1.5 && prevIneq.achievementGap <= 1.5) {
        events.push({
          year: y,
          type: 'inequality_milestone',
          severity: 'warning',
          title: 'Educational Achievement Gap',
          description: `Year ${y}: Children in low-income schools fall ${ineq.achievementGap.toFixed(1)} grade levels behind peers with AI access. The gap is projected to widen.`,
        });
      }
    }

    // ── Recovery Signals ─────────────────────────────────────
    // Spending recovers after decline
    if (spend && sectors.spending[year - 1] && year >= 3) {
      const twoYearsAgo = sectors.spending[year - 2]?.value ?? 100;
      const oneYearAgo = sectors.spending[year - 1]?.value ?? 100;
      if (twoYearsAgo > oneYearAgo && oneYearAgo < spend.value && spend.value < 95) {
        events.push({
          year: y,
          type: 'recovery_signal',
          sector: 'spending',
          severity: 'info',
          title: 'Spending Recovery',
          description: `Year ${y}: Consumer spending begins recovering after a decline, now at ${spend.value.toFixed(1)}. Policy interventions may be bending the curve.`,
        });
      }
    }

    // Employment stabilizes after decline
    if (labor && sectors.labor[year - 1] && year >= 3) {
      const twoYearsAgo = sectors.labor[year - 2]?.value ?? 100;
      const oneYearAgo = sectors.labor[year - 1]?.value ?? 100;
      if (twoYearsAgo > oneYearAgo && Math.abs(oneYearAgo - labor.value) < 1.0 && labor.value < 90) {
        events.push({
          year: y,
          type: 'recovery_signal',
          sector: 'labor',
          severity: 'info',
          title: 'Employment Stabilization',
          description: `Year ${y}: Employment rate stabilizes at ${labor.value.toFixed(1)}%. The pace of displacement may be slowing.`,
        });
      }
    }

    // ── Sector Health Transitions ────────────────────────────
    const sectorChecks = [
      { name: 'labor', data: sectors.labor },
      { name: 'spending', data: sectors.spending },
      { name: 'profits', data: sectors.profits },
      { name: 'govRevenue', data: sectors.govRevenue },
    ];

    for (const { name, data } of sectorChecks) {
      if (data[year] && data[year - 1]) {
        if (data[year - 1].healthStatus === 'good' && data[year].healthStatus === 'warning') {
          events.push({
            year: y,
            type: 'health_transition',
            sector: name,
            severity: 'warning',
            title: `${formatSectorName(name)} Under Pressure`,
            description: `Year ${y}: ${formatSectorName(name)} moves from stable to warning status.`,
          });
        }
      }
    }
  }

  // Sort events by year
  events.sort((a, b) => a.year - b.year);
  crossoverPoints.sort((a, b) => a.year - b.year);

  return { events, crossoverPoints };
}

function formatSectorName(key) {
  const names = {
    labor: 'Labor Market',
    spending: 'Consumer Spending',
    profits: 'Business Profits',
    govRevenue: 'Government Revenue',
    academic: 'Academic Institutions',
    healthcare: 'Healthcare',
    financialMarkets: 'Financial Markets',
    socialWelfare: 'Social Welfare',
  };
  return names[key] || key;
}
