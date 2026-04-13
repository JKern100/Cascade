# AI Economy Simulation — Development Specification v1.1

**Version:** 1.1
**Date:** 2026-04-13
**Status:** Ready for development

---

## Changelog from v1.0

| # | Change | Rationale |
|---|--------|-----------|
| 1 | **Reframed purpose** — simulation models the full cascade of societal consequences, not just the business P&L crossover | The crossover point is one signal within the larger picture of what happens to jobs, government capacity, inequality, children's futures, and intergenerational mobility |
| 2 | **Numerical stability** — engine uses both dampening coefficients AND hard bounds | Prevents feedback loops from oscillating or diverging unrealistically |
| 3 | **Second-order sectors** — mixed approach | Healthcare and Academic get real mechanics; Financial Markets and Social Welfare are derived indicators |
| 4 | **Interactive knowledge base** — users can enable/disable research sources | Master source panel + inline citations on parameters; disabling falls back to neutral defaults |
| 5 | **Geography** — V1 global parameter, V2 sub-populations | Engine designed for extensibility without rewrite |
| 6 | **Added inflation + trade** — two new feedback loops | Simplified inflation dynamics and trade competitiveness index |
| 7 | **Narrative system** — dynamic composition from building blocks | Not templates, not LLM-generated; assembled from metric deltas and causal relationships |
| 8 | **Causal chain view** — React Flow library | Recharts cannot render node-and-edge diagrams |
| 9 | **MVP build phases** — three phases | Phase 1: engine + core UI. Phase 2: extended sectors + flow diagram. Phase 3: play mode + narratives |
| 10 | **Offline-first** — optional online integrations | Works fully offline; users can optionally import data or fetch updates |
| 11 | **Basic accessibility for MVP** — color-blind palette + keyboard nav | Enhanced a11y deferred to later phase |

---

## Project Overview

### What this simulation models

The full cascade of consequences when AI-driven automation flows through the entire economic and social system. This includes:

- **Labor displacement** across skill tiers, sectors, and geographies
- **Consumer spending** erosion from unemployment and wage polarization
- **Business profit dynamics** — the tension between cost savings and demand destruction
- **Government fiscal capacity** — shrinking tax bases vs. growing safety net needs
- **Inequality** — Gini growth, social mobility decline, wealth concentration
- **Children and intergenerational effects** — how AI access gaps in schools compound over generations
- **Institutional stability** — healthcare strain, educational relevance, financial market risk
- **Inflation and trade** — deflationary automation vs. inflationary wealth concentration; competitive dynamics

### Primary questions

1. What happens to society as AI adoption accelerates across these interconnected dimensions?
2. At what rate does job displacement erode consumer spending enough to threaten business profits?
3. How do government tax revenues shift, and what policy responses stabilize outcomes?
4. How does unequal AI access compound inequality — especially for children?
5. Which policy combinations meaningfully change outcomes, and which are insufficient?

---

## Build Phases

### Phase 1 — MVP (Current)
- Simulation engine with 10-stage causal chain + stability controls
- Core 4 sectors: Labor, Consumer Spending, Business Profits, Government Revenue
- Event detector (crossovers, tipping points, recovery signals)
- 6 preset scenarios
- UI: Dashboard shell, ControlPanel, SectorCharts (Recharts), InsightsPanel
- Year scrubber + snapshot metrics
- Basic accessibility (color-blind palette, keyboard nav)

### Phase 2 — Extended Model
- Extended sectors: Academic (full mechanics), Healthcare (full mechanics), Financial Markets (derived), Social Welfare (derived)
- Inequality & Children module (dedicated visualizations)
- Causal Chain View (React Flow node-and-edge diagram)
- Interactive knowledge base / Source Manager UI
- Inflation and trade visualizations

### Phase 3 — Storytelling
- Play Mode (animated year-by-year progression)
- Dynamic narrative composition engine
- Scenario Manager (save, compare, export)
- Side-by-side scenario comparison
- Optional online integrations (data import, parameter updates)

---

## Architecture

### File Structure

```
/src
  /data
    knowledgeBase.js         — research-grounded constants with source citations
  /engine
    simulationEngine.js      — pure function: params → 20-year dataset
    eventDetector.js         — crossovers, tipping points, narrative events
    stabilityControls.js     — dampening + bounds
    narrativeEngine.js       — (Phase 3) dynamic composition
  /components
    Dashboard.jsx            — main layout shell
    ControlPanel.jsx         — parameters, presets, policy levers
    CausalChainView.jsx      — (Phase 2) React Flow diagram
    SectorCharts.jsx         — Recharts time-series grid
    InsightsPanel.jsx        — callouts, crossover card, snapshots
    InequalityModule.jsx     — (Phase 2) Gini, mobility, children
    PlayMode.jsx             — (Phase 3) animation + narrative overlay
    Tooltip.jsx              — reusable tooltip with citations
    SourceManager.jsx        — (Phase 2) knowledge base control
  /presets
    presets.js               — 6 named scenario configurations
  App.jsx
```

