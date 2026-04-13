/**
 * Narrative Engine — Dynamic Composition
 *
 * Generates plain-language summaries of simulation inputs and outcomes.
 * Assembled from building blocks based on which metrics changed most,
 * what caused the changes, and how sectors interact.
 */

/**
 * Generate a full narrative report from simulation results
 * @param {object} params - Simulation parameters
 * @param {object} result - Output from runSimulation()
 * @param {object} eventData - Output from detectEvents()
 * @param {string|null} presetName - Name of active preset, if any
 * @returns {string} Plain-language narrative
 */
export function generateNarrative(params, result, eventData, presetName) {
  const { sectors } = result;
  const { events, crossoverPoints } = eventData;

  const yr0 = (sector) => sectors[sector][0];
  const yr10 = (sector) => sectors[sector][10];
  const yr20 = (sector) => sectors[sector][20];
  const delta = (sector, field = 'value') => {
    const start = sectors[sector][0][field];
    const end = sectors[sector][20][field];
    return end - start;
  };
  const pct = (v) => v.toFixed(1);
  const dir = (v) => v > 0.5 ? 'rises' : v < -0.5 ? 'falls' : 'remains roughly stable';
  const severity = (v, good, bad) => v >= good ? 'healthy' : v >= bad ? 'under pressure' : 'in crisis';

  const sections = [];

  // ── HEADER ─────────────────────────────────────────────────
  sections.push('# Simulation Narrative Report\n');
  if (presetName) {
    sections.push(`**Scenario: ${presetName}**\n`);
  }

  // ── ASSUMPTIONS ────────────────────────────────────────────
  sections.push('## What We Assumed\n');
  sections.push(describeAssumptions(params));

  // ── THE STORY ──────────────────────────────────────────────
  sections.push('\n## What Happens\n');
  sections.push(describeEarlyYears(sectors, params));
  sections.push(describeMidYears(sectors, params, events));
  sections.push(describeLateYears(sectors, params, events));

  // ── KEY OUTCOMES ───────────────────────────────────────────
  sections.push('\n## Key Outcomes at Year 20\n');
  sections.push(describeOutcomes(sectors));

  // ── CROSSOVER & EVENTS ─────────────────────────────────────
  if (crossoverPoints.length > 0 || events.length > 0) {
    sections.push('\n## Critical Events\n');
    if (crossoverPoints.length > 0) {
      sections.push(`**Demand Destruction Crossover — Year ${crossoverPoints[0].year}:** ${crossoverPoints[0].description}\n`);
    }
    const criticalEvents = events.filter(e => e.severity === 'critical');
    if (criticalEvents.length > 0) {
      sections.push('**Critical turning points:**\n');
      for (const evt of criticalEvents) {
        sections.push(`- **Year ${evt.year} — ${evt.title}:** ${evt.description}`);
      }
      sections.push('');
    }
    const warnings = events.filter(e => e.severity === 'warning');
    if (warnings.length > 0) {
      sections.push('**Warning signals:**\n');
      for (const evt of warnings.slice(0, 5)) {
        sections.push(`- **Year ${evt.year} — ${evt.title}:** ${evt.description}`);
      }
      sections.push('');
    }
  }

  // ── INEQUALITY & CHILDREN ──────────────────────────────────
  sections.push('\n## Inequality and the Next Generation\n');
  sections.push(describeInequality(sectors, params));

  // ── BOTTOM LINE ────────────────────────────────────────────
  sections.push('\n## The Bottom Line\n');
  sections.push(describeBottomLine(sectors, params, crossoverPoints));

  return sections.join('\n');
}

// ─── Building Blocks ─────────────────────────────────────────────

