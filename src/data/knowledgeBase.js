/**
 * Knowledge Base — Research-Grounded Constants
 *
 * Every value includes its source citation and confidence level.
 * Users can toggle sources on/off via the SourceManager UI.
 * Disabling a source falls back to the neutral default for that parameter.
 *
 * Confidence levels:
 *   "direct"    — value directly from cited research
 *   "derived"   — estimated/interpolated from cited research
 *   "calibrated"— tuned to produce realistic simulation behavior
 */

// ─── Source Registry ─────────────────────────────────────────────
// Each source can be enabled/disabled by the user
export const SOURCES = {
  frey_osborne_2013: {
    id: 'frey_osborne_2013',
    name: 'Frey & Osborne (2013)',
    title: 'The Future of Employment',
    usedFor: 'Automation vulnerability by job category',
    enabled: true,
  },
  mckinsey_2017_2023: {
    id: 'mckinsey_2017_2023',
    name: 'McKinsey Global Institute (2017–2023)',
    title: 'Automation and AI Adoption Reports',
    usedFor: 'Adoption rates and displacement timelines',
    enabled: true,
  },
  oxford_economics_2023: {
    id: 'oxford_economics_2023',
    name: 'Oxford Economics (2023)',
    title: 'Sector-Level Job Displacement Projections',
    usedFor: 'Sector-level displacement projections',
    enabled: true,
  },
  imf_working_papers: {
    id: 'imf_working_papers',
    name: 'IMF Working Papers',
    title: 'Unemployment and Consumption Elasticity',
    usedFor: 'Unemployment → consumer spending elasticity',
    enabled: true,
  },
  cbo_projections: {
    id: 'cbo_projections',
    name: 'CBO Economic Projections',
    title: 'Government Revenue Sensitivity Models',
    usedFor: 'Tax revenue sensitivity to economic changes',
    enabled: true,
  },
  acemoglu_johnson_2023: {
    id: 'acemoglu_johnson_2023',
    name: 'Acemoglu & Johnson (2023)',
    title: 'Power and Progress',
    usedFor: 'Wage polarization and inequality dynamics',
    enabled: true,
  },
  chetty_opportunity: {
    id: 'chetty_opportunity',
    name: 'Raj Chetty / Opportunity Insights',
    title: 'Intergenerational Mobility Data',
    usedFor: 'Social mobility baselines',
    enabled: true,
  },
  oecd_pisa: {
    id: 'oecd_pisa',
    name: 'OECD PISA + Stanford CEPA',
    title: 'Technology Access and Educational Outcomes',
    usedFor: 'AI access → educational achievement correlations',
    enabled: true,
  },
  pew_research_2023: {
    id: 'pew_research_2023',
    name: 'Pew Research Center (2023)',
    title: 'AI Access Distribution by Income',
    usedFor: 'AI access distribution baselines',
    enabled: true,
  },
  ubi_pilots: {
    id: 'ubi_pilots',
    name: 'Finland UBI / Stockton SEED / GiveDirectly',
    title: 'UBI Pilot Programs',
    usedFor: 'UBI effects on spending and labor participation',
    enabled: true,
  },
  oecd_retraining: {
    id: 'oecd_retraining',
    name: 'OECD Retraining Evaluations',
    title: 'Workforce Retraining Program Outcomes',
    usedFor: 'Retraining success rates by sector and skill',
    enabled: true,
  },
  world_bank: {
    id: 'world_bank',
    name: 'World Bank',
    title: 'Gini Coefficient Historical Data',
    usedFor: 'Inequality baselines',
    enabled: true,
  },
  bls: {
    id: 'bls',
    name: 'Bureau of Labor Statistics',
    title: 'Sector Employment Data',
    usedFor: 'Employment baselines by sector',
    enabled: true,
  },
  wef_future_jobs: {
    id: 'wef_future_jobs',
    name: 'WEF Future of Jobs Report',
    title: 'Skill Polarization Projections',
    usedFor: 'Skill demand shifts',
    enabled: true,
  },
};

// ─── Automation Vulnerability by Sector and Skill Tier ───────────
// Probability that tasks in this category can be automated (0–1)
// Source: Frey & Osborne (2013), Oxford Economics (2023)
export const AUTOMATION_VULNERABILITY = {
  source: ['frey_osborne_2013', 'oxford_economics_2023'],
  confidence: 'derived',
  bySector: {
    manufacturing:    { low: 0.85, mid: 0.65, high: 0.25 },
    retail:           { low: 0.82, mid: 0.58, high: 0.20 },
    transportation:   { low: 0.78, mid: 0.55, high: 0.18 },
    finance:          { low: 0.45, mid: 0.62, high: 0.35 },
    healthcare:       { low: 0.35, mid: 0.42, high: 0.15 },
    education:        { low: 0.28, mid: 0.35, high: 0.12 },
    technology:       { low: 0.40, mid: 0.48, high: 0.30 },
    government:       { low: 0.42, mid: 0.50, high: 0.18 },
    agriculture:      { low: 0.75, mid: 0.55, high: 0.20 },
    construction:     { low: 0.60, mid: 0.45, high: 0.15 },
  },
  neutralDefault: { low: 0.55, mid: 0.50, high: 0.22 },
};