### Technical Stack
- **Framework:** React with hooks
- **Charts:** Recharts
- **Flow diagrams:** React Flow (Phase 2)
- **Build tool:** Vite
- **State:** React useState/useReducer — all in memory
- **Network:** Offline-first, no hard dependencies on external APIs
- **Performance:** 300ms debounce on parameter changes

---

## Knowledge Base (`/src/data/knowledgeBase.js`)

### Source Registry

Every research source is registered with metadata and an `enabled` flag. Users can toggle sources on/off via:
1. **Master Source Panel** — bulk enable/disable in a dedicated UI section
2. **Inline citations** — each parameter shows its source; clicking allows override

When a source is disabled, affected parameters fall back to neutral defaults.

### Confidence Levels

Each constant is tagged:
- `"direct"` — value directly from cited research
- `"derived"` — estimated/interpolated from research
- `"calibrated"` — tuned for realistic simulation behavior

### Constants

| Constant | Source | Confidence |
|----------|--------|------------|
| `AUTOMATION_VULNERABILITY` by sector × skill tier | Frey & Osborne (2013), Oxford Economics (2023) | derived |
| `JOB_DISPLACEMENT_CURVES` (gradual/accelerated/shock) | McKinsey Global Institute (2017–2023) | derived |
| `CONSUMER_SPENDING_ELASTICITY` by income tier | IMF Working Papers | derived |
| `TAX_REVENUE_SENSITIVITY` (income/payroll/corporate) | CBO Economic Projections | derived |
| `AI_ACCESS_DISTRIBUTION` by quintile + schools | Pew Research (2023), Common Sense Media | direct |
| `CHILD_OUTCOME_CORRELATIONS` | OECD PISA, Stanford CEPA | derived |
| `UBI_EFFECTS` (spending multiplier, labor participation) | Finland UBI, Stockton SEED, GiveDirectly | derived |
| `RETRAINING_SUCCESS_RATES` by tier | OECD Retraining Evaluations | derived |
| `INEQUALITY_BASELINES` (Gini, mobility) | World Bank, Chetty/Opportunity Insights | direct |
| `WAGE_POLARIZATION` by tier | Acemoglu & Johnson (2023) | derived |
| `INFLATION_DYNAMICS` | CBO Projections + economic theory | calibrated |
| `TRADE_COMPETITIVENESS` | WEF Future of Jobs + economic theory | calibrated |

---

## Simulation Engine (`/src/engine/simulationEngine.js`)

### Signature

```js
runSimulation(params) → {
  years: [0..20],
  sectors: { labor, spending, profits, govRevenue, academic, healthcare, financialMarkets, socialWelfare, inequality, inflation, trade },
  params: { ...resolvedParams }
}
```

### 10-Stage Causal Chain

```
YEAR 0–20 (sequential, with feedback):

[1] AI ADOPTION
    → Adoption rate × displacement curve shape (gradual/accelerated/shock)
    → Regulatory brakes shift curve right by N years
    → Output: % tasks automated per year

[2] WORKFORCE DISPLACEMENT
    → Displacement by skill tier (low/mid/high) × vulnerability
    → New job creation partially offsets
    → Retraining effectiveness reduces net displacement
    → Feedback: profit→hiring effect from previous year
    → Output: net employment rate by tier

[3] DUAL BUSINESS EFFECT
    → Cost savings stream: labor savings from automation
    → Revenue erosion stream: demand loss from unemployment
    → Dampened spending→profit feedback
    → Output: profit index, crossover detection

[4] CONSUMER SPENDING
    → Driven by: employment × tier, AI access boost, UBI floor
    → Dampened unemployment→spending feedback
    → Output: spending index by income tier

[5] GOVERNMENT REVENUE
    → Income tax (employment-elastic), payroll tax, corporate tax (profit-elastic)
    → Robot tax revenue if enabled
    → Policy costs (UBI, retraining) subtracted
    → Output: net tax revenue index with breakdown

[6] POLICY RESPONSE
    → UBI: ramps up over years, adds spending floor
    → Retraining: improves transition success rates
    → Robot tax: captures savings for redistribution
    → Regulatory brakes: delays adoption curve
    → Safety net modifier: current/strengthened/minimal

[7] INFLATION
    → Baseline 2.5% + automation deflation + wealth concentration inflation + unemployment deflation
    → Output: inflation rate

[8] TRADE COMPETITIVENESS
    → Automation advantage + labor cost reduction - domestic demand drag
    → Output: trade competitiveness index

[9] SECOND-ORDER SECTORS
    → Academic (full mechanics): enrollment from retraining demand, credential relevance from automation
    → Healthcare (full mechanics): stress demand from unemployment/inequality vs. AI efficiency
    → Financial Markets (derived): weighted composite of profit, spending, inequality, trade
    → Social Welfare (derived): need from unemployment vs. funding from tax revenue

[10] INEQUALITY & ACCESS
    → Gini: wage polarization + unemployment inequality - policy equalizing - access effect
    → Social mobility: driven by polarization, retraining, access
    → Children's achievement gap: school access disparity × time
    → Intergenerational score: composite of mobility, Gini, achievement gap
```

