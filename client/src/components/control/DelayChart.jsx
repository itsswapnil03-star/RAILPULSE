import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatTime } from '../../utils/formatTime';

export default function DelayChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm">Insufficient telemetry data</div>;
  }

  const chartData = data.map(d => ({
    timeStr: formatTime(d.timestamp),
    delay: d.avgDelay
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="timeStr" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
          itemStyle={{ color: '#a855f7' }}
        />
        <Area type="monotone" dataKey="delay" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorDelay)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
