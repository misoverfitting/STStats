import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-title" style={{ color: d.color }}>{d.name}</p>
      <p className="tooltip-row">Win Rate <strong>{d.winRate}%</strong></p>
      <p className="tooltip-sub">{d.wins} wins / {d.runs} runs</p>
    </div>
  );
};

export default function CharacterChart({ characters, selected }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={characters} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#8888aa', fontFamily: 'Cinzel, serif', fontSize: 11 }}
          axisLine={{ stroke: '#252545' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 60]}
          tick={{ fill: '#8888aa', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}%`}
        />
        <ReferenceLine y={40} stroke="#2a2a50" strokeDasharray="3 3" />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="winRate" radius={[3, 3, 0, 0]}>
          {characters.map(c => (
            <Cell
              key={c.id}
              fill={c.color}
              opacity={selected === 'all' || selected === c.id ? 1 : 0.25}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
