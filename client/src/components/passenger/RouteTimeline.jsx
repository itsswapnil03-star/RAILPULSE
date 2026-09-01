import React from 'react';
import { formatTime } from '../../utils/formatTime';
import { Check, Clock, Navigation } from 'lucide-react';

export default function RouteTimeline({ trainData, predictions }) {
  if (!trainData) return null;
  const run = trainData.currentRun || trainData;
  if (!run || !run.stationLog) return null;
  const { stationLog, nextStationIndex } = run;

  return (
    <div className="relative flow-root max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
      <ul role="list" className="-mb-8">
        {stationLog.map((log, idx) => {
          const isLast = idx === stationLog.length - 1;
          const isArrived = log.arrived;
          const isNext = idx === nextStationIndex && !isArrived;
          const isPast = isArrived;
          
          let prediction = null;
          if (Array.isArray(predictions)) {
             prediction = predictions.find(p => p.stationCode === log.stationCode);
          } else if (predictions && Array.isArray(predictions.predictions)) {
             prediction = predictions.predictions.find(p => p.stationCode === log.stationCode);
          }

          let etaStr = null;
          let marginStr = null;
          let delayVal = log.delayMinutes || 0;

          if (!isArrived && log.scheduledArrival) {
            const schedTime = new Date(log.scheduledArrival).getTime();
            const predDelay = prediction ? prediction.predictedDelayMinutes : (log.predictedDelayMinutes || 0);
            const predictedTime = new Date(schedTime + predDelay * 60000);
            etaStr = formatTime(predictedTime);
            delayVal = predDelay;
            const margin = prediction ? Math.round(prediction.confidenceUpper - prediction.predictedDelayMinutes) : 4;
            marginStr = `±${Math.max(2, margin)}m`;
          }

          return (
            <li key={log.stationCode}>
              {/* If train is currently running between the previous station and this next station, render moving train card */}
              {isNext && run.status === 'running' && (
                <div className="ml-14 my-2 p-2.5 rounded-lg bg-[#141f31] border border-[#4c9aff]/40 flex items-center justify-between shadow-[0_0_15px_rgba(76,154,255,0.15)] animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#4c9aff] flex items-center justify-center text-[#080d16] font-bold text-xs">
                      🚄
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#e9eff9] font-mono">
                        Train En Route to {log.stationName}
                      </div>
                      <div className="text-[10px] text-[#8ba0be] font-mono">
                        Speed: {Math.round(run.currentSpeed || 80)} km/h · Distance: {Math.round(run.currentKm || 0)} km
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#2ecc8f]/20 text-[#2ecc8f] font-mono font-bold">
                      LIVE TRACKING
                    </span>
                  </div>
                </div>
              )}

              <div className="relative pb-7">
                {!isLast && (
                  <span
                    className={`absolute left-[54px] top-4 -ml-px h-full w-0.5 ${
                      isPast ? 'bg-[#2ecc8f]' : isNext ? 'bg-gradient-to-b from-[#2ecc8f] to-[#4c9aff]' : 'bg-[#1d2a41]'
                    }`}
                    aria-hidden="true"
                  />
                )}
                
                <div className={`relative flex items-center justify-between gap-4 p-2 rounded-lg transition-all ${isNext ? 'bg-[#141f31]/40 border border-[#4c9aff]/20' : ''}`}>
                  
                  {/* Left: Time & Node */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    {/* Scheduled Time */}
                    <span className="w-10 text-right text-xs font-mono text-[#5b718f]">
                      {formatTime(log.scheduledArrival || log.scheduledDeparture)}
                    </span>

                    {/* Step Icon */}
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isArrived 
                          ? 'bg-[#2ecc8f] border-[#2ecc8f] text-[#080d16]' 
                          : isNext 
                          ? 'bg-[#4c9aff] border-[#4c9aff] text-[#080d16] animate-bounce' 
                          : 'bg-[#080d16] border-[#1d2a41] text-[#5b718f]'
                      }`}
                    >
                      {isArrived ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isNext ? (
                        <Navigation className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1d2a41]" />
                      )}
                    </div>

                    {/* Station Name & Code */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${isPast || isNext ? 'text-[#e9eff9]' : 'text-[#8ba0be]'}`}>
                          {log.stationName}
                        </span>
                        <span className="text-xs font-mono text-[#5b718f]">({log.stationCode})</span>
                      </div>
                      <div className="text-[10px] text-[#5b718f] font-mono">
                        PF {((idx % 4) + 1)} · Halt: {log.stopDuration || 2}m
                      </div>
                    </div>
                  </div>

                  {/* Right: Live ETA / Actual Arrival Status */}
                  <div className="text-right flex items-center gap-3 font-mono">
                    {isArrived ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8ba0be]">
                          Dep {formatTime(log.actualArrival || log.actualDeparture)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          log.delayMinutes > 15 ? 'bg-[#f0576f]/20 text-[#f0576f]' : log.delayMinutes > 5 ? 'bg-[#f5a524]/20 text-[#f5a524]' : 'bg-[#2ecc8f]/20 text-[#2ecc8f]'
                        }`}>
                          {log.delayMinutes > 0 ? `+${log.delayMinutes}m` : 'On Time'}
                        </span>
                      </div>
                    ) : etaStr ? (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#e9eff9]">ETA {etaStr}</div>
                          <div className="text-[10px] text-[#8ba0be]">{marginStr}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          delayVal > 15 ? 'bg-[#f0576f]/20 text-[#f0576f]' : delayVal > 5 ? 'bg-[#f5a524]/20 text-[#f5a524]' : 'bg-[#2ecc8f]/20 text-[#2ecc8f]'
                        }`}>
                          {delayVal > 0 ? `+${Math.round(delayVal)}m` : 'On Time'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#5b718f]">
                        Sched {formatTime(log.scheduledArrival || log.scheduledDeparture)}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
