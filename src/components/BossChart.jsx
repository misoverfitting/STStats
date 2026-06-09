import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';

const ACT_COLORS = {
  1: '#5c80c8',
  2: '#c9a227',
  3: '#d4825c',
  4: '#8b2020',
};

const ACT_LABELS = {
  1: 'Act 1 — Exordium',
  2: 'Act 2 — City',
  3: 'Act 3 — Beyond',
  4: 'Act 4 — Ending',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-title" style={{ color: ACT_COLORS[d.act] }}>{d.name}</p>
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
              <Cell key={b.name} fill={ACT_COLORS[b.act]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="boss-legend">
        {Object.entries(ACT_LABELS).map(([act, label]) => (
          <span key={act} className="legend-item">
            <span className="legend-dot" style={{ background: ACT_COLORS[act] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
