import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { winRateHistory } from '../data/playerStats';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-sub">Run #{label}</p>
      <p className="tooltip-row">
        10-run avg <strong>{d.rollingWinRate}%</strong>
      </p>
      <p className="tooltip-sub">{d.won ? '✓ Win' : '✗ Loss'}</p>
    </div>
  );
};

export default function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={winRateHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#c9a227" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#c9a227" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="run"
          tick={{ fill: '#8888aa', fontSize: 10 }}
          axisLine={{ stroke: '#252545' }}
          tickLine={false}
          tickCount={6}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#8888aa', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}%`}
        />
        <ReferenceLine y={50} stroke="#2a2a50" strokeDasharray="3 3" />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#c9a227', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Area
          type="monotone"
          dataKey="rollingWinRate"
          stroke="#c9a227"
          strokeWidth={2}
          fill="url(#trendGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#c9a227', stroke: '#121224', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