### Feedback Loops

All active simultaneously, managed by stability controls:

- Lower spending → lower profits → lower hiring → higher unemployment → lower spending
- Higher unemployment → lower tax revenue → less policy capacity → higher inequality
- Low AI access for children → skill gaps widen → next-generation displacement accelerates
- Robot tax revenue → funds UBI → partially restores spending

### Stability Controls (`/src/engine/stabilityControls.js`)

**Dampening coefficients** — effects propagate partially each year:

| Effect | Dampening Factor | Meaning |
|--------|-----------------|---------|
| Spending → Profit | 0.60 | 60% hits this year, 40% carries over |
| Profit → Hiring | 0.50 | 50% this year |
| Unemployment → Spending | 0.70 | 70% this year |
| Policy effect delay | 0.40 | 40% Year 1, 70% Year 2, 100% Year 3 |
| Global feedback strength | 0.75 | All feedback effects scaled by 75% |

**Hard bounds** — every metric has a floor and ceiling:

| Metric | Min | Max |
|--------|-----|-----|
| Employment Rate | 5% | 100% |
| Spending Index | 20 | 180 |
| Profit Index | 10 | 200 |
| Tax Revenue Index | 5 | 200 |
| Gini Coefficient | 0.20 | 0.70 |
| Social Mobility | 0 | 100 |
| Inflation Rate | -5% | 15% |
| Trade Index | 30 | 200 |

**Boundary behavior:** When a metric hits its bound, it is clamped. Feedback loops using that metric continue operating on the clamped value, preventing cascading divergence.

---

## Sector Data Model

Each sector outputs annual time series (Year 0–20):

```js
{
  year: Number,
  value: Number,                    // primary metric
  subMetrics: { ... },              // sector-specific breakdowns
  healthStatus: 'good' | 'warning' | 'critical',
}
```

| Sector | Primary Metric | Health Thresholds |
|--------|---------------|-------------------|
| Labor | Net employment rate (%) | good ≥ 90, warn ≥ 75 |
| Consumer Spending | Spending index (base=100) | good ≥ 90, warn ≥ 70 |
| Business Profits | Profit index (base=100) | good ≥ 95, warn ≥ 75 |
| Government Revenue | Tax revenue index (base=100) | good ≥ 85, warn ≥ 65 |
| Academic | Enrollment + relevance composite | good ≥ 90, warn ≥ 70 |
| Healthcare | Demand pressure + access composite | good ≥ 85, warn ≥ 65 |
| Financial Markets | Market stability index (derived) | good ≥ 85, warn ≥ 65 |
| Social Welfare | Welfare gap (need - funding) | good < 10, warn < 25 |

---

## Event Detection (`/src/engine/eventDetector.js`)

Post-simulation analysis that flags:

| Event Type | Trigger |
|-----------|---------|
| **Demand destruction crossover** | Year when demand loss exceeds automation cost savings |
| **Employment crisis** | Labor enters critical status |
| **Spending collapse** | Spending drops below 70 |
| **Fiscal crisis** | Government revenue drops below 65 |
| **Inequality warning** | Gini crosses 0.45 |
| **Severe inequality** | Gini crosses 0.50 |
| **Achievement gap** | Children's gap exceeds 1.5 grade levels |
| **Recovery signal** | Metric begins recovering after decline |
| **Health transition** | Sector moves from good → warning |

---

## Parameters & Controls

### Global AI Parameters
- **AI Adoption Rate** — slider 0–100%
- **Adoption Curve Shape** — toggle: Gradual / Accelerated / Shock
- **New Job Creation Rate** — slider 0–50%
- **Regulatory Delay** — slider 0–5 years

