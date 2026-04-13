import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { runSimulation, DEFAULT_PARAMS } from '../engine/simulationEngine.js';
import { detectEvents } from '../engine/eventDetector.js';
import { PRESET_LIST } from '../presets/presets.js';
import ControlPanel from './ControlPanel.jsx';
import SectorCharts from './SectorCharts.jsx';
import InsightsPanel from './InsightsPanel.jsx';

const DEBOUNCE_MS = 300;

export default function Dashboard() {
  const [params, setParams] = useState({ ...DEFAULT_PARAMS });
  const [simResult, setSimResult] = useState(null);
  const [events, setEvents] = useState({ events: [], crossoverPoints: [] });
  const [selectedYear, setSelectedYear] = useState(10);
  const [activePreset, setActivePreset] = useState(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Debounced simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = runSimulation(params);
      setSimResult(result);
      setEvents(detectEvents(result));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [params]);

  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setActivePreset(null);
  }, []);

  const handlePresetSelect = useCallback((preset) => {
    setParams(prev => ({ ...prev, ...preset.params }));
    setActivePreset(preset.id);
  }, []);

  const handleResetPreset = useCallback(() => {
    if (activePreset) {
      const preset = PRESET_LIST.find(p => p.id === activePreset);
      if (preset) setParams(prev => ({ ...prev, ...preset.params }));
    }
  }, [activePreset]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Cascade</h1>
          <span style={styles.subtitle}>AI Economy Simulation</span>
        </div>
        <div style={styles.headerRight}>
          {activePreset && (
            <span style={styles.presetBadge}>
              {PRESET_LIST.find(p => p.id === activePreset)?.name}
            </span>
          )}
          <span style={styles.yearDisplay}>Year {selectedYear}</span>
        </div>
      </header>

      {/* Three-panel layout */}
      <div style={styles.panels}>
        {/* Left: Controls */}
        <div style={{
          ...styles.leftPanel,
          width: leftCollapsed ? 48 : 320,
          minWidth: leftCollapsed ? 48 : 320,
        }}>
          <button
            style={styles.collapseBtn}
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            aria-label={leftCollapsed ? 'Expand controls' : 'Collapse controls'}
          >
            {leftCollapsed ? '\u25B6' : '\u25C0'}
          </button>
          {!leftCollapsed && (
            <ControlPanel
              params={params}
              onChange={handleParamChange}
              onPresetSelect={handlePresetSelect}
              onResetPreset={handleResetPreset}
              activePreset={activePreset}
            />
          )}
        </div>

        {/* Center: Charts */}
        <div style={styles.centerPanel}>
          {simResult ? (
            <SectorCharts
              result={simResult}
              events={events}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          ) : (
            <div style={styles.loading}>Running simulation...</div>
          )}
        </div>

        {/* Right: Insights */}
        <div style={{
          ...styles.rightPanel,
          width: rightCollapsed ? 48 : 340,
          minWidth: rightCollapsed ? 48 : 340,
        }}>
          <button
            style={styles.collapseBtn}
            onClick={() => setRightCollapsed(!rightCollapsed)}
            aria-label={rightCollapsed ? 'Expand insights' : 'Collapse insights'}
          >
            {rightCollapsed ? '\u25C0' : '\u25B6'}
          </button>
          {!rightCollapsed && simResult && (
            <InsightsPanel
              result={simResult}
              events={events}
              selectedYear={selectedYear}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f1119',
    color: '#e0e0e0',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid #1e2130',
    background: '#141622',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'baseline', gap: 12 },
  title: { fontSize: 22, fontWeight: 700, color: '#ffffff', margin: 0 },
  subtitle: { fontSize: 13, color: '#6b7280' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  presetBadge: {
    background: '#1e3a5f',
    color: '#60a5fa',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  yearDisplay: {
    background: '#1a1d2e',
    padding: '6px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#a5b4fc',
  },
  panels: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftPanel: {
    borderRight: '1px solid #1e2130',
    background: '#141622',
    overflow: 'auto',
    transition: 'width 0.2s, min-width 0.2s',
    position: 'relative',
  },
  centerPanel: {
    flex: 1,
    overflow: 'auto',
    padding: 16,
  },
  rightPanel: {
    borderLeft: '1px solid #1e2130',
    background: '#141622',
    overflow: 'auto',
    transition: 'width 0.2s, min-width 0.2s',
    position: 'relative',
  },
  collapseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    background: '#1a1d2e',
    border: '1px solid #2a2d3e',
    color: '#6b7280',
    width: 28,
    height: 28,
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#6b7280',
    fontSize: 16,
  },
};
