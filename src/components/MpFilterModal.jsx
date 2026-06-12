import { useEffect, useRef } from 'react';

const OPTIONS = [
  { id: 'all',          label: 'All Modes',    desc: 'Show all runs regardless of mode' },
  { id: 'singleplayer', label: 'Singleplayer', desc: 'Solo runs only'                   },
  { id: 'multiplayer',  label: 'Multiplayer',  desc: 'Co-op runs only'                  },
];

export default function MpFilterModal({ value, onChange, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-panel" ref={panelRef}>
        <div className="modal-header">
          <span className="modal-title">Game Mode</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="modal-desc">Filter all statistics by singleplayer or multiplayer runs.</p>
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            className={`modal-option${value === opt.id ? ' selected' : ''}`}
            onClick={() => { onChange(opt.id); onClose(); }}
          >
            <span className="modal-option-check">{value === opt.id ? '✓' : ''}</span>
            <span className="modal-option-content">
              <span className="modal-option-label">{opt.label}</span>
              <span className="modal-option-desc">{opt.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