### Displacement Parameters
- **Low-Skill Vulnerability** — slider 0–100%
- **Mid-Skill Vulnerability** — slider 0–100%
- **High-Skill Vulnerability** — slider 0–100%
- **Displacement Timeline** — slider 1–10 years
- **Retraining Effectiveness** — slider 0–80%

### Inequality & Access Parameters
- **AI Access Index** — slider 0–100
- **School Access: Low/Mid/High Income** — three sliders 0–100
- **Geographic Gap** — slider 0–100

### Policy Levers
- **UBI** — toggle + amount slider $0–$2,000/month
- **Retraining Subsidies** — slider 0–100%
- **Robot/Automation Tax** — slider 0–40%
- **Safety Net** — toggle: Minimal / Current / Strengthened

---

## Preset Scenarios

### 1. Soft Landing
Managed transition with proactive policy and equitable access.
- Gradual curve, 45% adoption, 70% retraining, UBI $800/mo, robot tax 20%, AI access 75

### 2. Displacement Shock
Rapid automation with no safety net — the cascade scenario.
- Accelerated curve, 80% adoption, 15% retraining, no policy, AI access 25, minimal safety net

### 3. Policy Intervention
Can active policy meaningfully change outcomes?
- Gradual curve, 55% adoption, all policies at moderate intensity, AI access 60

### 4. Laissez-Faire
Free market automation — who wins, who loses.
- Accelerated curve, 75% adoption, no regulation, no policy, AI access 20

### 5. Children First
How AI access gaps in schools compound inequality over generations.
- Gradual curve, 50% adoption, school access heavily skewed (low:10, high:90), no UBI

### 6. Current Trajectory
Where we're headed without intervention.
- Parameters from 2024 real-world data and McKinsey projections

---

## UI/UX Specification

### Design Direction
- Dark background (#0f1119) with high-contrast data
- Health status via color (green/amber/red) with color-blind safe palette
- Smooth transitions on parameter changes (300ms debounce)
- Three-panel layout

### Layout

**Panel 1: Controls (left, collapsible, 320px)**
- Preset selector (6 scenario cards)
- Grouped parameter sections (accordion)
- Policy levers clearly separated
- Reset to Preset button
- All sliders show numeric value

**Panel 2: Main Stage (center, flex)**
- Phase 1: Sector Charts view — 2×4 grid + inequality dual-axis chart
- Phase 2: Causal Chain View (React Flow) as alternate view
- Year scrubber across all charts
- Phase 3: Play Mode button

**Panel 3: Insights (right, collapsible, 340px)**
- Crossover Point card (prominent)
- Year snapshot (6 key metrics)
- Government Revenue breakdown
- Events & Alerts (chronological, color-coded)
- Next Generation Outlook (achievement gap, intergenerational score)

---

## Validation Checklist

All passing as of v1.1:

- [x] Soft Landing: stable/recovering metrics by Year 15, Gini below 0.50
- [x] Displacement Shock: spending collapse by Year 10, government revenue crisis, high inequality
- [x] Laissez-Faire: maximum Gini growth and social mobility decline
- [x] Children First: educational gap widens even when adult metrics are moderate
- [x] Policy Intervention: robot tax bends revenue curve, UBI restores low-income spending
- [x] Current Trajectory: all metrics within realistic bounds, no negative employment
- [x] Crossover point detected in Displacement Shock scenario
- [x] All sector metrics stay within defined bounds

---

## Research Sources

| Source | Used For |
|--------|----------|
| Frey & Osborne (2013) | Automation vulnerability by job category |
| McKinsey Global Institute (2017–2023) | Adoption rates and displacement timelines |
| Oxford Economics (2023) | Sector-level displacement projections |
| IMF Working Papers | Unemployment → consumer spending elasticity |
| CBO Economic Projections | Government revenue sensitivity |
| Acemoglu & Johnson (2023) | Wage polarization, inequality dynamics |
| Raj Chetty / Opportunity Insights | Intergenerational mobility baselines |
| OECD PISA + Stanford CEPA | Technology access → educational outcomes |
| Pew Research Center (2023) | AI access distribution by income |
| Finland UBI / Stockton SEED / GiveDirectly | UBI effects on spending and participation |
| OECD Retraining Evaluations | Retraining success rates |
| World Bank | Gini coefficient baselines |
| BLS | Sector employment baselines |
| WEF Future of Jobs Report | Skill polarization projections |

---

*Specification v1.1 — Ready for Phase 1 development*
