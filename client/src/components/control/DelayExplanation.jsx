import React from 'react';

export default function DelayExplanation({ prediction }) {
  if (!prediction || !prediction.features) return null;

  const delayStr = Math.round(prediction.predictedDelay);
  const isDelayed = delayStr > 5;

  // Mock factors based on the features available, for demonstration
  // In a real app, the ML model should provide feature importance directly
  const { current_delay, weather_severity, day_of_week } = prediction.features;
  
  let factors = [];
  if (current_delay > 0) factors.push({ name: 'Current Delay Propagation', pct: 60, color: 'bg-blue-500' });
  if (weather_severity > 1) factors.push({ name: 'Weather Conditions', pct: 25, color: 'bg-amber-500' });
  if (day_of_week > 4) factors.push({ name: 'Weekend Congestion', pct: 15, color: 'bg-purple-500' });

  // Fallback if empty
  if (factors.length === 0) factors.push({ name: 'Normal Operations', pct: 100, color: 'bg-emerald-500' });

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-2 text-sm">AI Prediction Analysis</h3>
      <p className="text-sm text-slate-600 mb-4">
        ETA for next station indicates the train will be{' '}
        <strong className={isDelayed ? 'text-red-600' : 'text-emerald-600'}>
          {isDelayed ? `${delayStr} minutes late` : 'on time'}
        </strong>.
      </p>

      {isDelayed && (
        <>
          <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Contributing Factors</div>
          <div className="h-4 w-full flex rounded-full overflow-hidden mb-3">
            {factors.map((f, i) => (
              <div key={i} className={`h-full ${f.color}`} style={{ width: `${f.pct}%` }} title={`${f.name} (${f.pct}%)`} />
            ))}
          </div>
          <ul className="text-xs space-y-1">
            {factors.map((f, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="flex items-center"><span className={`w-2 h-2 rounded-full mr-2 ${f.color}`}></span>{f.name}</span>
                <span className="text-slate-500">{f.pct}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
