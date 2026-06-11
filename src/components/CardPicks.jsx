import { useState, useMemo } from 'react';
import { CARD_TYPES, TYPE_ORDER, TYPE_LABELS } from '../data/cardTypes';

const SORT_OPTIONS = [
  { id: 'pickRate',    label: 'Pick Rate'    },
  { id: 'offered',    label: 'Most Offered' },
  { id: 'pickRateAsc', label: 'Most Skipped' },
  { id: 'winRate',    label: 'Win %'        },
];

const SOURCE_OPTIONS = [
  { id: 'all',    label: 'All'    },
  { id: 'reward', label: 'Reward' },
  { id: 'shop',   label: 'Shop'   },
];

const TYPE_COLORS = {
  attack: 'var(--loss)',
  skill:  'var(--silent)',
  power:  'var(--necrobinder)',
  curse:  'var(--text-faint)',
  status: 'var(--text-faint)',
  unknown: 'var(--text-faint)',
};

function pickRateForSource(card, source) {
  if (source === 'reward') return { rate: card.rewardPickRate, offered: card.rewardOffered };
  if (source === 'shop')   return { rate: card.shopPickRate,   offered: card.shopOffered   };
  return { rate: card.pickRate, offered: card.offered };
}

function MiniBar({ rate, color = 'var(--gold)' }) {
  return (
    <div className="minibar-track">
      <div className="minibar-fill" style={{ width: `${rate}%`, background: color }} />
    </div>
  );
}

function TypeBadge({ type }) {
  const label = TYPE_LABELS[type] ?? '?';
  const color = TYPE_COLORS[type] ?? 'var(--text-faint)';
  return (
    <span className="type-badge" style={{ color, borderColor: color }}>
      {label}
    </span>
  );
}

export default function CardPicks({ cards, selectedChar }) {
  const [sort,   setSort]   = useState('pickRate');
  const [source, setSource] = useState('all');
  const [type,   setType]   = useState('all');
  const [limit,  setLimit]  = useState(30);

  const filtered = useMemo(() => {
    let list = cards;

    if (selectedChar !== 'all') {
      list = list.filter(c => c.byChar?.[selectedChar]?.offered >= 3);
    }
    if (source === 'reward') list = list.filter(c => c.rewardOffered > 0);
    if (source === 'shop')   list = list.filter(c => c.shopOffered   > 0);
    if (type !== 'all') {
      list = list.filter(c => (CARD_TYPES[c.id] ?? 'unknown') === type);
    }

    return [...list].sort((a, b) => {
      const ra = pickRateForSource(a, source).rate;
      const rb = pickRateForSource(b, source).rate;
      if (sort === 'offered')     return pickRateForSource(b, source).offered - pickRateForSource(a, source).offered;
      if (sort === 'pickRateAsc') return ra - rb;
      if (sort === 'winRate') {
        const wa = a.winPickRate ?? -1;
        const wb = b.winPickRate ?? -1;
        return wb - wa;
      }
      return rb - ra;
    });
  }, [cards, selectedChar, source, sort, type]);

  const shown = filtered.slice(0, limit);
  const typeOptions = ['all', ...TYPE_ORDER];

  return (
    <div>
      <div className="card-picks-controls">
        <div className="picks-control-group">
          <span className="picks-control-label">Sort</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`picks-pill ${sort === opt.id ? 'active' : ''}`}
              onClick={() => setSort(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="picks-control-group">
          <span className="picks-control-label">Source</span>
          {SOURCE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`picks-pill ${source === opt.id ? 'active' : ''}`}
              onClick={() => setSource(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="picks-control-group">
          <span className="picks-control-label">Type</span>
          {typeOptions.map(t => (
            <button
              key={t}
              className={`picks-pill ${type === t ? 'active' : ''}`}
              onClick={() => { setType(t); setLimit(30); }}
            >
              {t === 'all' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <span className="picks-count">{filtered.length} cards</span>
      </div>

      <div className="table-wrapper">
        <table className="run-table card-picks-table">
          <thead>
            <tr>
              <th style={{ width: 180 }}>Card</th>
              <th style={{ width: 70 }}>Type</th>
              <th style={{ width: 60 }}>Offered</th>
              <th style={{ width: 60 }}>Picked</th>
              <th style={{ width: 80 }}>Pick %</th>
              <th style={{ minWidth: 120 }}>Pick Rate</th>
              <th style={{ width: 75 }}>Win %</th>
              {source === 'all' && <th style={{ width: 80 }}>Reward</th>}
              {source === 'all' && <th style={{ width: 80 }}>Shop</th>}
            </tr>
          </thead>
          <tbody>
            {shown.map(card => {
              const { rate, offered } = pickRateForSource(card, source);
              const picked = source === 'reward' ? card.rewardPicked
                           : source === 'shop'   ? card.shopPicked
                           : card.picked;
              const color = rate >= 70 ? 'var(--win)'
                          : rate >= 40 ? 'var(--gold)'
                          : 'var(--loss)';
              const cardType = CARD_TYPES[card.id] ?? 'unknown';

              const wr = card.winPickRate;
              const wrColor = wr == null  ? 'var(--text-faint)'
                            : wr >= 50    ? 'var(--win)'
                            : wr >= 30    ? 'var(--gold)'
                            : 'var(--loss)';

              return (
                <tr key={card.id}>
                  <td style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem' }}>
                    {card.name}
                  </td>
                  <td><TypeBadge type={cardType} /></td>
                  <td className="muted">{offered}</td>
                  <td className="muted">{picked}</td>
                  <td style={{ color, fontWeight: 600 }}>{rate}%</td>
                  <td><MiniBar rate={rate} color={color} /></td>
                  <td style={{ color: wrColor, fontWeight: 600 }}>
                    {wr != null ? `${wr}%` : '—'}
                  </td>
                  {source === 'all' && (
                    <td className="muted">
                      {card.rewardOffered > 0
                        ? `${card.rewardPickRate}% (${card.rewardOffered})`
                        : '—'}
                    </td>
                  )}
                  {source === 'all' && (
                    <td className="muted">
                      {card.shopOffered > 0
                        ? `${card.shopPickRate}% (${card.shopOffered})`
                        : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > limit && (
        <button
          className="load-more-btn"
          onClick={() => setLimit(l => l + 30)}
        >
          Show more ({filtered.length - limit} remaining)
        </button>
      )}
    </div>
  );
}
