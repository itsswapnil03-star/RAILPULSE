import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  GitCommit, 
  TrendingUp, 
  Clock, 
  Radio, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { fetchWhatIfPrediction } from '../../services/api';
import { formatTime } from '../../utils/formatTime';

export default function WhatIfPanel({ selectedTrain, stations = [] }) {
  const [injectionStationCode, setInjectionStationCode] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [crossTrainCongestion, setCrossTrainCongestion] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState('clear');
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const stationsMap = useMemo(() => {
    return new Map(stations.map(s => [s.code, s]));
  }, [stations]);

  // Extract stops for currently selected train
  const scheduleStops = useMemo(() => {
    if (!selectedTrain) return [];
    const run = selectedTrain.currentRun || selectedTrain;
    const log = run.stationLog || selectedTrain.schedule || [];
    return log.map((s, idx) => {
      const stObj = stationsMap.get(s.stationCode);
      return {
        station_code: s.stationCode,
        station_name: stObj?.name || s.stationName || s.stationCode,
        km_from_origin: s.kmFromStart || (idx * 45),
        scheduled_arrival: s.scheduledArrival || '08:00',
        scheduled_hour: s.scheduledArrival ? parseInt(s.scheduledArrival.split(':')[0]) : 8,
        stop_duration: s.stopDuration || 2,
        current_delay: s.delayMinutes || 0
      };
    });
  }, [selectedTrain, stationsMap]);

  // Set default injection station to the first upcoming stop
  useEffect(() => {
    if (scheduleStops.length > 0) {
      const defaultSt = scheduleStops[Math.min(1, scheduleStops.length - 1)];
      setInjectionStationCode(defaultSt.station_code);
    }
  }, [selectedTrain?.trainNumber, scheduleStops.length]);

  const handleRunSimulation = async () => {
    if (!selectedTrain || scheduleStops.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        train_number: selectedTrain.trainNumber,
        train_type: selectedTrain.type || 'Superfast',
        injection_station_code: injectionStationCode || scheduleStops[0]?.station_code,
        delay_override_minutes: Number(delayMinutes),
        cross_train_congestion: crossTrainCongestion,
        cross_train_delay_minutes: 14.0,
        weather_condition: weatherCondition,
        stations: scheduleStops
      };

      const result = await fetchWhatIfPrediction(payload);
      setSimulationResult(result);
    } catch (err) {
      console.error('Failed to run what-if simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run simulation on mount or train change
  useEffect(() => {
    if (scheduleStops.length > 0) {
      handleRunSimulation();
    }
  }, [selectedTrain?.trainNumber, injectionStationCode, delayMinutes, crossTrainCongestion]);

  const chartData = useMemo(() => {
    if (!simulationResult || !simulationResult.results) return [];
    return simulationResult.results.map(r => ({
      station: r.station_code,
      name: r.station_name,
      baselineDelay: r.baseline_delay,
      simulatedDelay: r.simulated_delay,
      delta: r.delta_minutes,
      lowerBound: r.confidence_lower,
      upperBound: r.confidence_upper,
      isInj: r.is_injection_point
    }));
  }, [simulationResult]);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden font-sans">
      
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] bg-gradient-to-r from-slate-900 to-[#006591] text-white flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Cascading Delay "What-If" Sandbox</h3>
              <span className="bg-[#38bdf8]/20 text-[#38bdf8] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#38bdf8]/30">
                AI Predictive Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate hypothetical disruptions and model cross-train shared block cascading delays
            </p>
          </div>
        </div>

        {selectedTrain && (
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-mono flex items-center gap-2">
            <span className="text-[#38bdf8] font-bold">#{selectedTrain.trainNumber}</span>
            <span>{selectedTrain.name}</span>
          </div>
        )}
      </div>

      {/* Control Panel Parameters */}
      <div className="p-6 bg-[#f7f9fb] border-b border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        {/* 1. Injection Point Station Selector */}
        <div className="space-y-1.5">
          <label className="font-bold text-[#0F172A] flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-[#006591]" />
            Disruption Origin Halt
          </label>
          <select
            value={injectionStationCode}
            onChange={(e) => setInjectionStationCode(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
          >
            {scheduleStops.map((st, idx) => (
              <option key={st.station_code} value={st.station_code}>
                {idx + 1}. {st.station_name} ({st.station_code}) · {st.km_from_origin} km
              </option>
            ))}
          </select>
        </div>

        {/* 2. Injected Delay Duration Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#EF4444]" />
              Injected Delay Duration
            </label>
            <span className="font-mono font-bold text-xs bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded border border-[#EF4444]/20">
              +{delayMinutes} min
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(Number(e.target.value))}
            className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#006591]"
          />
          <div className="flex justify-between gap-1 pt-0.5">
            {[15, 30, 45, 60, 90].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setDelayMinutes(m)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                  delayMinutes === m 
                    ? 'bg-[#006591] text-white shadow-xs' 
                    : 'bg-white border border-[#E2E8F0] text-[#505f76] hover:bg-[#E2E8F0]'
                }`}
              >
                +{m}m
              </button>
            ))}
          </div>
        </div>

        {/* 3. Cross-Train Precedence & Block Section Conflict */}
        <div className="space-y-1.5">
          <label className="font-bold text-[#0F172A] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
            Shared Block Occupancy
          </label>
          <div 
            onClick={() => setCrossTrainCongestion(!crossTrainCongestion)}
            className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
              crossTrainCongestion 
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#B45309]' 
                : 'bg-white border-[#E2E8F0] text-[#505f76]'
            }`}
          >
            <div>
              <div className="font-bold text-xs text-[#0F172A]">Cross-Train Propagation</div>
              <div className="text-[10px] text-[#505f76] mt-0.5">
                {crossTrainCongestion ? 'Shared signal block conflict active (+14m)' : 'Single train isolated run'}
              </div>
            </div>
            <div className={`w-5 h-5 rounded flex items-center justify-center border ${
              crossTrainCongestion ? 'bg-[#F59E0B] border-[#F59E0B] text-white' : 'border-[#CBD5E1] bg-white'
            }`}>
              {crossTrainCongestion && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* 4. Action Trigger Button */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#006591] hover:bg-[#0ea5e9] text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
            )}
            <span>Re-compute AI Cascade</span>
          </button>
        </div>

      </div>

      {/* Simulation Insights & Results */}
      {simulationResult && (
        <div className="p-6 space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#505f76] uppercase">Injection Point</span>
              <div className="font-bold text-[#0F172A] text-sm mt-0.5">{simulationResult.injection_station_code}</div>
              <div className="text-[10px] text-[#EF4444] font-bold">+{simulationResult.delay_override_minutes} min initial</div>
            </div>

            <div className="p-3 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#505f76] uppercase">Terminal ETA Drift</span>
              <div className="font-bold text-[#006591] text-sm mt-0.5">
                +{simulationResult.cascaded_terminal_delay} min
              </div>
              <div className="text-[10px] text-[#505f76]">At Destination Terminus</div>
            </div>

            <div className="p-3 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#505f76] uppercase">Downstream Halts Affected</span>
              <div className="font-bold text-[#0F172A] text-sm mt-0.5">{simulationResult.total_downstream_stations} Stations</div>
              <div className="text-[10px] text-[#10B981] font-bold">Recovery Margins Factored</div>
            </div>

            <div className="p-3 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#505f76] uppercase">Cross-Train Impact</span>
              <div className={`font-bold text-sm mt-0.5 ${simulationResult.cross_train_congestion ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                {simulationResult.cross_train_congestion ? 'Cascading Active' : 'Isolated Run'}
              </div>
              <div className="text-[10px] text-[#505f76]">Block Line Precedence</div>
            </div>
          </div>

          {/* Recharts Cascading Delay Propagation Curve */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#fcfdfe]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#006591]" />
                <h4 className="font-bold text-xs text-[#0F172A]">Downstream ETA & Delay Propagation Curve</h4>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-sans">
                <span className="flex items-center gap-1 text-[#64748B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" /> Baseline Delay
                </span>
                <span className="flex items-center gap-1 text-[#EF4444] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> What-If Simulated Delay
                </span>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="baseColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="station" tick={{ fontSize: 10, fill: '#505f76' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#505f76' }} axisLine={false} tickLine={false} unit="m" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1d2a41', borderRadius: '8px', color: '#ffffff', fontSize: '11px' }}
                    formatter={(val, name) => [`${val} min`, name === 'simulatedDelay' ? 'What-If Delay' : 'Baseline Delay']}
                  />
                  <Area type="monotone" dataKey="simulatedDelay" stroke="#EF4444" strokeWidth={2.5} fill="url(#simColor)" />
                  <Area type="monotone" dataKey="baselineDelay" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#baseColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Station Cascade Comparison Table */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f9fb] border-b border-[#E2E8F0] text-[#505f76] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Station / Halt</th>
                    <th className="py-2.5 px-3">Scheduled Time</th>
                    <th className="py-2.5 px-3">Baseline ETA</th>
                    <th className="py-2.5 px-3 bg-[#EF4444]/5 text-[#EF4444]">What-If Simulated ETA</th>
                    <th className="py-2.5 px-3">Net Drift (Delta)</th>
                    <th className="py-2.5 px-3">90% AI Confidence</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {simulationResult.results.map((r, idx) => (
                    <tr 
                      key={r.station_code}
                      className={r.is_injection_point ? 'bg-[#EF4444]/10 font-semibold' : 'hover:bg-[#f7f9fb]'}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span className="font-bold text-[#006591] font-mono">{r.station_code}</span>
                        <span className="text-[#0F172A] truncate max-w-[150px]">{r.station_name}</span>
                        {r.is_injection_point && (
                          <span className="bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                            ORIGIN INJECTION
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#505f76]">{r.scheduled_time}</td>
                      <td className="py-2.5 px-3 font-mono text-[#505f76]">
                        {r.baseline_eta} <span className="text-[10px]">({r.baseline_delay > 0 ? `+${r.baseline_delay}m` : '0m'})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold bg-[#EF4444]/5 text-[#EF4444]">
                        {r.simulated_eta} <span className="text-[10px]">({r.simulated_delay > 0 ? `+${r.simulated_delay}m` : '0m'})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        {r.delta_minutes > 0 ? (
                          <span className="text-[#EF4444]">+{r.delta_minutes} min</span>
                        ) : (
                          <span className="text-[#10B981]">0 min</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#505f76] text-[11px]">
                        [{r.confidence_lower}m – {r.confidence_upper}m]
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {r.is_injection_point ? (
                          <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/15 px-2 py-0.5 rounded">
                            Disrupted
                          </span>
                        ) : r.delta_minutes > 0 ? (
                          <span className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded">
                            Cascaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">
                            Nominal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
