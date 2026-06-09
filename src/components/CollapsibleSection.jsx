import { useState } from 'react';

export default function CollapsibleSection({ title, subtitle, defaultOpen = true, children, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`chart-card chart-card-full collapsible-section ${className}`}>
      <button
        className="section-title section-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="section-toggle-text">
          {title}
          {subtitle && <span className="section-sub">{subtitle}</span>}
        </span>
        <span className="collapse-icon">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}
