import React from 'react';

export default function InsightsPanel({ result, events, selectedYear }) {
  const { sectors } = result;
  const yearData = {
    labor: sectors.labor[selectedYear],
    spending: sectors.spending[selectedYear],
    profits: sectors.profits[selectedYear],
    govRevenue: sectors.govRevenue[selectedYear],
    inequality: sectors.inequality[selectedYear],
  };

  // Filter events up to and including selected year
  const relevantEvents = events.events.filter(e => e.year <= selectedYear);
  const crossovers = events.crossoverPoints.filter(e => e.year <= selectedYear);

  return (
    <div style={styles.container}>
      {/* Crossover Point Card */}
      {crossovers.length > 0 ? (
        <div style={styles.crossoverCard}>
          <div style={styles.crossoverTitle}>Demand Destruction Crossover</div>
          <div style={styles.crossoverYear}>Year {crossovers[0].year}</div>
          <p style={styles.crossoverDesc}>{crossovers[0].description}</p>
          <div style={styles.crossoverMetrics}>
            <div>
              <span style={styles.metricLabel}>Cost Savings</span>
              <span style={styles.metricValueGreen}>{crossovers[0].metrics.costSavings}</span>
            </div>
            <div>
              <span style={styles.metricLabel}>Demand Loss</span>
              <span style={styles.metricValueRed}>{crossovers[0].metrics.demandLoss}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.noCrossover}>
          <div style={styles.noCrossoverTitle}>No Crossover Detected</div>
          <p style={styles.noCrossoverDesc}>
            Automation cost savings still exceed demand destruction through Year {selectedYear}.
          </p>
        </div>
      )}

      {/* Year Snapshot */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Year {selectedYear} Snapshot</h3>
        <div style={styles.snapshotGrid}>
          <SnapshotMetric label="Employment" value={yearData.labor?.value} unit="%" />
          <SnapshotMetric label="Spending" value={yearData.spending?.value} unit="idx" />
          <SnapshotMetric label="Profits" value={yearData.profits?.value} unit="idx" />
          <SnapshotMetric label="Tax Revenue" value={yearData.govRevenue?.value} unit="idx" />
          <SnapshotMetric label="Gini" value={yearData.inequality?.gini} unit="" precision={3} />
          <SnapshotMetric label="Mobility" value={yearData.inequality?.socialMobility} unit="" />
        </div>
      </div>

      {/* Gov Revenue Breakdown */}
      {yearData.govRevenue && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Revenue Breakdown</h3>
          <div style={styles.breakdownList}>
            <BreakdownRow label="Income Tax" value={yearData.govRevenue.subMetrics.incomeTax} />
            <BreakdownRow label="Payroll Tax" value={yearData.govRevenue.subMetrics.payrollTax} />
            <BreakdownRow label="Corporate Tax" value={yearData.govRevenue.subMetrics.corporateTax} />
            <BreakdownRow label="Robot Tax" value={yearData.govRevenue.subMetrics.robotTax} />
            <BreakdownRow label="Policy Costs" value={-yearData.govRevenue.subMetrics.policyCost} negative />
          </div>
        </div>
      )}

      {/* Active Callouts */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Events & Alerts</h3>
        {relevantEvents.length === 0 ? (
          <p style={styles.noEvents}>No significant events detected through Year {selectedYear}.</p>
        ) : (
          <div style={styles.eventList}>
            {relevantEvents.slice(-8).reverse().map((evt, i) => (
              <div key={i} style={{
                ...styles.eventCard,
                borderLeftColor: evt.severity === 'critical' ? '#ef4444' :
                  evt.severity === 'warning' ? '#eab308' : '#3b82f6',
              }}>
                <div style={styles.eventHeader}>
                  <span style={styles.eventYear}>Yr {evt.year}</span>
                  <span style={styles.eventTitle}>{evt.title}</span>
                </div>
                <p style={styles.eventDesc}>{evt.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Children / Next Generation */}
      {yearData.inequality && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Next Generation Outlook</h3>
          <div style={styles.childCard}>
            <div style={styles.childRow}>
              <span style={styles.childLabel}>Achievement Gap</span>
              <span style={{
                ...styles.childValue,
                color: yearData.inequality.achievementGap > 2 ? '#ef4444' :
                  yearData.inequality.achievementGap > 1 ? '#eab308' : '#22c55e',
              }}>
                {yearData.inequality.achievementGap.toFixed(1)} grade levels
              </span>
            </div>
            <div style={styles.childRow}>
              <span style={styles.childLabel}>Intergenerational Score</span>
              <span style={{
                ...styles.childValue,
                color: yearData.inequality.intergenScore < 40 ? '#ef4444' :
                  yearData.inequality.intergenScore < 60 ? '#eab308' : '#22c55e',
              }}>
                {yearData.inequality.intergenScore.toFixed(0)}/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SnapshotMetric({ label, value, unit, precision = 1 }) {
  if (value == null) return null;
  const formatted = typeof value === 'number' ? value.toFixed(precision) : value;
  const color = value >= 90 ? '#22c55e' : value >= 70 ? '#eab308' : '#ef4444';
  return (
    <div style={snapshotStyles.metric}>
      <span style={snapshotStyles.label}>{label}</span>
      <span style={{ ...snapshotStyles.value, color }}>{formatted}{unit}</span>
    </div>
  );
}

function BreakdownRow({ label, value, negative }) {
  if (value == null) return null;
  return (
    <div style={breakdownStyles.row}>
      <span style={breakdownStyles.label}>{label}</span>
      <span style={{ ...breakdownStyles.value, color: negative ? '#ef4444' : '#d1d5db' }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

const styles = {
  container: { padding: '40px 14px 24px' },
  crossoverCard: {
    background: 'linear-gradient(135deg, #2d1215, #1a1d2e)',
    border: '1px solid #7f1d1d',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  crossoverTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, color: '#ef4444', marginBottom: 4 },
  crossoverYear: { fontSize: 28, fontWeight: 800, color: '#fca5a5', marginBottom: 8 },
  crossoverDesc: { fontSize: 12, color: '#d1d5db', lineHeight: 1.5, marginBottom: 12 },
  crossoverMetrics: { display: 'flex', justifyContent: 'space-between' },
  metricLabel: { display: 'block', fontSize: 10, color: '#6b7280', textTransform: 'uppercase' },
  metricValueGreen: { fontSize: 18, fontWeight: 700, color: '#22c55e' },
  metricValueRed: { fontSize: 18, fontWeight: 700, color: '#ef4444' },
  noCrossover: {
    background: '#1a1d2e',
    border: '1px solid #1e3a5f',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  noCrossoverTitle: { fontSize: 13, fontWeight: 600, color: '#60a5fa', marginBottom: 4 },
  noCrossoverDesc: { fontSize: 12, color: '#9ca3af', margin: 0 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#6b7280', margin: '0 0 10px' },
  snapshotGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  breakdownList: {},
  noEvents: { fontSize: 12, color: '#4b5563' },
  eventList: { display: 'flex', flexDirection: 'column', gap: 6 },
  eventCard: {
    background: '#1a1d2e',
    borderLeft: '3px solid #3b82f6',
    borderRadius: 6,
    padding: '8px 10px',
  },
  eventHeader: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 },
  eventYear: { fontSize: 11, fontWeight: 700, color: '#a5b4fc', background: '#1e2a4a', padding: '1px 6px', borderRadius: 4 },
  eventTitle: { fontSize: 12, fontWeight: 600, color: '#d1d5db' },
  eventDesc: { fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.4 },
  childCard: { background: '#1a1d2e', borderRadius: 8, padding: 12 },
  childRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' },
  childLabel: { fontSize: 12, color: '#9ca3af' },
  childValue: { fontSize: 14, fontWeight: 700 },
};

const snapshotStyles = {
  metric: {
    background: '#1a1d2e',
    borderRadius: 6,
    padding: '8px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 11, color: '#6b7280' },
  value: { fontSize: 15, fontWeight: 700 },
};

const breakdownStyles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px solid #1e2130',
    fontSize: 12,
  },
  label: { color: '#9ca3af' },
  value: { fontWeight: 600 },
};
