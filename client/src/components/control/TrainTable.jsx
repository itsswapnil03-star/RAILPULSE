import React from 'react';
import { formatTime } from '../../utils/formatTime';
import DelayBadge from '../shared/DelayBadge';

export default function TrainTable({ trains, onSelectTrain, selectedTrain }) {
  const enhancedTrains = trains.map(t => {
     let currentDelay = 0;
     if (t.stationLog) {
         const arrived = t.stationLog.filter(s => s.arrived);
         if (arrived.length > 0) {
             currentDelay = arrived[arrived.length - 1].delayMinutes || 0;
         }
     }
     return { ...t, currentDelay };
  });
  
  const sortedTrains = enhancedTrains.sort((a, b) => (b.currentDelay || 0) - (a.currentDelay || 0));

  return (
    <table className="min-w-full divide-y divide-gray-800 text-sm text-left">
      <thead className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <tr>
          <th className="px-4 py-3 font-semibold text-gray-400 font-mono text-xs uppercase tracking-widest">Train</th>
          <th className="px-4 py-3 font-semibold text-gray-400 font-mono text-xs uppercase tracking-widest">Loc</th>
          <th className="px-4 py-3 font-semibold text-gray-400 font-mono text-xs uppercase tracking-widest">Delay</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/50 bg-transparent">
        {sortedTrains.map((t) => {
          let borderColor = 'border-l-emerald-500';
          if (t.currentDelay > 30) borderColor = 'border-l-red-500';
          else if (t.currentDelay > 15) borderColor = 'border-l-orange-500';
          else if (t.currentDelay > 5) borderColor = 'border-l-amber-500';

          const isSelected = selectedTrain === t.trainNumber;

          return (
            <tr 
              key={t.trainNumber} 
              onClick={() => onSelectTrain(t.trainNumber)}
              className={`cursor-pointer hover:bg-cyan-900/20 border-l-4 transition-colors ${borderColor} ${isSelected ? 'bg-cyan-900/30' : ''}`}
            >
              <td className="px-4 py-3">
                <div className="font-bold text-white font-mono">{t.trainNumber}</div>
                <div className="text-xs text-gray-500 truncate max-w-[100px]">{t.trainName}</div>
              </td>
              <td className="px-4 py-3 text-cyan-400/80 font-mono text-xs">
                {Math.round(t.currentKm)} km
              </td>
              <td className="px-4 py-3">
                <DelayBadge delayMinutes={t.currentDelay} size="sm" />
              </td>
            </tr>
          );
        })}
        {sortedTrains.length === 0 && (
          <tr>
            <td colSpan="3" className="px-4 py-8 text-center text-gray-500 font-mono">No active trains</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