function describeAssumptions(p) {
  const lines = [];

  // Adoption
  const speedWord = p.adoptionCurve === 'shock' ? 'extremely rapid' :
    p.adoptionCurve === 'accelerated' ? 'fast' : 'gradual';
  lines.push(`**AI adoption** is set to ${p.adoptionRate}% with a ${speedWord} rollout curve. ${
    p.regulatoryBrakes > 0 ? `Government regulation delays adoption by ${p.regulatoryBrakes} year${p.regulatoryBrakes > 1 ? 's' : ''}.` : 'There are no regulatory delays.'
  } For every 100 jobs displaced, roughly ${p.newJobCreationRate} new AI-enabled roles are expected to emerge.\n`);

  // Displacement
  const avgVulnerability = (p.displacementLow + p.displacementMid + p.displacementHigh) / 3;
  const vulnWord = avgVulnerability > 60 ? 'high' : avgVulnerability > 35 ? 'moderate' : 'low';
  lines.push(`**Job vulnerability** is ${vulnWord} overall — low-skill workers face ${p.displacementLow}% exposure, mid-skill ${p.displacementMid}%, and high-skill ${p.displacementHigh}%. Retraining programs are ${
    p.retrainingEffectiveness >= 60 ? 'highly effective' : p.retrainingEffectiveness >= 30 ? 'moderately effective' : 'largely ineffective'
  } at ${p.retrainingEffectiveness}% success rate.\n`);

  // Access
  const accessWord = p.aiAccessIndex >= 70 ? 'broadly distributed' : p.aiAccessIndex >= 40 ? 'unevenly distributed' : 'concentrated among the wealthy';
  lines.push(`**AI access** is ${accessWord} (index: ${p.aiAccessIndex}/100). In schools, low-income students have ${p.schoolAccessLow}/100 access while high-income students have ${p.schoolAccessHigh}/100 — ${
    Math.abs(p.schoolAccessHigh - p.schoolAccessLow) > 50 ? 'a dramatic gap' : Math.abs(p.schoolAccessHigh - p.schoolAccessLow) > 25 ? 'a notable gap' : 'a relatively small gap'
  }.\n`);

  // Policy
  const policies = [];
  if (p.ubiEnabled) policies.push(`Universal Basic Income at $${p.ubiAmount}/month`);
  if (p.retrainingSubsidies > 20) policies.push(`retraining subsidies covering ${p.retrainingSubsidies}% of displaced workers`);
  if (p.robotTaxRate > 0) policies.push(`a ${p.robotTaxRate}% robot/automation tax`);
  if (policies.length > 0) {
    lines.push(`**Policy response** includes ${policies.join(', ')}. The safety net is set to "${p.safetyNet}.".\n`);
  } else {
    lines.push(`**No significant policy interventions** are in place. The safety net is set to "${p.safetyNet}." This means the economy absorbs AI disruption through market forces alone.\n`);
  }

  return lines.join('\n');
}

function describeEarlyYears(sectors, params) {
  const emp5 = sectors.labor[5].value;
  const spend5 = sectors.spending[5].value;
  const profit5 = sectors.profits[5].value;

  const lines = [];
  lines.push('### Years 0–5: Early Adoption\n');

  if (emp5 > 95) {
    lines.push(`Employment remains strong at ${emp5.toFixed(1)}% through the first five years. AI adoption is still ramping up, and the labor market absorbs early displacement through natural turnover and new role creation.`);
  } else if (emp5 > 85) {
    lines.push(`Employment begins to soften, reaching ${emp5.toFixed(1)}% by Year 5. Early displacement is noticeable, particularly among ${params.displacementLow > params.displacementMid ? 'low-skill' : 'mid-skill'} workers.`);
  } else {
    lines.push(`Employment drops sharply to ${emp5.toFixed(1)}% by Year 5. The pace of automation is outrunning the economy's ability to absorb displaced workers. This is a rapid disruption scenario.`);
  }

  if (profit5 > 105) {
    lines.push(` Businesses are benefiting — profits rise to ${profit5.toFixed(1)} as automation reduces labor costs faster than demand erodes.`);
  } else if (profit5 < 95) {
    lines.push(` Business profits are already under pressure at ${profit5.toFixed(1)}, as falling consumer spending begins to offset automation savings.`);
  }

  lines.push('\n');
  return lines.join('');
}

function describeMidYears(sectors, params, events) {
  const emp10 = sectors.labor[10].value;
  const spend10 = sectors.spending[10].value;
  const profit10 = sectors.profits[10].value;
  const gov10 = sectors.govRevenue[10].value;

  const lines = [];
  lines.push('### Years 5–10: The Critical Window\n');

  lines.push(`By Year 10, employment stands at ${emp10.toFixed(1)}% and consumer spending is at ${spend10.toFixed(1)}. `);

  if (spend10 < 80) {
    lines.push(`Consumer spending has fallen significantly. With fewer people earning steady incomes, businesses face a shrinking customer base. `);
  } else if (spend10 < 95) {
    lines.push(`Consumer spending is below baseline, reflecting reduced purchasing power across income tiers. `);
  } else {
    lines.push(`Consumer spending remains near or above baseline, suggesting the economy is absorbing displacement reasonably well. `);
  }

  if (gov10 < 75) {
    lines.push(`Government revenue has dropped to ${gov10.toFixed(1)}% of baseline — a fiscal crisis is emerging. With less tax revenue, the government's ability to fund safety nets, retraining, and public services is severely constrained.`);
  } else if (gov10 < 90) {
    lines.push(`Government revenue has declined to ${gov10.toFixed(1)}%, putting pressure on public budgets but not yet reaching crisis levels.`);
  } else {
    lines.push(`Government revenue remains at ${gov10.toFixed(1)}%, maintaining fiscal capacity for public programs.`);
  }

  const midEvents = events.filter(e => e.year >= 5 && e.year <= 10 && e.severity === 'critical');
  if (midEvents.length > 0) {
    lines.push(` This period sees ${midEvents.length} critical event${midEvents.length > 1 ? 's' : ''}, including: ${midEvents.map(e => e.title).join(', ')}.`);
  }

  lines.push('\n');
  return lines.join('');
}