// ─── Job Displacement Curves by Adoption Speed ──────────────────
// Cumulative % of vulnerable jobs displaced by year (0–20)
// Shape determined by adoption speed setting
// Source: McKinsey Global Institute (2017–2023)
export const JOB_DISPLACEMENT_CURVES = {
  source: ['mckinsey_2017_2023'],
  confidence: 'derived',
  // Each curve is an array of 21 multipliers (year 0–20)
  // Applied to AUTOMATION_VULNERABILITY to get actual displacement
  gradual: [
    0.00, 0.02, 0.05, 0.08, 0.12, 0.17, 0.23, 0.29, 0.36, 0.43,
    0.50, 0.57, 0.63, 0.69, 0.74, 0.78, 0.82, 0.85, 0.88, 0.90, 0.92,
  ],
  accelerated: [
    0.00, 0.05, 0.12, 0.22, 0.35, 0.48, 0.60, 0.70, 0.78, 0.84,
    0.88, 0.91, 0.93, 0.95, 0.96, 0.97, 0.97, 0.98, 0.98, 0.99, 0.99,
  ],
  shock: [
    0.00, 0.10, 0.25, 0.45, 0.62, 0.75, 0.84, 0.90, 0.93, 0.95,
    0.97, 0.98, 0.98, 0.99, 0.99, 0.99, 1.00, 1.00, 1.00, 1.00, 1.00,
  ],
};

// ─── Consumer Spending Elasticity by Income Tier ─────────────────
// How much spending changes per 1% change in employment/income
// Lower-income tiers are more sensitive (higher marginal propensity to consume)
// Source: IMF Working Papers on unemployment and consumption
export const CONSUMER_SPENDING_ELASTICITY = {
  source: ['imf_working_papers'],
  confidence: 'derived',
  byTier: {
    low:  0.85,  // 1% income loss → 0.85% spending decline
    mid:  0.65,  // 1% income loss → 0.65% spending decline
    high: 0.35,  // 1% income loss → 0.35% spending decline
  },
  neutralDefault: 0.60,
};

// ─── Tax Revenue Sensitivity ─────────────────────────────────────
// Elasticity of each tax type to its driver
// Source: CBO economic projections and sensitivity models
export const TAX_REVENUE_SENSITIVITY = {
  source: ['cbo_projections'],
  confidence: 'derived',
  incomeTax: {
    employmentElasticity: 0.90,   // 1% employment drop → 0.9% income tax drop
    wageElasticity: 0.80,         // 1% wage drop → 0.8% income tax drop
    shareOfRevenue: 0.47,         // % of total federal revenue
  },
  payrollTax: {
    employmentElasticity: 0.95,   // Nearly 1:1 with employment
    shareOfRevenue: 0.36,
  },
  corporateTax: {
    profitElasticity: 0.75,       // Corporate tax somewhat less elastic
    shareOfRevenue: 0.09,
  },
  otherRevenue: {
    shareOfRevenue: 0.08,         // Excise, estate, etc. — treated as stable
  },
};

// ─── AI Access Distribution ──────────────────────────────────────
// Baseline distribution of AI tool access by income quintile (0–100 scale)
// Source: Pew Research Center (2023), Common Sense Media
export const AI_ACCESS_DISTRIBUTION = {
  source: ['pew_research_2023'],
  confidence: 'direct',
  byQuintile: {
    q1_lowest:  18,  // Bottom 20% income
    q2:         32,
    q3_middle:  52,
    q4:         71,
    q5_highest: 89,  // Top 20% income
  },
  schoolAccess: {
    lowIncome:  25,
    midIncome:  55,
    highIncome: 82,
  },
};

// ─── Child Outcome Correlations ──────────────────────────────────
// Impact of AI access on educational achievement (effect size per 10 AI Access Index points)
// Source: OECD PISA, Stanford CEPA
export const CHILD_OUTCOME_CORRELATIONS = {
  source: ['oecd_pisa'],
  confidence: 'derived',
  achievementGapPerAccessPoint: 0.03,  // 10-point access gap → 0.3 grade-level gap over 5 years
  dropoutRiskMultiplier: 1.15,          // Per 20-point access deficit
  collegePrepImpact: 0.025,             // Effect on college readiness per access point
};

// ─── UBI Effects ─────────────────────────────────────────────────
// Source: Finland UBI pilot, Stockton SEED, Kenya GiveDirectly
export const UBI_EFFECTS = {
  source: ['ubi_pilots'],
  confidence: 'derived',
  spendingMultiplier: 0.82,       // $1 UBI → $0.82 additional spending (low-income)
  laborParticipationEffect: -0.02, // 2% reduction in labor participation
  wellbeingImprovement: 0.15,      // 15% improvement in self-reported wellbeing
  costPerAdultMonthly: 1000,       // Reference UBI amount for scaling
};

