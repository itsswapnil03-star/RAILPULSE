import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '../../context/SocketContext';
import { fetchPredictions } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Gauge, 
  Clock, 
  Check, 
  Navigation, 
  Search,
  Activity,
  Layers
} from 'lucide-react';

export default function RouteAnalyticsView() {
  const { trainsList, connected, simulatedTime } = useSocket();
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('22225');
  const [predictions, setPredictions] = useState([]);
  const [mode, setMode] = useState('dynamic'); // 'scheduled' | 'dynamic'
  const [searchQuery, setSearchQuery] = useState('');

  const trains = trainsList;

  useEffect(() => {
    if (trains.length > 0 && !trains.find(t => t.trainNumber === selectedTrainNumber)) {
      setSelectedTrainNumber(trains[0].trainNumber);
    }
  }, [trains, selectedTrainNumber]);

  useEffect(() => {
    if (!selectedTrainNumber) return;
    async function loadPreds() {
      try {
        const p = await fetchPredictions(selectedTrainNumber);
        setPredictions(p.predictions || []);
      } catch (err) {
        setPredictions([]);
      }
    }
    loadPreds();
  }, [selectedTrainNumber]);

  const selectedTrain = useMemo(() => {
    return trains.find(t => t.trainNumber === selectedTrainNumber) || trains[0] || null;
  }, [trains, selectedTrainNumber]);

  const run = selectedTrain?.currentRun || selectedTrain;
  const schedule = selectedTrain?.schedule || run?.stationLog || [];
  const nextHaltIndex = run?.nextStationIndex || 1;

  const maxAllowedSpeed = selectedTrain?.type === 'Semi-high-speed' ? 130 : 110;
  const currentSpeed = Math.round(run?.currentSpeed || 0);

  return (
    <div className="space-y-4">
      
      {/* Train Selector Dropdown & Filter Bar */}
      <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#141f31] border border-[#1d2a41] text-[#4c9aff]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#8ba0be] uppercase">
              ROUTE ANALYTICS
            </div>
            <h1 className="text-xl font-extrabold text-[#e9eff9] font-sans">
              {selectedTrain?.name} (#{selectedTrain?.trainNumber})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTrainNumber}
            onChange={(e) => setSelectedTrainNumber(e.target.value)}
            className="bg-[#141f31] border border-[#1d2a41] text-[#e9eff9] text-xs rounded-lg px-3 py-2 font-mono outline-none cursor-pointer focus:border-[#4c9aff] max-w-[280px]"
          >
            {trains.map(t => (
              <option key={t.trainNumber} value={t.trainNumber}>
                #{t.trainNumber} - {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTrain && (
        <div className="bg-[#0e1725] border border-[#1d2a41] rounded-2xl p-5 shadow-xl space-y-5">
          
          {/* Header Bar with Scheduled vs Dynamic Prediction Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1d2a41] pb-4">
            <div>
              <div className="text-xs font-mono text-[#8ba0be]">
                Route: <span className="text-[#e9eff9] font-bold">{selectedTrain.originCode || 'CSMT'} → {selectedTrain.destinationCode || 'SUR'}</span>
              </div>
              <div className="text-[11px] font-mono text-[#5b718f] mt-0.5">
                Total Halts: {schedule.length} · Distance: {run.totalKm || 450} km
              </div>
            </div>

            {/* Toggle: Scheduled vs Dynamic Prediction (Matching user reference) */}
            <div className="flex items-center bg-[#141f31] p-1 rounded-xl border border-[#1d2a41]">
              <button
                onClick={() => setMode('scheduled')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  mode === 'scheduled'
                    ? 'bg-[#080d16] text-[#e9eff9] font-bold shadow-sm'
                    : 'text-[#8ba0be] hover:text-[#e9eff9]'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setMode('dynamic')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  mode === 'dynamic'
                    ? 'bg-[#4c9aff] text-[#080d16] shadow-[0_0_10px_rgba(76,154,255,0.3)]'
                    : 'text-[#8ba0be] hover:text-[#e9eff9]'
                }`}
              >
                <Zap className="w-3 h-3" />
                Dynamic Prediction
              </button>
            </div>
          </div>

          {/* Station-by-Station Analytics Table (Matching Mockup Column 3) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1d2a41] text-[#8ba0be] uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">STATION</th>
                  <th className="pb-3 text-center">SCHEDULED</th>
                  <th className="pb-3 text-center">PREDICTED</th>
                  <th className="pb-3 text-right pr-3">TREND</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d2a41]/50">
                {schedule.map((stop, idx) => {
                  const log = run.stationLog?.find(s => s.stationCode === stop.stationCode);
                  const isArrived = log?.arrived;
                  const isNext = idx === nextHaltIndex && !isArrived;
                  
                  const pred = predictions.find(p => p.stationCode === stop.stationCode);
                  const predDelay = pred ? Math.round(pred.predictedDelayMinutes) : (log?.delayMinutes || 0);

                  const schedArrival = log?.scheduledArrival || log?.scheduledDeparture;
                  const predArrival = schedArrival 
                    ? new Date(new Date(schedArrival).getTime() + predDelay * 60000)
                    : null;

                  return (
                    <tr 
                      key={stop.stationCode}
                      className={`hover:bg-[#141f31]/40 transition-colors ${
                        isNext ? 'bg-[#4c9aff]/10 border-l-2 border-[#4c9aff]' : ''
                      }`}
                    >
                      {/* Station Name & Node */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${
                            isArrived ? 'bg-[#2ecc8f]' : isNext ? 'bg-[#4c9aff] animate-ping' : 'bg-[#5b718f]'
                          }`} />
                          <div>
                            <div className="font-bold text-[#e9eff9]">
                              {stop.stationCode}
                            </div>
                            <div className="text-[10px] text-[#8ba0be]">
                              {stop.stationName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3.5 text-center text-[#8ba0be]">
                        {formatTime(schedArrival)}
                      </td>

                      {/* Predicted Time */}
                      <td className="py-3.5 text-center font-bold text-[#e9eff9]">
                        {mode === 'scheduled' 
                          ? formatTime(schedArrival) 
                          : formatTime(predArrival || schedArrival)}
                      </td>

                      {/* Trend Badge */}
                      <td className="py-3.5 text-right pr-3">
                        {isArrived ? (
                          <span className="px-2 py-0.5 rounded bg-[#2ecc8f]/20 text-[#2ecc8f] text-[10px] font-bold">
                            Arrived
                          </span>
                        ) : predDelay > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            predDelay > 10 ? 'bg-[#f5a524]/20 text-[#f5a524]' : 'bg-[#4c9aff]/20 text-[#4c9aff]'
                          }`}>
                            <TrendingUp className="w-3 h-3" />
                            +{predDelay}m
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2ecc8f]/20 text-[#2ecc8f] text-[10px] font-bold">
                            <Minus className="w-3 h-3" />
                            On Time
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Speed Metric Gauge (Matching user reference) */}
          <div className="mt-4 pt-4 border-t border-[#1d2a41] flex flex-wrap items-center justify-between gap-4 bg-[#141f31]/50 p-4 rounded-xl">
            <div className="flex items-center gap-3 font-mono">
              <Gauge className="w-5 h-5 text-[#4c9aff]" />
              <div>
                <div className="text-[10px] text-[#8ba0be] uppercase tracking-wider">CURRENT SPEED / MAX ALLOWED</div>
                <div className="text-base font-bold text-[#e9eff9]">
                  {currentSpeed} km/h <span className="text-[#5b718f] font-normal">/ {maxAllowedSpeed} km/h</span>
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-[#2ecc8f]">
              <span className="px-2.5 py-1 rounded bg-[#2ecc8f]/10 border border-[#2ecc8f]/30 font-bold">
                ✓ Sectional Speed Adherent
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}