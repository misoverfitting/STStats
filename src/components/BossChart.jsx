import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';

// STS2 act colours
const ACT_COLORS = {
  overgrowth: '#5cbf7a',
  underdocks: '#5c95d4',
  hive:       '#c9a227',
  glory:      '#d45c5c',
};

const ACT_LABELS = {
  overgrowth: 'Act 1 — Overgrowth',
  underdocks: 'Act 1 — Underdocks',
  hive:       'Act 2 — The Hive',
  glory:      'Act 3 — Glory',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-title" style={{ color: ACT_COLORS[d.act] || '#c9a227' }}>{d.name}</p>
      <p className="tooltip-row">Win Rate <strong>{d.winRate}%</strong></p>
      <p className="tooltip-sub">{d.victories} / {d.encounters} encounters</p>
    </div>
  );
};

export default function BossChart({ data }) {
  const sorted = [...data].sort((a, b) => a.winRate - b.winRate);

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 60, left: 96, bottom: 5 }}>
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#252545' }}
            tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#e2d9c2', fontFamily: 'Cinzel, serif', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={96}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="winRate" radius={[0, 3, 3, 0]}>
            {sorted.map(b => (
              <Cell key={b.name} fill={ACT_COLORS[b.act] || '#888'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="boss-legend">
        {Object.entries(ACT_LABELS).map(([act, label]) => (
          <span key={act} className="legend-item">
            <span className="legend-dot" style={{ background: ACT_COLORS[act] || '#888' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