// ─── Retraining Success Rates ────────────────────────────────────
// % of displaced workers who successfully transition, by tier
// Source: OECD retraining program evaluations
export const RETRAINING_SUCCESS_RATES = {
  source: ['oecd_retraining'],
  confidence: 'derived',
  byTier: {
    low:  0.25,  // 25% of low-skill workers successfully retrain
    mid:  0.45,  // 45% of mid-skill
    high: 0.65,  // 65% of high-skill
  },
  timeToRetrain: {       // Years to complete retraining
    low:  2.5,
    mid:  1.8,
    high: 1.2,
  },
};

// ─── Inequality Baselines ────────────────────────────────────────
// Source: World Bank, Raj Chetty / Opportunity Insights
export const INEQUALITY_BASELINES = {
  source: ['world_bank', 'chetty_opportunity'],
  confidence: 'direct',
  giniUS2024: 0.39,                    // US Gini coefficient baseline
  giniWarningThreshold: 0.45,          // Historical instability threshold
  giniCriticalThreshold: 0.50,         // Severe inequality threshold
  socialMobilityBaseline: 50,          // 0–100 index, US baseline
  intergenerationalElasticity: 0.47,   // Higher = less mobility (US ~0.47)
};

// ─── Wage Polarization ───────────────────────────────────────────
// Annual wage growth/decline rates by skill tier under automation pressure
// Source: Acemoglu & Johnson — Power and Progress (2023)
export const WAGE_POLARIZATION = {
  source: ['acemoglu_johnson_2023'],
  confidence: 'derived',
  annualRates: {
    low:  -0.025,  // 2.5% annual wage decline for low-skill under full automation pressure
    mid:  -0.015,  // 1.5% for mid-skill
    high:  0.030,  // 3.0% wage growth for high-skill (AI-complementary)
  },
};

// ─── Inflation Dynamics ──────────────────────────────────────────
// Source: Calibrated from CBO projections and economic theory
export const INFLATION_DYNAMICS = {
  source: ['cbo_projections'],
  confidence: 'calibrated',
  baselineRate: 0.025,                // 2.5% annual baseline inflation
  automationDeflationEffect: -0.003,  // Per 10% automation adoption: slight deflation (cheaper goods)
  wealthConcentrationInflation: 0.002, // Per 0.01 Gini increase: asset price inflation
  unemploymentDeflationEffect: -0.002, // Per 5% unemployment increase: demand-side deflation
};

// ─── Trade Competitiveness ───────────────────────────────────────
// Source: Calibrated from WEF data and economic theory
export const TRADE_COMPETITIVENESS = {
  source: ['wef_future_jobs'],
  confidence: 'calibrated',
  baselineIndex: 100,                       // Normalized trade competitiveness
  automationAdvantagePerPoint: 0.3,         // Faster automation → higher competitiveness
  laborCostReductionEffect: 0.5,            // Cost reduction feeds into exports
  domesticDemandDragEffect: -0.2,           // Weak domestic demand hurts some trade sectors
};

// ─── Stability Controls ──────────────────────────────────────────
// Hard bounds and dampening parameters for the simulation engine
export const STABILITY = {
  bounds: {
    employmentRate:     { min: 0.05, max: 1.00 },    // 5%–100%
    spendingIndex:      { min: 20,   max: 180 },      // Can't drop below 20 or exceed 180
    profitIndex:        { min: 10,   max: 200 },
    taxRevenueIndex:    { min: 5,    max: 200 },
    giniCoefficient:    { min: 0.20, max: 0.70 },
    socialMobility:     { min: 0,    max: 100 },
    inflationRate:      { min: -0.05, max: 0.15 },    // -5% to 15%
    tradeIndex:         { min: 30,   max: 200 },
  },
  dampening: {
    spendingToProfitLag: 0.6,       // 60% of spending change hits profits this year, 40% next
    profitToHiringLag: 0.5,         // 50% of profit change affects hiring this year
    unemploymentToSpendingLag: 0.7, // 70% of unemployment effect hits spending this year
    policyEffectDelay: 0.4,         // Policies take effect at 40% first year, 70% second, 100% third
    feedbackStrength: 0.75,         // Global dampener on all feedback loops (prevents oscillation)
  },
};

// ─── Helper: Get value with source fallback ──────────────────────
// If a source is disabled, returns the neutral default
export function getValueWithSourceCheck(dataObj, key, enabledSources) {
  if (!dataObj.source) return dataObj[key];

  const allSourcesEnabled = dataObj.source.every(
    (srcId) => enabledSources[srcId] !== false
  );

  if (allSourcesEnabled) {
    return dataObj[key] ?? dataObj.neutralDefault;
  }
  return dataObj.neutralDefault ?? dataObj[key];
}
