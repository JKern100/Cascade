import React, { useRef, useEffect } from 'react';

export default function NarrativeModal({ narrative, onClose }) {
  const contentRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative).catch(() => {});
  };

  // Simple markdown-to-JSX renderer for the narrative
  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} style={md.h1}>{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} style={md.h2}>{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} style={md.h3}>{line.slice(4)}</h3>);
      } else if (line.startsWith('|')) {
        // Collect table rows
        const tableRows = [];
        let j = i;
        while (j < lines.length && lines[j].startsWith('|')) {
          const cells = lines[j].split('|').filter(c => c.trim()).map(c => c.trim());
          tableRows.push(cells);
          j++;
        }
        // Skip separator row
        const header = tableRows[0];
        const dataRows = tableRows.slice(2); // skip header + separator
        elements.push(
          <table key={i} style={md.table}>
            <thead>
              <tr>{header.map((cell, ci) => <th key={ci} style={md.th}>{cell}</th>)}</tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci} style={md.td}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        );
        i = j - 1;
      } else if (line.startsWith('- **')) {
        elements.push(<div key={i} style={md.bullet}>{renderInline(line.slice(2))}</div>);
      } else if (line.trim() === '') {
        elements.push(<div key={i} style={{ height: 8 }} />);
      } else {
        elements.push(<p key={i} style={md.p}>{renderInline(line)}</p>);
      }
    }

    return elements;
  };

  const renderInline = (text) => {
    // Handle **bold** patterns
    const parts = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} style={{ color: '#e5e7eb', fontWeight: 600 }}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Narrative Report</h2>
          <div style={styles.headerActions}>
            <button style={styles.copyBtn} onClick={handleCopy}>Copy Text</button>
            <button style={styles.closeBtn} onClick={onClose}>Close</button>
          </div>
        </div>
        <div style={styles.content} ref={contentRef}>
          {renderMarkdown(narrative)}
        </div>
      </div>
    </div>
  );
}

const md = {
  h1: { fontSize: 22, fontWeight: 700, color: '#ffffff', margin: '0 0 16px', borderBottom: '1px solid #2a2d3e', paddingBottom: 12 },
  h2: { fontSize: 17, fontWeight: 700, color: '#a5b4fc', margin: '24px 0 10px' },
  h3: { fontSize: 14, fontWeight: 600, color: '#d1d5db', margin: '18px 0 8px' },
  p: { fontSize: 14, lineHeight: 1.7, color: '#c9cdd5', margin: '0 0 6px' },
  bullet: { fontSize: 14, lineHeight: 1.7, color: '#c9cdd5', paddingLeft: 16, margin: '4px 0' },
  table: { width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #2a2d3e', color: '#a5b4fc', fontWeight: 600 },
  td: { padding: '6px 12px', borderBottom: '1px solid #1e2130', color: '#d1d5db' },
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#141622',
    border: '1px solid #2a2d3e',
    borderRadius: 12,
    width: '90%',
    maxWidth: 740,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #1e2130',
    flexShrink: 0,
  },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 },
  headerActions: { display: 'flex', gap: 8 },
  copyBtn: {
    padding: '6px 14px',
    background: '#1e3a5f',
    border: '1px solid #3b82f6',
    borderRadius: 6,
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  closeBtn: {
    padding: '6px 14px',
    background: '#1a1d2e',
    border: '1px solid #374151',
    borderRadius: 6,
    color: '#9ca3af',
    fontSize: 12,
    cursor: 'pointer',
  },
  content: {
    padding: '20px 28px 32px',
    overflow: 'auto',
    flex: 1,
  },
};
