/**
 * Simulation Engine — Pure function: params → 20-year dataset
 *
 * Causal chain (10 stages with feedback loops):
 *   1. AI Adoption
 *   2. Workforce Displacement
 *   3. Dual Business Effect (cost savings vs demand destruction)
 *   4. Consumer Spending (by income tier)
 *   5. Government Revenue (income, payroll, corporate, robot tax)
 *   6. Government Policy Response (UBI, retraining, robot tax, regulation)
 *   7. Inflation Dynamics
 *   8. Trade Competitiveness
 *   9. Second-Order Sectors (Academic, Healthcare, Financial Markets, Social Welfare)
 *  10. Inequality & Access Layer (Gini, mobility, children, intergenerational)
 *
 * Stability: dampening coefficients + hard bounds on all metrics
 */

import {
  AUTOMATION_VULNERABILITY,
  JOB_DISPLACEMENT_CURVES,
  CONSUMER_SPENDING_ELASTICITY,
  TAX_REVENUE_SENSITIVITY,
  AI_ACCESS_DISTRIBUTION,
  CHILD_OUTCOME_CORRELATIONS,
  UBI_EFFECTS,
  RETRAINING_SUCCESS_RATES,
  WAGE_POLARIZATION,
  INEQUALITY_BASELINES,
  INFLATION_DYNAMICS,
  TRADE_COMPETITIVENESS,
} from '../data/knowledgeBase.js';

import { clamp, dampen, policyRampUp, dampenFeedback } from './stabilityControls.js';

// ─── Default Parameters ──────────────────────────────────────────
export const DEFAULT_PARAMS = {
  // AI Adoption
  adoptionRate: 50,                 // 0–100 global slider
  adoptionCurve: 'gradual',        // gradual | accelerated | shock
  newJobCreationRate: 15,           // 0–50, % of displaced jobs replaced by new AI roles

  // Displacement
  displacementLow: 70,             // 0–100, vulnerability for low-skill
  displacementMid: 50,
  displacementHigh: 20,
  displacementTimeline: 5,         // 1–10 years to peak
  retrainingEffectiveness: 40,     // 0–80%

  // Inequality & Access
  aiAccessIndex: 50,               // 0–100 (0=concentrated, 100=universal)
  schoolAccessLow: 25,
  schoolAccessMid: 55,
  schoolAccessHigh: 82,
  geographicGap: 30,               // 0–100 (0=no gap, 100=extreme gap)

  // Policy Levers
  ubiEnabled: false,
  ubiAmount: 0,                    // $/month per adult (0–2000)
  retrainingSubsidies: 0,          // 0–100% of displaced covered
  robotTaxRate: 0,                 // 0–40% of labor cost savings
  regulatoryBrakes: 0,             // 0–5 years delay
  safetyNet: 'current',            // current | strengthened | minimal

  // Source overrides (which research sources are enabled)
  enabledSources: {},              // { sourceId: false } to disable
};

