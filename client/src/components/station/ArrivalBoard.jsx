import React, { useState, useEffect } from 'react';
import { fetchStationBoard } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorBanner from '../shared/ErrorBanner';

export default function ArrivalBoard({ stationCode }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    async function load() {
      try {
        const data = await fetchStationBoard(stationCode);
        setBoard(data.arrivals || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
    interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [stationCode]);

  if (loading) return <div className="py-20"><LoadingSpinner text="Loading station arrivals..." /></div>;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1d2a41] text-[#8ba0be] text-xs font-mono uppercase tracking-wider bg-[#080d16]/60">
            <th className="py-3.5 px-4">Train No.</th>
            <th className="py-3.5 px-4">Train Name</th>
            <th className="py-3.5 px-4">Route</th>
            <th className="py-3.5 px-4">Scheduled</th>
            <th className="py-3.5 px-4">Expected ETA</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-center">PF</th>
          </tr>
        </thead>
        <tbody className="font-mono text-sm divide-y divide-[#1d2a41]/60">
          {board.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-16 text-center text-[#5b718f] font-mono tracking-widest uppercase">
                NO ARRIVALS SCHEDULED AT THIS TIME
              </td>
            </tr>
          ) : (
            board.map((train) => {
              const delay = train.delayMinutes || 0;
              let statusText = 'ON TIME';
              let statusColor = 'text-[#2ecc8f] bg-[#2ecc8f]/10 border-[#2ecc8f]/30';
              let rowStyle = 'hover:bg-[#141f31]/50';
              
              if (train.status === 'ARRIVED') {
                 statusText = 'ARRIVED';
                 statusColor = 'text-[#8ba0be] bg-[#141f31] border-[#1d2a41]';
                 rowStyle = 'opacity-60 hover:bg-[#141f31]/30';
              } else if (delay > 15) {
                 statusText = `+${delay} MIN LATE`;
                 statusColor = 'text-[#f0576f] bg-[#f0576f]/10 border-[#f0576f]/30';
              } else if (delay > 5) {
                 statusText = `+${delay} MIN LATE`;
                 statusColor = 'text-[#f5a524] bg-[#f5a524]/10 border-[#f5a524]/30';
              }

              return (
                <tr key={train.trainNumber} className={`transition-colors ${rowStyle}`}>
                  <td className="py-4 px-4 text-[#4c9aff] font-bold tracking-tight">
                    {train.trainNumber}
                  </td>
                  <td className="py-4 px-4 text-[#e9eff9] font-sans font-semibold">
                    {train.trainName}
                  </td>
                  <td className="py-4 px-4 text-[#8ba0be] text-xs font-mono">
                    {train.from} → {train.to}
                  </td>
                  <td className="py-4 px-4 text-[#5b718f]">
                    {formatTime(train.scheduledArrival || new Date().toISOString())}
                  </td>
                  <td className="py-4 px-4 font-bold text-[#e9eff9]">
                    {formatTime(train.expectedArrival || new Date().toISOString())}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded border ${statusColor}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-[#4c9aff] font-bold">
                    {train.platform || '-'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