function describeLateYears(sectors, params, events) {
  const emp15 = sectors.labor[15].value;
  const emp20 = sectors.labor[20].value;
  const spend20 = sectors.spending[20].value;
  const profit20 = sectors.profits[20].value;

  const lines = [];
  lines.push('### Years 10–20: Long-Term Trajectory\n');

  const empTrend = emp20 - sectors.labor[10].value;
  if (empTrend > 2) {
    lines.push(`Employment recovers in the second decade, reaching ${emp20.toFixed(1)}% by Year 20. Retraining programs, new job creation, and economic adaptation are working.`);
  } else if (empTrend > -2) {
    lines.push(`Employment stabilizes in the ${emp20.toFixed(1)}% range through the second decade. The economy reaches a new equilibrium, though at a lower employment level than before AI adoption.`);
  } else {
    lines.push(`Employment continues to decline, reaching ${emp20.toFixed(1)}% by Year 20. The economy has not found a new equilibrium — displacement continues to outpace adaptation.`);
  }

  if (profit20 > 110) {
    lines.push(` Business profits are elevated at ${profit20.toFixed(1)}, but this prosperity is not broadly shared if employment and spending are low.`);
  }

  if (spend20 < 75) {
    lines.push(` Consumer spending ends at ${spend20.toFixed(1)} — a deeply contracted demand environment. Many households have significantly reduced purchasing power.`);
  }

  lines.push('\n');
  return lines.join('');
}

function describeOutcomes(sectors) {
  const yr20 = {
    employment: sectors.labor[20].value,
    spending: sectors.spending[20].value,
    profits: sectors.profits[20].value,
    govRevenue: sectors.govRevenue[20].value,
    gini: sectors.inequality[20].gini,
    mobility: sectors.inequality[20].socialMobility,
    achievementGap: sectors.inequality[20].achievementGap,
  };

  const lines = [];
  lines.push(`| Metric | Value | Status |`);
  lines.push(`|--------|-------|--------|`);
  lines.push(`| Employment | ${yr20.employment.toFixed(1)}% | ${statusWord(yr20.employment, 90, 75)} |`);
  lines.push(`| Consumer Spending | ${yr20.spending.toFixed(1)} | ${statusWord(yr20.spending, 90, 70)} |`);
  lines.push(`| Business Profits | ${yr20.profits.toFixed(1)} | ${yr20.profits >= 100 ? 'Above baseline' : 'Below baseline'} |`);
  lines.push(`| Government Revenue | ${yr20.govRevenue.toFixed(1)} | ${statusWord(yr20.govRevenue, 85, 65)} |`);
  lines.push(`| Gini Coefficient | ${yr20.gini.toFixed(3)} | ${yr20.gini < 0.40 ? 'Moderate' : yr20.gini < 0.45 ? 'Elevated' : 'Severe'} inequality |`);
  lines.push(`| Social Mobility | ${yr20.mobility.toFixed(0)}/100 | ${yr20.mobility >= 55 ? 'Healthy' : yr20.mobility >= 45 ? 'Declining' : 'Poor'} |`);
  lines.push(`| Children\'s Achievement Gap | ${yr20.achievementGap.toFixed(1)} grade levels | ${yr20.achievementGap < 1 ? 'Manageable' : yr20.achievementGap < 2 ? 'Concerning' : 'Severe'} |`);
  lines.push('');

  return lines.join('\n');
}

