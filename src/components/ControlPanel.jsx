import React, { useState, useRef, useEffect } from 'react';
import { PRESET_LIST } from '../presets/presets.js';

// ─── Tooltip Descriptions ────────────────────────────────────────
const TOOLTIPS = {
  // AI Adoption
  adoptionRate: 'How quickly and broadly AI is adopted across all sectors of the economy. Higher values mean faster, more widespread automation. Source: McKinsey Global Institute adoption projections.',
  adoptionCurve: 'The shape of the adoption timeline. Gradual = steady 15-year rollout. Accelerated = front-loaded, peak disruption by Year 5. Shock = near-immediate mass adoption. Source: McKinsey (2017\u20132023).',
  newJobCreationRate: 'Percentage of displaced jobs that are replaced by entirely new AI-enabled roles (e.g., AI trainers, prompt engineers, human-AI coordinators). Higher values assume AI creates more new categories of work.',
  regulatoryBrakes: 'Years of delay imposed on the adoption curve by government regulation. Shifts the entire adoption timeline to the right, giving institutions more time to adapt.',

  // Displacement
  displacementLow: 'Vulnerability of low-skill workers (e.g., data entry, assembly line, cashiers) to AI automation. Higher = more jobs at risk. Source: Frey & Osborne (2013), Oxford Economics.',
  displacementMid: 'Vulnerability of mid-skill workers (e.g., bookkeeping, paralegal, customer service) to AI automation. This tier often faces the highest displacement rates. Source: Frey & Osborne (2013).',
  displacementHigh: 'Vulnerability of high-skill workers (e.g., analysts, engineers, physicians) to AI automation. Generally lower, as these roles involve complex judgment. Source: Frey & Osborne (2013).',
  displacementTimeline: 'How many years until displacement reaches its peak rate. Shorter timelines mean faster disruption with less time for workers and institutions to adapt.',
  retrainingEffectiveness: 'How successfully displaced workers transition to new roles through retraining programs. 0% = no one successfully retrains. 80% = highly effective programs. Source: OECD retraining evaluations.',

  // Inequality & Access
  aiAccessIndex: 'How equitably AI tools are distributed across the population. 0 = concentrated among wealthy individuals and corporations. 100 = universal access like a public utility. Affects wage polarization and educational outcomes. Source: Pew Research (2023).',
  schoolAccessLow: 'Level of AI tool access in low-income schools (0\u2013100). Low values mean students lack AI tutoring, adaptive learning, and digital skills training. Drives the intergenerational achievement gap. Source: Common Sense Media, UNICEF.',
  schoolAccessMid: 'Level of AI tool access in middle-income schools (0\u2013100). The gap between this and high-income school access determines how quickly educational inequality compounds.',
  schoolAccessHigh: 'Level of AI tool access in high-income schools (0\u2013100). When this is high and low-income access is low, children\u2019s educational outcomes diverge sharply over time. Source: OECD PISA, Stanford CEPA.',
  geographicGap: 'The disparity in AI access and economic impact between urban, suburban, rural, and developing regions. 0 = no geographic inequality. 100 = extreme urban-rural divide in automation benefits.',

  // Policy Levers
  ubiEnabled: 'Whether a Universal Basic Income program is active. UBI provides a monthly cash payment to all adults, creating a spending floor for low-income households. Source: Finland UBI pilot, Stockton SEED.',
  ubiAmount: 'Monthly UBI payment per adult in dollars. Higher amounts provide a stronger spending floor but cost more in tax revenue. $1,000/mo approximates most major UBI proposals. Source: Finland UBI pilot, GiveDirectly.',
  retrainingSubsidies: 'Percentage of displaced workers covered by government-funded retraining programs. Higher coverage improves transition success rates but draws from tax revenue. Source: OECD retraining evaluations.',
  robotTaxRate: 'Percentage of labor cost savings from automation that is captured as tax revenue. A "robot tax" creates a new revenue stream as traditional payroll taxes decline. Revenue can fund UBI and retraining. Range: 0\u201340%.',
  safetyNet: 'Baseline level of social safety net programs. Minimal = reduced benefits. Current = existing programs unchanged. Strengthened = expanded unemployment insurance, food assistance, and healthcare subsidies.',
};

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
            onChange={v => onChange('adoptionRate', v)} tooltip={TOOLTIPS.adoptionRate} />
          <ToggleGroup label="Adoption Curve" value={params.adoptionCurve}
            options={['gradual', 'accelerated', 'shock']}
            onChange={v => onChange('adoptionCurve', v)} tooltip={TOOLTIPS.adoptionCurve} />
          <Slider label="New Job Creation" value={params.newJobCreationRate} min={0} max={50} unit="%"
            onChange={v => onChange('newJobCreationRate', v)} tooltip={TOOLTIPS.newJobCreationRate} />
          <Slider label="Regulatory Delay" value={params.regulatoryBrakes} min={0} max={5} unit=" yrs"
            onChange={v => onChange('regulatoryBrakes', v)} tooltip={TOOLTIPS.regulatoryBrakes} />
        </div>
      )}

      {/* Displacement */}
      <SectionHeader title="Displacement" section="displacement" expanded={expandedSection} onToggle={toggle} />
      {expandedSection === 'displacement' && (
        <div style={styles.controls}>
          <Slider label="Low-Skill Vulnerability" value={params.displacementLow} min={0} max={100} unit="%"
            onChange={v => onChange('displacementLow', v)} tooltip={TOOLTIPS.displacementLow} />
          <Slider label="Mid-Skill Vulnerability" value={params.displacementMid} min={0} max={100} unit="%"
            onChange={v => onChange('displacementMid', v)} tooltip={TOOLTIPS.displacementMid} />
          <Slider label="High-Skill Vulnerability" value={params.displacementHigh} min={0} max={100} unit="%"
            onChange={v => onChange('displacementHigh', v)} tooltip={TOOLTIPS.displacementHigh} />
          <Slider label="Displacement Timeline" value={params.displacementTimeline} min={1} max={10} unit=" yrs"
            onChange={v => onChange('displacementTimeline', v)} tooltip={TOOLTIPS.displacementTimeline} />
          <Slider label="Retraining Effectiveness" value={params.retrainingEffectiveness} min={0} max={80} unit="%"
            onChange={v => onChange('retrainingEffectiveness', v)} tooltip={TOOLTIPS.retrainingEffectiveness} />
        </div>
      )}

      {/* Inequality & Access */}
      <SectionHeader title="Inequality & Access" section="inequality" expanded={expandedSection} onToggle={toggle} />
      {expandedSection === 'inequality' && (
        <div style={styles.controls}>
          <Slider label="AI Access Index" value={params.aiAccessIndex} min={0} max={100}
            onChange={v => onChange('aiAccessIndex', v)} tooltip={TOOLTIPS.aiAccessIndex} />
          <Slider label="School Access: Low Income" value={params.schoolAccessLow} min={0} max={100}
            onChange={v => onChange('schoolAccessLow', v)} tooltip={TOOLTIPS.schoolAccessLow} />
          <Slider label="School Access: Mid Income" value={params.schoolAccessMid} min={0} max={100}
            onChange={v => onChange('schoolAccessMid', v)} tooltip={TOOLTIPS.schoolAccessMid} />
          <Slider label="School Access: High Income" value={params.schoolAccessHigh} min={0} max={100}
            onChange={v => onChange('schoolAccessHigh', v)} tooltip={TOOLTIPS.schoolAccessHigh} />
          <Slider label="Geographic Gap" value={params.geographicGap} min={0} max={100}
            onChange={v => onChange('geographicGap', v)} tooltip={TOOLTIPS.geographicGap} />
        </div>
      )}

      {/* Policy Levers */}
      <SectionHeader title="Policy Levers" section="policy" expanded={expandedSection} onToggle={toggle} />
      {expandedSection === 'policy' && (
        <div style={styles.controls}>
          <TooltipToggleRow
            label="Universal Basic Income"
            tooltip={TOOLTIPS.ubiEnabled}
            checked={params.ubiEnabled}
            onChange={() => onChange('ubiEnabled', !params.ubiEnabled)}
          />
          {params.ubiEnabled && (
            <Slider label="UBI Amount" value={params.ubiAmount} min={0} max={2000} unit="$/mo"
              onChange={v => onChange('ubiAmount', v)} tooltip={TOOLTIPS.ubiAmount} />
          )}
          <Slider label="Retraining Subsidies" value={params.retrainingSubsidies} min={0} max={100} unit="%"
            onChange={v => onChange('retrainingSubsidies', v)} tooltip={TOOLTIPS.retrainingSubsidies} />
          <Slider label="Robot/Automation Tax" value={params.robotTaxRate} min={0} max={40} unit="%"
            onChange={v => onChange('robotTaxRate', v)} tooltip={TOOLTIPS.robotTaxRate} />
          <ToggleGroup label="Safety Net" value={params.safetyNet}
            options={['minimal', 'current', 'strengthened']}
            onChange={v => onChange('safetyNet', v)} tooltip={TOOLTIPS.safetyNet} />
        </div>
      )}
    </div>
  );
}

