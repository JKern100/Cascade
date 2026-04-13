import React, { useCallback } from 'react';
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
  { key: 'labor', title: 'Employment Rate', unit: '%', baseline: 100 },
  { key: 'spending', title: 'Consumer Spending', unit: 'idx', baseline: 100 },
  { key: 'profits', title: 'Business Profits', unit: 'idx', baseline: 100 },
  { key: 'govRevenue', title: 'Government Revenue', unit: 'idx', baseline: 100 },
  { key: 'academic', title: 'Academic Institutions', unit: 'idx', baseline: 100 },
  { key: 'healthcare', title: 'Healthcare', unit: 'idx', baseline: 100 },
  { key: 'financialMarkets', title: 'Financial Markets', unit: 'idx', baseline: 100 },
  { key: 'socialWelfare', title: 'Social Welfare Gap', unit: 'idx', baseline: 0 },
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
                <span style={styles.chartTitle}>{config.title}</span>
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
            <span style={styles.chartTitle}>Inequality: Gini & Social Mobility</span>
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
  chartTitle: { fontSize: 12, fontWeight: 600, color: '#d1d5db' },
  healthDot: {
    padding: '2px 10px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
  },
};
