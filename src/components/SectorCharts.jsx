import React, { useCallback, useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart, Bar,
} from 'recharts';

const COLORS = {
  good: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  tertiary: '#06b6d4',
  muted: '#6b7280',
  grid: '#1e2130',
  bg: '#141622',
  low: '#f97316',
  mid: '#3b82f6',
  high: '#22c55e',
};

// Color-blind safe palette alternative
const CB_SAFE = {
  low: '#e69f00',   // orange
  mid: '#0072b2',   // blue
  high: '#009e73',   // teal
  primary: '#0072b2',
  warning: '#e69f00',
  critical: '#d55e00',
  good: '#009e73',
};

const SECTOR_CONFIG = [
  {
    key: 'labor', title: 'Employment Rate', unit: '%', baseline: 100,
    help: 'Net employment rate across all skill tiers (low, mid, high), weighted by workforce share. Starts at 100% (full employment). Driven by AI adoption speed, displacement vulnerability, new job creation, and retraining success. The dashed line marks the baseline.',
  },
  {
    key: 'spending', title: 'Consumer Spending', unit: 'idx', baseline: 100,
    help: 'Total consumer spending index (baseline = 100), combining low, mid, and high income tiers. Falls when employment drops (lower-income tiers are most sensitive). Boosted by UBI and broad AI access. This is the demand side of the economy \u2014 when it falls, businesses lose customers.',
  },
  {
    key: 'profits', title: 'Business Profits', unit: 'idx', baseline: 100,
    help: 'Business profit margin index (baseline = 100). Pulled in two opposing directions: UP by automation cost savings, DOWN by lost consumer demand. When the line rises above 100, cost savings are winning. Watch for the crossover point where demand destruction overtakes savings.',
  },
  {
    key: 'govRevenue', title: 'Government Revenue', unit: 'idx', baseline: 100,
    help: 'Total government tax revenue index (baseline = 100). Composed of income tax (driven by employment), payroll tax (driven by worker count), corporate tax (driven by profits), and robot tax if enabled. Policy costs (UBI, retraining) are subtracted. When this falls, the government has less capacity to fund safety nets.',
  },
  {
    key: 'academic', title: 'Academic Institutions', unit: 'idx', baseline: 100,
    help: 'Composite of enrollment demand and credential relevance. Enrollment rises when displaced workers seek retraining, but falls if credentials become less relevant due to AI. A declining line means the educational system is losing relevance faster than retraining demand grows.',
  },
  {
    key: 'healthcare', title: 'Healthcare', unit: 'idx', baseline: 100,
    help: 'Healthcare system pressure index (baseline = 100). Rising values mean increasing demand from unemployment-related stress, inequality-driven illness, and reduced access. AI efficiency in healthcare partially offsets this. Values above 100 indicate the system is under growing strain.',
  },
  {
    key: 'financialMarkets', title: 'Financial Markets', unit: 'idx', baseline: 100,
    help: 'Market stability index (baseline = 100), derived from business profits (40%), consumer spending (20%), inequality levels (20%), and trade competitiveness (20%). Below 100 signals growing instability risk. This is a composite indicator, not independently modeled.',
  },
  {
    key: 'socialWelfare', title: 'Social Welfare Gap', unit: 'idx', baseline: 0,
    help: 'The gap between social welfare needs and available funding. 0 = needs are fully met. Higher values = growing unmet need. Needs rise with unemployment; funding depends on tax revenue and safety net strength. A widening gap means more people falling through the cracks.',
  },
];