// ─── Styled Tooltip Component ────────────────────────────────────

function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const show = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: Math.max(8, Math.min(rect.left - 100, window.innerWidth - 280)),
      });
    }
    setVisible(true);
  };

  const hide = () => setVisible(false);

  return (
    <>
      <span
        ref={iconRef}
        style={tooltipStyles.icon}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
        role="button"
        aria-label="More information"
      >
        ?
      </span>
      {visible && (
        <div style={{
          ...tooltipStyles.popup,
          position: 'fixed',
          top: position.top,
          left: position.left,
        }}>
          {text}
        </div>
      )}
    </>
  );
}

const tooltipStyles = {
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
    lineHeight: 1,
    border: '1px solid #374151',
    transition: 'background 0.15s, color 0.15s',
  },
  popup: {
    zIndex: 9999,
    width: 260,
    padding: '10px 12px',
    background: '#1e2130',
    border: '1px solid #3b82f6',
    borderRadius: 8,
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 1.5,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
  },
};

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
    <div style={styles.sliderGroup}>
      <div style={styles.sliderLabel}>
        <span style={styles.sliderLabelText}>
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </span>
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

function ToggleGroup({ label, value, options, onChange, tooltip }) {
  return (
    <div style={styles.sliderGroup}>
      <div style={styles.sliderLabel}>
        <span style={styles.sliderLabelText}>
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </span>
      </div>
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

function TooltipToggleRow({ label, tooltip, checked, onChange }) {
  return (
    <div style={styles.toggleRow}>
      <span style={styles.toggleLabelWithTip}>
        <label style={styles.toggleLabel}>{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <button
        style={{ ...styles.toggleBtn, background: checked ? '#2563eb' : '#374151' }}
        onClick={onChange}
      >
        {checked ? 'ON' : 'OFF'}
      </button>
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
    alignItems: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  sliderLabelText: {
    display: 'inline-flex',
    alignItems: 'center',
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
  toggleLabelWithTip: {
    display: 'inline-flex',
    alignItems: 'center',
  },
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