function describeInequality(sectors, params) {
  const gini0 = sectors.inequality[0].gini;
  const gini20 = sectors.inequality[20].gini;
  const mob0 = sectors.inequality[0].socialMobility;
  const mob20 = sectors.inequality[20].socialMobility;
  const gap20 = sectors.inequality[20].achievementGap;
  const intergen20 = sectors.inequality[20].intergenScore;

  const lines = [];

  const giniDelta = gini20 - gini0;
  if (giniDelta > 0.03) {
    lines.push(`Inequality worsens significantly over the 20-year period. The Gini coefficient rises from ${gini0.toFixed(3)} to ${gini20.toFixed(3)}, meaning the gap between high and low earners widens substantially.`);
  } else if (giniDelta > 0) {
    lines.push(`Inequality increases modestly, with the Gini moving from ${gini0.toFixed(3)} to ${gini20.toFixed(3)}.`);
  } else {
    lines.push(`Inequality actually improves, with the Gini dropping from ${gini0.toFixed(3)} to ${gini20.toFixed(3)}. Policy interventions and broad AI access are compressing the income distribution.`);
  }

  const schoolGap = Math.abs(params.schoolAccessHigh - params.schoolAccessLow);
  if (gap20 > 2) {
    lines.push(` Children in low-income schools fall ${gap20.toFixed(1)} grade levels behind their wealthier peers by Year 20. This is a severe gap that will compound when these children enter the workforce — they will be less prepared for an AI-driven economy, perpetuating the cycle.`);
  } else if (gap20 > 1) {
    lines.push(` The educational achievement gap between low and high-income students reaches ${gap20.toFixed(1)} grade levels. This gap, driven by unequal school access to AI tools (${params.schoolAccessLow} vs. ${params.schoolAccessHigh}), will affect the next generation's economic prospects.`);
  } else {
    lines.push(` The educational achievement gap remains at ${gap20.toFixed(1)} grade levels — manageable, suggesting relatively equitable access to AI tools in schools.`);
  }

  lines.push(` The intergenerational opportunity score stands at ${intergen20.toFixed(0)}/100 — ${
    intergen20 >= 60 ? 'suggesting the next generation has reasonable prospects' :
    intergen20 >= 40 ? 'indicating the next generation faces reduced opportunities compared to today' :
    'signaling that today\'s children will enter an economy with significantly fewer pathways to prosperity'
  }.\n`);

  return lines.join('');
}

function describeBottomLine(sectors, params, crossoverPoints) {
  const emp20 = sectors.labor[20].value;
  const spend20 = sectors.spending[20].value;
  const gini20 = sectors.inequality[20].gini;
  const gov20 = sectors.govRevenue[20].value;

  // Count how many sectors are in trouble
  const troubles = [];
  if (emp20 < 80) troubles.push('employment');
  if (spend20 < 80) troubles.push('consumer spending');
  if (gov20 < 70) troubles.push('government fiscal capacity');
  if (gini20 > 0.45) troubles.push('inequality');

  if (troubles.length === 0) {
    return 'In this scenario, the economy navigates AI adoption without catastrophic disruption. Employment, spending, and government capacity remain within functional ranges. This does not mean there is no pain — individual workers and communities experience real displacement — but the system as a whole adapts. The key factors enabling this outcome are the policy choices and access levels configured in this scenario.\n';
  } else if (troubles.length <= 2) {
    return `In this scenario, ${troubles.join(' and ')} come under significant pressure. While the economy doesn't collapse, the strain is concentrated on specific populations — particularly lower-income workers and their families. The question is whether the policy responses in place are sufficient to prevent these pressures from cascading further.${
      crossoverPoints.length > 0 ? ` Notably, by Year ${crossoverPoints[0].year}, automation savings no longer offset the damage from lost consumer demand — businesses begin to feel the consequences of the very displacement they drove.` : ''
    }\n`;
  } else {
    return `This scenario produces a cascading crisis across ${troubles.join(', ')}. The core mechanism: AI adoption displaces workers, which reduces spending, which erodes business revenue, which shrinks the tax base, which leaves the government unable to fund the safety nets that could break the cycle. ${
      crossoverPoints.length > 0 ? `The tipping point arrives in Year ${crossoverPoints[0].year}, when businesses realize that the customers they eliminated through automation are the same people who used to buy their products.` : 'Without intervention, these feedback loops reinforce each other.'
    } This is the cascade the simulation is named for — and it illustrates why the consequences of AI adoption cannot be evaluated in any single dimension.\n`;
  }
}

function statusWord(value, goodThreshold, badThreshold) {
  if (value >= goodThreshold) return 'Healthy';
  if (value >= badThreshold) return 'Under pressure';
  return 'In crisis';
}
