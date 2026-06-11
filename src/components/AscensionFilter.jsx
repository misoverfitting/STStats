import { useState, useEffect, useRef } from 'react';

export default function AscensionFilter({ available, selected, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function toggleAscension(asc) {
    if (!selected) {
      onChange([asc]);
    } else if (selected.includes(asc)) {
      const next = selected.filter(a => a !== asc);
      onChange(next.length ? next : null);
    } else {
      onChange([...selected, asc].sort((a, b) => a - b));
    }
  }

  function selectAll() {
    onChange(null);
    setOpen(false);
  }

  const isAll = !selected;

  let label = 'Ascensions';
  if (selected) {
    if (selected.length === 1) label = `A${selected[0]}`;
    else label = `${selected.length} Asc`;
  }

  return (
    <div className="asc-filter-wrap" ref={wrapRef}>
      <button
        className={`header-change-btn asc-filter-btn${selected ? ' active' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        title={disabled ? 'Not available in demo mode' : 'Filter by ascension level'}
      >
        {label}
      </button>

      {open && (
        <div className="asc-popup">
          <div className="asc-popup-header">Filter by Ascension</div>

          <button
            className={`asc-option${isAll ? ' selected' : ''}`}
            onClick={selectAll}
          >
            <span className="asc-check">{isAll ? '✓' : ' '}</span>
            All Ascensions
          </button>

          <div className="asc-divider" />

          <div className="asc-grid">
            {available.map(asc => {
              const on = selected?.includes(asc) ?? false;
              return (
                <button
                  key={asc}
                  className={`asc-pill${on ? ' selected' : ''}`}
                  onClick={() => toggleAscension(asc)}
                >
                  A{asc}
                </button>
              );
            })}
          </div>

          {selected && (
            <button className="asc-clear-btn" onClick={selectAll}>
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
