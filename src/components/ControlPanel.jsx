import React, { useState } from 'react';
import { PRESET_LIST } from '../presets/presets.js';

export default function ControlPanel({ params, onChange, onPresetSelect, onResetPreset, activePreset }) {
  const [expandedSection, setExpandedSection] = useState('adoption');

  const toggle = (section) => setExpandedSection(prev => prev === section ? null : section);

  return (
    <div style={styles.container}>
      {/* Presets */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Scenarios</h3>
        <div style={styles.presetGrid}>
          {PRESET_LIST.map(preset => (
            <button
              key={preset.id}
              style={{
                ...styles.presetCard,
                ...(activePreset === preset.id ? styles.presetCardActive : {}),
              }}
              onClick={() => onPresetSelect(preset)}
            >
              <div style={styles.presetName}>{preset.name}</div>
              <div style={styles.presetMsg}>{preset.message}</div>
            </button>
          ))}
        </div>
        {activePreset && (
          <button style={styles.resetBtn} onClick={onResetPreset}>
            Reset to Preset
          </button>
        )}
      </div>

      {/* AI Adoption */}
      <SectionHeader title="AI Adoption" section="adoption" expanded={expandedSection} onToggle={toggle} />
      {expandedSection === 'adoption' && (
        <div style={styles.controls}>
          <Slider label="Adoption Rate" value={params.adoptionRate} min={0} max={100} unit="%"
            onChange={v => onChange('adoptionRate', v)} tooltip="Global AI adoption rate across all sectors" />
          <ToggleGroup label="Adoption Curve" value={params.adoptionCurve}
            options={['gradual', 'accelerated', 'shock']}
            onChange={v => onChange('adoptionCurve', v)} />
          <Slider label="New Job Creation" value={params.newJobCreationRate} min={0} max={50} unit="%"
            onChange={v => onChange('newJobCreationRate', v)} tooltip="% of displaced jobs replaced by new AI-enabled roles" />
          <Slider label="Regulatory Delay" value={params.regulatoryBrakes} min={0} max={5} unit=" yrs"
            onChange={v => onChange('regulatoryBrakes', v)} tooltip="Years of delay on adoption curve from regulation" />
        </div>
      )}

      {/* Displacement */}
      <SectionHeader title="Displacement" section="displacement" expanded={expandedSection} onToggle={toggle} />
      {expandedSection === 'displacement' && (
        <div style={styles.controls}>
          <Slider label="Low-Skill Vulnerability" value={params.displacementLow} min={0} max={100} unit="%"
            onChange={v => onChange('displacementLow', v)} />
          <Slider label="Mid-Skill Vulnerability" value={params.displacementMid} min={0} max={100} unit="%"
            onChange={v => onChange('displacementMid', v)} />
          <Slider label="High-Skill Vulnerability" value={params.displacementHigh} min={0} max={100} unit="%"
            onChange={v => onChange('displacementHigh', v)} />
          <Slider label="Displacement Timeline" value={params.displacementTimeline} min={1} max={10} unit=" yrs"
            onChange={v => onChange('displacementTimeline', v)} tooltip="Years until peak displacement" />
          <Slider label="Retraining Effectiveness" value={params.retrainingEffectiveness} min={0} max={80} unit="%"
            onChange={v => onChange('retrainingEffectiveness', v)} />
        </div>
      )}

      {/* Inequality & Access */}
      <SectionHeader title="Inequality & Access" section="inequality" expanded={expandedSection} onToggle={toggle} />
      {expandedSection === 'inequality' && (
        <div style={styles.controls}>
          <Slider label="AI Access Index" value={params.aiAccessIndex} min={0} max={100}
            onChange={v => onChange('aiAccessIndex', v)}
            tooltip="0 = concentrated among wealthy, 100 = universal access" />
          <Slider label="School Access: Low Income" value={params.schoolAccessLow} min={0} max={100}
            onChange={v => onChange('schoolAccessLow', v)} />
          <Slider label="School Access: Mid Income" value={params.schoolAccessMid} min={0} max={100}
            onChange={v => onChange('schoolAccessMid', v)} />
          <Slider label="School Access: High Income" value={params.schoolAccessHigh} min={0} max={100}
            onChange={v => onChange('schoolAccessHigh', v)} />
          <Slider label="Geographic Gap" value={params.geographicGap} min={0} max={100}
            onChange={v => onChange('geographicGap', v)}
            tooltip="0 = no urban/rural gap, 100 = extreme gap" />
        </div>
      )}

      {/* Policy Levers */}
      <SectionHeader title="Policy Levers" section="policy" expanded={expandedSection} onToggle={toggle} />
      {expandedSection === 'policy' && (
        <div style={styles.controls}>
          <div style={styles.toggleRow}>
            <label style={styles.toggleLabel}>Universal Basic Income</label>
            <button
              style={{ ...styles.toggleBtn, background: params.ubiEnabled ? '#2563eb' : '#374151' }}
              onClick={() => onChange('ubiEnabled', !params.ubiEnabled)}
            >
              {params.ubiEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          {params.ubiEnabled && (
            <Slider label="UBI Amount" value={params.ubiAmount} min={0} max={2000} unit="$/mo"
              onChange={v => onChange('ubiAmount', v)} />
          )}
          <Slider label="Retraining Subsidies" value={params.retrainingSubsidies} min={0} max={100} unit="%"
            onChange={v => onChange('retrainingSubsidies', v)}
            tooltip="% of displaced workers covered by government retraining" />
          <Slider label="Robot/Automation Tax" value={params.robotTaxRate} min={0} max={40} unit="%"
            onChange={v => onChange('robotTaxRate', v)}
            tooltip="% of labor cost savings captured as tax revenue" />
          <ToggleGroup label="Safety Net" value={params.safetyNet}
            options={['minimal', 'current', 'strengthened']}
            onChange={v => onChange('safetyNet', v)} />
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function SectionHeader({ title, section, expanded, onToggle }) {
  return (
    <button style={styles.sectionHeader} onClick={() => onToggle(section)}>
      <span>{title}</span>
      <span style={{ transform: expanded === section ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
        {'\u25B6'}
      </span>
    </button>
  );
}

function Slider({ label, value, min, max, unit = '', onChange, tooltip }) {
  return (
    <div style={styles.sliderGroup} title={tooltip}>
      <div style={styles.sliderLabel}>
        <span>{label}</span>
        <span style={styles.sliderValue}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={styles.slider}
      />
    </div>
  );
}

function ToggleGroup({ label, value, options, onChange }) {
  return (
    <div style={styles.sliderGroup}>
      <div style={styles.sliderLabel}><span>{label}</span></div>
      <div style={styles.toggleGroupRow}>
        {options.map(opt => (
          <button
            key={opt}
            style={{
              ...styles.toggleOption,
              ...(value === opt ? styles.toggleOptionActive : {}),
            }}
            onClick={() => onChange(opt)}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = {
  container: {
    padding: '12px 12px 24px',
    paddingTop: 40,
  },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#6b7280', margin: '0 0 8px' },
  presetGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: 6 },
  presetCard: {
    background: '#1a1d2e',
    border: '1px solid #2a2d3e',
    borderRadius: 8,
    padding: '8px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#e0e0e0',
    transition: 'border-color 0.15s',
  },
  presetCardActive: {
    borderColor: '#3b82f6',
    background: '#1e2a4a',
  },
  presetName: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
  presetMsg: { fontSize: 11, color: '#6b7280', lineHeight: 1.3 },
  resetBtn: {
    marginTop: 8,
    width: '100%',
    padding: '6px 0',
    background: '#1a1d2e',
    border: '1px solid #374151',
    borderRadius: 6,
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: 12,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 0',
    background: 'none',
    border: 'none',
    borderTop: '1px solid #1e2130',
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
  controls: { paddingBottom: 8 },
  sliderGroup: { marginBottom: 12 },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  sliderValue: { color: '#a5b4fc', fontWeight: 600 },
  slider: {
    width: '100%',
    accentColor: '#3b82f6',
    height: 4,
    cursor: 'pointer',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: { fontSize: 12, color: '#9ca3af' },
  toggleBtn: {
    padding: '4px 14px',
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  toggleGroupRow: { display: 'flex', gap: 4 },
  toggleOption: {
    flex: 1,
    padding: '5px 0',
    background: '#1a1d2e',
    border: '1px solid #2a2d3e',
    borderRadius: 6,
    color: '#6b7280',
    fontSize: 11,
    cursor: 'pointer',
    textAlign: 'center',
  },
  toggleOptionActive: {
    background: '#1e3a5f',
    borderColor: '#3b82f6',
    color: '#60a5fa',
  },
};