// ─── Main Simulation ─────────────────────────────────────────────
export function runSimulation(params = {}) {
  const p = { ...DEFAULT_PARAMS, ...params };
  const years = 21; // Year 0–20

  // Carryover accumulators for dampened effects
  const carryover = {
    spendingToProfit: 0,
    profitToHiring: 0,
    unemploymentToSpending: 0,
  };

  // Output accumulators
  const labor = [];
  const spending = [];
  const profits = [];
  const govRevenue = [];
  const academic = [];
  const healthcare = [];
  const financialMarkets = [];
  const socialWelfare = [];
  const inequality = [];
  const inflation = [];
  const trade = [];

  // Running state
  let prevEmployment = { low: 1.0, mid: 1.0, high: 1.0 }; // 1.0 = full employment
  let prevSpending = { low: 100, mid: 100, high: 100 };
  let prevProfitIndex = 100;
  let prevTaxIndex = 100;
  let prevGini = INEQUALITY_BASELINES.giniUS2024;
  let prevMobility = INEQUALITY_BASELINES.socialMobilityBaseline;
  let prevInflationRate = INFLATION_DYNAMICS.baselineRate;
  let prevTradeIndex = TRADE_COMPETITIVENESS.baselineIndex;
  let cumulativeCostSavings = 0;
  let cumulativeRevenueLoss = 0;

  const displacementCurve = JOB_DISPLACEMENT_CURVES[p.adoptionCurve] || JOB_DISPLACEMENT_CURVES.gradual;

  for (let year = 0; year < years; year++) {
    // ── [1] AI ADOPTION ──────────────────────────────────────
    // Regulatory brakes shift the curve right
    const effectiveYear = Math.max(0, year - p.regulatoryBrakes);
    const curveIndex = Math.min(effectiveYear, 20);
    const adoptionMultiplier = (p.adoptionRate / 100) * displacementCurve[curveIndex];

    // ── [2] WORKFORCE DISPLACEMENT ───────────────────────────
    const tierVulnerability = {
      low:  (p.displacementLow / 100),
      mid:  (p.displacementMid / 100),
      high: (p.displacementHigh / 100),
    };

    const rawDisplacement = {
      low:  adoptionMultiplier * tierVulnerability.low,
      mid:  adoptionMultiplier * tierVulnerability.mid,
      high: adoptionMultiplier * tierVulnerability.high,
    };

    // New job creation partially offsets displacement
    const newJobOffset = (p.newJobCreationRate / 100);

    // Retraining reduces net displacement
    const baseRetrain = RETRAINING_SUCCESS_RATES.byTier;
    const retrainBoost = p.retrainingSubsidies / 100;
    const retrainingEffect = {
      low:  baseRetrain.low * (1 + retrainBoost),
      mid:  baseRetrain.mid * (1 + retrainBoost),
      high: baseRetrain.high * (1 + retrainBoost),
    };

    // Net employment rate by tier (with feedback from profits→hiring)
    const hiringFeedback = dampenFeedback(carryover.profitToHiring);
    carryover.profitToHiring = 0;

    const employment = {
      low:  clamp('employmentRate', 1.0 - rawDisplacement.low * (1 - retrainingEffect.low * (p.retrainingEffectiveness / 80)) + newJobOffset * 0.3 + hiringFeedback * 0.4),
      mid:  clamp('employmentRate', 1.0 - rawDisplacement.mid * (1 - retrainingEffect.mid * (p.retrainingEffectiveness / 80)) + newJobOffset * 0.5 + hiringFeedback * 0.4),
      high: clamp('employmentRate', 1.0 - rawDisplacement.high * (1 - retrainingEffect.high * (p.retrainingEffectiveness / 80)) + newJobOffset * 0.2 + hiringFeedback * 0.2),
    };

    const avgEmployment = (employment.low * 0.30 + employment.mid * 0.50 + employment.high * 0.20);

    // ── [3] DUAL BUSINESS EFFECT ─────────────────────────────
    // Cost savings from automation
    const laborCostSavings = adoptionMultiplier * 40; // Up to 40 index points of savings
    // Revenue loss from reduced consumer demand
    const demandLoss = (1 - avgEmployment) * 80; // Unemployment maps to revenue loss

    const { applied: profitFromSpending, carryover: spendingCarry } =
      dampen('spendingToProfitLag', carryover.spendingToProfit);
    carryover.spendingToProfit = spendingCarry;

    const profitIndex = clamp('profitIndex',
      100 + laborCostSavings - demandLoss + profitFromSpending
    );

    cumulativeCostSavings += laborCostSavings;
    cumulativeRevenueLoss += demandLoss;

    // Feed profit changes back to hiring (for next year)
    const profitDelta = profitIndex - prevProfitIndex;
    const { applied: hiringEffect, carryover: hiringCarry } =
      dampen('profitToHiringLag', profitDelta * 0.005);
    carryover.profitToHiring = hiringCarry + hiringEffect; // next year picks this up

    // ── [4] CONSUMER SPENDING ────────────────────────────────
    const elasticity = CONSUMER_SPENDING_ELASTICITY.byTier;

    // AI access boost: workers with AI tools earn more
    const accessBoost = (p.aiAccessIndex / 100) * 0.1; // Up to 10% boost

    // UBI floor for low-income
    const ubiSpendingBoost = p.ubiEnabled
      ? policyRampUp((p.ubiAmount / UBI_EFFECTS.costPerAdultMonthly) * UBI_EFFECTS.spendingMultiplier * 20, year)
      : 0;

    // Feedback from previous unemployment
    const { applied: unemploymentEffect, carryover: unempCarry } =
      dampen('unemploymentToSpendingLag', carryover.unemploymentToSpending);
    carryover.unemploymentToSpending = unempCarry;

    const tierSpending = {
      low:  clamp('spendingIndex', 100 * employment.low * (1 + accessBoost * 0.3) + ubiSpendingBoost + unemploymentEffect),
      mid:  clamp('spendingIndex', 100 * employment.mid * (1 + accessBoost * 0.6) + unemploymentEffect),
      high: clamp('spendingIndex', 100 * employment.high * (1 + accessBoost * 1.0) + unemploymentEffect * 0.3),
    };

    const totalSpending = tierSpending.low * 0.20 + tierSpending.mid * 0.50 + tierSpending.high * 0.30;

    // Feed spending change to profit (for next iteration)
    const spendingDelta = totalSpending - (prevSpending.low * 0.20 + prevSpending.mid * 0.50 + prevSpending.high * 0.30);
    carryover.spendingToProfit += spendingDelta * 0.3;

    // Feed unemployment to spending (for next year)
    carryover.unemploymentToSpending += (avgEmployment - 1.0) * elasticity.mid * 5;

    // ── [5] GOVERNMENT REVENUE ───────────────────────────────
    const taxSens = TAX_REVENUE_SENSITIVITY;
    const incomeComponent = (avgEmployment * taxSens.incomeTax.employmentElasticity) * taxSens.incomeTax.shareOfRevenue;
    const payrollComponent = (avgEmployment * taxSens.payrollTax.employmentElasticity) * taxSens.payrollTax.shareOfRevenue;
    const corporateComponent = ((profitIndex / 100) * taxSens.corporateTax.profitElasticity) * taxSens.corporateTax.shareOfRevenue;
    const otherComponent = taxSens.otherRevenue.shareOfRevenue;

    const baseTaxIndex = (incomeComponent + payrollComponent + corporateComponent + otherComponent) * 100;

    // Robot tax revenue
    const robotTaxRevenue = (p.robotTaxRate / 100) * laborCostSavings * 0.5;

    const taxIndex = clamp('taxRevenueIndex', baseTaxIndex + robotTaxRevenue);

    // ── [6] POLICY EFFECTS ───────────────────────────────────
    // Policy costs drawn from tax revenue
    const ubiCost = p.ubiEnabled ? policyRampUp(p.ubiAmount * 0.015, year) : 0; // Scaled cost
    const retrainingCost = (p.retrainingSubsidies / 100) * 3; // Cost in index points
    const netTaxIndex = clamp('taxRevenueIndex', taxIndex - ubiCost - retrainingCost);

    // Safety net modifier
    const safetyNetMultiplier = p.safetyNet === 'strengthened' ? 1.15 : p.safetyNet === 'minimal' ? 0.70 : 1.0;

    // ── [7] INFLATION ────────────────────────────────────────
    const inflationRate = clamp('inflationRate',
      INFLATION_DYNAMICS.baselineRate
      + INFLATION_DYNAMICS.automationDeflationEffect * (adoptionMultiplier * 10)
      + INFLATION_DYNAMICS.wealthConcentrationInflation * ((prevGini - 0.39) * 100)
      + INFLATION_DYNAMICS.unemploymentDeflationEffect * ((1 - avgEmployment) * 20)
    );

    // ── [8] TRADE COMPETITIVENESS ────────────────────────────
    const tradeIndex = clamp('tradeIndex',
      TRADE_COMPETITIVENESS.baselineIndex
      + TRADE_COMPETITIVENESS.automationAdvantagePerPoint * (adoptionMultiplier * 30)
      + TRADE_COMPETITIVENESS.laborCostReductionEffect * laborCostSavings
      + TRADE_COMPETITIVENESS.domesticDemandDragEffect * (100 - totalSpending)
    );

    // ── [9] SECOND-ORDER SECTORS ─────────────────────────────
    // Academic: full mechanics — enrollment driven by retraining demand + credential relevance
    const retrainingDemand = (1 - avgEmployment) * 100 * (p.retrainingSubsidies / 100);
    const credentialRelevance = clamp('spendingIndex', 100 - adoptionMultiplier * 30 + retrainingDemand * 0.3);
    const academicIndex = {
      enrollment: clamp('spendingIndex', 100 + retrainingDemand * 0.5 - adoptionMultiplier * 10),
      relevance: credentialRelevance,
      primary: (100 + retrainingDemand * 0.5 - adoptionMultiplier * 10 + credentialRelevance) / 2,
    };

    // Healthcare: full mechanics — demand from stress/inequality vs AI efficiency
    const stressDemand = (1 - avgEmployment) * 40 + (prevGini - 0.39) * 200;
    const aiEfficiency = adoptionMultiplier * 15;
    const healthcareIndex = {
      demandPressure: clamp('spendingIndex', 100 + stressDemand),
      accessIndex: clamp('spendingIndex', 100 - (prevGini - 0.39) * 100 + aiEfficiency),
      primary: clamp('spendingIndex', 100 + stressDemand * 0.5 - aiEfficiency * 0.3),
    };

    // Financial Markets: derived from core sectors
    const marketStability = clamp('spendingIndex',
      profitIndex * 0.4 + totalSpending * 0.2 + (100 - (prevGini - 0.30) * 200) * 0.2 + tradeIndex * 0.2
    );

    // Social Welfare: derived from core sectors
    const welfareNeed = (1 - avgEmployment) * 100;
    const welfareFunding = netTaxIndex * safetyNetMultiplier;
    const welfareGap = Math.max(0, welfareNeed - welfareFunding * 0.5);

    // ── [10] INEQUALITY & ACCESS ─────────────────────────────
    // Gini update: driven by wage polarization + policy effects
    const wagePolarization = adoptionMultiplier * (
      Math.abs(WAGE_POLARIZATION.annualRates.high - WAGE_POLARIZATION.annualRates.low)
    );
    const unemploymentInequality = (1 - avgEmployment) * 0.15; // Unemployment directly drives inequality
    const policyEqualizing = (p.ubiEnabled ? 0.003 : 0) + (p.robotTaxRate / 100) * 0.005;
    // Access equity: only equalizing when access is above 50; below 50 it worsens inequality
    const accessEffect = ((p.aiAccessIndex - 50) / 100) * 0.003;
    const gini = clamp('giniCoefficient',
      prevGini + wagePolarization * 0.02 + unemploymentInequality * 0.01 - policyEqualizing - accessEffect
    );

    // Social mobility
    const mobilityDelta = -wagePolarization * 8 - unemploymentInequality * 3
      + (p.retrainingSubsidies / 100) * 3 + accessEffect * 50;
    const mobility = clamp('socialMobility', prevMobility + mobilityDelta * 0.3);

    // Children's educational achievement gap
    const schoolGap = Math.abs(p.schoolAccessHigh - p.schoolAccessLow);
    const achievementGap = schoolGap * CHILD_OUTCOME_CORRELATIONS.achievementGapPerAccessPoint * (1 + year * 0.1);

    // Intergenerational opportunity score
    const intergenScore = clamp('socialMobility',
      mobility * 0.5 + (100 - gini * 100) * 0.3 + (100 - achievementGap * 10) * 0.2
    );

    // ── Health Status Determination ──────────────────────────
    const getHealth = (value, good, warn) => {
      if (value >= good) return 'good';
      if (value >= warn) return 'warning';
      return 'critical';
    };

    // ── Store Results ────────────────────────────────────────
    labor.push({
      year,
      value: avgEmployment * 100,
      subMetrics: { low: employment.low * 100, mid: employment.mid * 100, high: employment.high * 100 },
      healthStatus: getHealth(avgEmployment * 100, 90, 75),
    });

    spending.push({
      year,
      value: totalSpending,
      subMetrics: { ...tierSpending },
      healthStatus: getHealth(totalSpending, 90, 70),
    });

    profits.push({
      year,
      value: profitIndex,
      subMetrics: { costSavings: laborCostSavings, demandLoss, net: profitIndex - 100 },
      healthStatus: getHealth(profitIndex, 95, 75),
    });

    govRevenue.push({
      year,
      value: netTaxIndex,
      subMetrics: {
        incomeTax: incomeComponent * 100,
        payrollTax: payrollComponent * 100,
        corporateTax: corporateComponent * 100,
        robotTax: robotTaxRevenue,
        policyCost: ubiCost + retrainingCost,
      },
      healthStatus: getHealth(netTaxIndex, 85, 65),
    });

    academic.push({
      year,
      value: academicIndex.primary,
      subMetrics: { enrollment: academicIndex.enrollment, relevance: academicIndex.relevance },
      healthStatus: getHealth(academicIndex.primary, 90, 70),
    });

    healthcare.push({
      year,
      value: healthcareIndex.primary,
      subMetrics: { demandPressure: healthcareIndex.demandPressure, access: healthcareIndex.accessIndex },
      healthStatus: getHealth(healthcareIndex.accessIndex, 85, 65),
    });

    financialMarkets.push({
      year,
      value: marketStability,
      subMetrics: {},
      healthStatus: getHealth(marketStability, 85, 65),
    });

    socialWelfare.push({
      year,
      value: welfareGap,
      subMetrics: { need: welfareNeed, funding: welfareFunding, gap: welfareGap },
      healthStatus: welfareGap < 10 ? 'good' : welfareGap < 25 ? 'warning' : 'critical',
    });

    inequality.push({
      year,
      gini,
      socialMobility: mobility,
      achievementGap,
      intergenScore,
      healthStatus: gini < INEQUALITY_BASELINES.giniWarningThreshold ? 'good'
        : gini < INEQUALITY_BASELINES.giniCriticalThreshold ? 'warning' : 'critical',
    });

    inflation.push({ year, value: inflationRate * 100 });
    trade.push({ year, value: tradeIndex });

    // ── Update State for Next Year ───────────────────────────
    prevEmployment = employment;
    prevSpending = tierSpending;
    prevProfitIndex = profitIndex;
    prevTaxIndex = netTaxIndex;
    prevGini = gini;
    prevMobility = mobility;
    prevInflationRate = inflationRate;
    prevTradeIndex = tradeIndex;
  }

  return {
    years: Array.from({ length: years }, (_, i) => i),
    sectors: {
      labor,
      spending,
      profits,
      govRevenue,
      academic,
      healthcare,
      financialMarkets,
      socialWelfare,
      inequality,
      inflation,
      trade,
    },
    params: p,
  };
}