export default function SectorCharts({ result, events, selectedYear, onYearChange }) {
  const { sectors } = result;

  const handleChartClick = useCallback((data) => {
    if (data?.activeLabel !== undefined) {
      onYearChange(data.activeLabel);
    }
  }, [onYearChange]);

  return (
    <div style={styles.container}>
      {/* Year scrubber */}
      <div style={styles.scrubber}>
        <label style={styles.scrubberLabel}>Year</label>
        <input
          type="range"
          min={0}
          max={20}
          value={selectedYear}
          onChange={e => onYearChange(Number(e.target.value))}
          style={styles.scrubberSlider}
        />
        <span style={styles.scrubberValue}>{selectedYear}</span>
      </div>

      {/* Chart grid */}
      <div style={styles.grid}>
        {SECTOR_CONFIG.map(config => {
          const data = sectors[config.key];
          if (!data) return null;

          const currentHealth = data[selectedYear]?.healthStatus ?? 'good';
          const healthColor = COLORS[currentHealth];

          // Find events for this sector
          const sectorEvents = events.crossoverPoints
            .concat(events.events.filter(e => e.sector === config.key));

          return (
            <div key={config.key} style={{ ...styles.chartCard, borderLeftColor: healthColor }}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitleRow}>
                  <span style={styles.chartTitle}>{config.title}</span>
                  <ChartHelp text={config.help} />
                </span>
                <span style={{
                  ...styles.healthDot,
                  background: healthColor,
                }}>{data[selectedYear]?.value?.toFixed(1) ?? '—'}</span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: COLORS.muted }} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 6, fontSize: 12 }}
                    labelFormatter={v => `Year ${v}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: COLORS.primary }}
                  />
                  {config.baseline !== undefined && (
                    <ReferenceLine y={config.baseline} stroke={COLORS.muted} strokeDasharray="3 3" />
                  )}
                  <ReferenceLine x={selectedYear} stroke="#a5b4fc" strokeDasharray="2 2" />
                  {/* Event markers */}
                  {sectorEvents.map((evt, i) => (
                    <ReferenceLine
                      key={i}
                      x={evt.year}
                      stroke={evt.severity === 'critical' ? COLORS.critical : COLORS.warning}
                      strokeDasharray="4 2"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}

        {/* Inequality dual-axis chart */}
        <div style={{ ...styles.chartCard, borderLeftColor: COLORS.secondary, gridColumn: 'span 2' }}>
          <div style={styles.chartHeader}>
            <span style={styles.chartTitleRow}>
              <span style={styles.chartTitle}>Inequality: Gini & Social Mobility</span>
              <ChartHelp text={'Dual-axis chart. Red line (left axis): Gini coefficient \u2014 measures income inequality (0 = perfect equality, 1 = total inequality). The US baseline is ~0.39. Above 0.45 = historical instability warning. Above 0.50 = severe. Green line (right axis): Social mobility score (0\u2013100) \u2014 how easily people can improve their economic position. Driven by wage polarization, retraining access, and AI equity. When Gini rises and mobility falls, inequality is compounding across generations.'} />
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={sectors.inequality}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: COLORS.muted }} />
              <YAxis yAxisId="gini" tick={{ fontSize: 10, fill: COLORS.muted }} domain={[0.3, 0.6]} />
              <YAxis yAxisId="mobility" orientation="right" tick={{ fontSize: 10, fill: COLORS.muted }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 6, fontSize: 12 }}
                labelFormatter={v => `Year ${v}`}
              />
              <Line yAxisId="gini" type="monotone" dataKey="gini" stroke={COLORS.critical} strokeWidth={2} dot={false} name="Gini" />
              <Line yAxisId="mobility" type="monotone" dataKey="socialMobility" stroke={COLORS.good} strokeWidth={2} dot={false} name="Mobility" />
              <ReferenceLine x={selectedYear} stroke="#a5b4fc" strokeDasharray="2 2" yAxisId="gini" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Chart Help Tooltip ──────────────────────────────────────────

function ChartHelp({ text }) {
  const [visible, setVisible] = useState(false);
  const iconRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const show = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        left: Math.max(8, Math.min(rect.left - 120, window.innerWidth - 320)),
      });
    }
    setVisible(true);
  };

  return (
    <>
      <span
        ref={iconRef}
        style={helpStyles.icon}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        onFocus={show}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        role="button"
        aria-label="Chart help"
      >
        ?
      </span>
      {visible && (
        <div style={{
          ...helpStyles.popup,
          position: 'fixed',
          top: pos.top,
          left: pos.left,
        }}>
          {text}
        </div>
      )}
    </>
  );
}

const helpStyles = {
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#2a2d3e',
    color: '#6b7280',
    fontSize: 10,
    fontWeight: 700,
    cursor: 'help',
    marginLeft: 6,
    flexShrink: 0,
    border: '1px solid #374151',
  },
  popup: {
    zIndex: 9999,
    width: 300,
    padding: '12px 14px',
    background: '#1e2130',
    border: '1px solid #3b82f6',
    borderRadius: 8,
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 1.6,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
  },
};

const styles = {
  container: {},
  scrubber: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    padding: '8px 16px',
    background: '#141622',
    borderRadius: 8,
    border: '1px solid #1e2130',
  },
  scrubberLabel: { fontSize: 12, color: '#6b7280', fontWeight: 600 },
  scrubberSlider: { flex: 1, accentColor: '#a5b4fc' },
  scrubberValue: { fontSize: 18, fontWeight: 700, color: '#a5b4fc', minWidth: 30, textAlign: 'right' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  chartCard: {
    background: '#141622',
    border: '1px solid #1e2130',
    borderLeft: '3px solid #3b82f6',
    borderRadius: 8,
    padding: 12,
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitleRow: { display: 'inline-flex', alignItems: 'center' },
  chartTitle: { fontSize: 12, fontWeight: 600, color: '#d1d5db' },
  healthDot: {
    padding: '2px 10px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
  },
};
