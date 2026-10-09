import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { fmtShort } from './ui';

export const PALETTE = ['#4F46E5', '#8B5CF6', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444'];
const axis = { fontSize: 12, fill: '#94A3B8' };
const tip = { borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 12px 32px -12px rgba(79,70,229,.25)', fontSize: 13 };

export const ScoreTrendChart = ({ data, height = 260, variant = 'area' }) => {
  const rows = data.map((d) => ({ ...d, label: fmtShort(d.date) }));
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
      <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
      <YAxis domain={[0, 100]} tick={axis} tickLine={false} axisLine={false} width={32} />
      <Tooltip contentStyle={tip} formatter={(v) => [`${v}/100`, 'Score']} labelFormatter={(l, p) => `${p?.[0]?.payload?.role || ''} · ${l}`} />
    </>
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === 'line' ? (
        <LineChart data={rows} margin={{ left: -8, right: 8, top: 8 }}>
          {common}
          <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} />
        </LineChart>
      ) : (
        <AreaChart data={rows} margin={{ left: -8, right: 8, top: 8 }}>
          <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} /><stop offset="100%" stopColor="#4F46E5" stopOpacity={0} /></linearGradient></defs>
          {common}
          <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fill="url(#g1)" />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

export const SkillBarChart = ({ data, height = 280 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} />
      <XAxis type="number" domain={[0, 100]} tick={axis} tickLine={false} axisLine={false} />
      <YAxis type="category" dataKey="skill" tick={{ ...axis, fill: '#475569' }} tickLine={false} axisLine={false} width={96} />
      <Tooltip contentStyle={tip} cursor={{ fill: '#F1F5F9' }} formatter={(v) => [`${v}/100`, 'Avg score']} />
      <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={16}>{data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const TypePieChart = ({ data, height = 260 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie data={data} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} cornerRadius={6}>
        {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
      </Pie>
      <Tooltip contentStyle={tip} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
    </PieChart>
  </ResponsiveContainer>
);

export const DifficultyBarChart = ({ data, height = 260 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ left: -8 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
      <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
      <YAxis domain={[0, 100]} tick={axis} tickLine={false} axisLine={false} width={32} />
      <Tooltip contentStyle={tip} cursor={{ fill: '#F1F5F9' }} formatter={(v) => [`${v}/100`, 'Avg score']} />
      <Bar dataKey="avg" radius={[10, 10, 0, 0]} barSize={36} fill="#8B5CF6" />
    </BarChart>
  </ResponsiveContainer>
);
