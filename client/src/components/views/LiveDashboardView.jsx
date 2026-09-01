import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { fetchTrains, fetchStations, fetchPredictions } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  MapPin, 
  Zap, 
  Clock, 
  Radio, 
  Search, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  Layers
} from 'lucide-react';

const DEFAULT_TRAINS = [
  {
    trainNumber: '22225',
    name: 'Solapur Vande Bharat Express',
    type: 'Semi-high-speed',
    originCode: 'CSMT',
    destinationCode: 'SUR',
    direction: 'UP',
    currentSpeed: 110,
    currentKm: 145,
    totalKm: 455,
    status: 'running',
    schedule: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', kmFromStart: 0, scheduledArrival: '06:05' },
      { stationCode: 'DR', stationName: 'Dadar Central', kmFromStart: 9, scheduledArrival: '06:15' },
      { stationCode: 'TNA', stationName: 'Thane', kmFromStart: 34, scheduledArrival: '06:33' },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', kmFromStart: 54, scheduledArrival: '06:53' },
      { stationCode: 'PUNE', stationName: 'Pune Junction', kmFromStart: 192, scheduledArrival: '09:15' },
      { stationCode: 'KWV', stationName: 'Kurduvadi Junction', kmFromStart: 377, scheduledArrival: '11:30' },
      { stationCode: 'SUR', stationName: 'Solapur Junction', kmFromStart: 455, scheduledArrival: '12:35' }
    ],
    currentRun: {
      status: 'running',
      currentSpeed: 110,
      currentKm: 145,
      nextStationIndex: 4,
      stationLog: [
        { stationCode: 'CSMT', arrived: true, delayMinutes: 0 },
        { stationCode: 'DR', arrived: true, delayMinutes: 0 },
        { stationCode: 'TNA', arrived: true, delayMinutes: 0 },
        { stationCode: 'KYN', arrived: true, delayMinutes: 0 },
        { stationCode: 'PUNE', arrived: false, delayMinutes: 0 },
        { stationCode: 'KWV', arrived: false, delayMinutes: 0 },
        { stationCode: 'SUR', arrived: false, delayMinutes: 0 }
      ]
    }
  },
  {
    trainNumber: '12139',
    name: 'Sevagram Superfast Express',
    type: 'Superfast',
    originCode: 'CSMT',
    destinationCode: 'NGP',
    direction: 'UP',
    currentSpeed: 95,
    currentKm: 280,
    totalKm: 837,
    status: 'running',
    schedule: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', kmFromStart: 0, scheduledArrival: '15:00' },
      { stationCode: 'DR', stationName: 'Dadar Central', kmFromStart: 9, scheduledArrival: '15:12' },
      { stationCode: 'TNA', stationName: 'Thane', kmFromStart: 34, scheduledArrival: '15:33' },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', kmFromStart: 54, scheduledArrival: '15:53' },
      { stationCode: 'NK', stationName: 'Nashik Road', kmFromStart: 188, scheduledArrival: '18:45' },
      { stationCode: 'MMR', stationName: 'Manmad Junction', kmFromStart: 261, scheduledArrival: '19:40' },
      { stationCode: 'BSL', stationName: 'Bhusawal Junction', kmFromStart: 444, scheduledArrival: '22:15' },
      { stationCode: 'AK', stationName: 'Akola Junction', kmFromStart: 583, scheduledArrival: '00:20' },
      { stationCode: 'BD', stationName: 'Badnera (Amravati)', kmFromStart: 662, scheduledArrival: '01:45' },
      { stationCode: 'WR', stationName: 'Wardha Junction', kmFromStart: 757, scheduledArrival: '03:10' },
      { stationCode: 'NGP', stationName: 'Nagpur Junction', kmFromStart: 837, scheduledArrival: '05:45' }
    ]
  }
];

export default function LiveDashboardView({ onNavigateToStation }) {
  const navigate = useNavigate();
  const { simulatedTime, trainsList, connected } = useSocket();
  const [stations, setStations] = useState([]);
  const [localTrains, setLocalTrains] = useState(DEFAULT_TRAINS);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('22225');
  const [predictions, setPredictions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'running', 'vande_bharat'
  const [loading, setLoading] = useState(false);

  const trains = trainsList && trainsList.length > 0 ? trainsList : localTrains;

  // Initial Load of Stations and Trains
  useEffect(() => {
    async function init() {
      try {
        const [stationsData, trainsData] = await Promise.all([
          fetchStations().catch(() => []),
          fetchTrains().catch(() => [])
        ]);
        setStations(stationsData || []);
        if (trainsData && trainsData.length > 0) {
          setLocalTrains(trainsData);
          if (!selectedTrainNumber) {
            setSelectedTrainNumber(trainsData[0].trainNumber);
          }
        }
      } catch (err) {
        console.error('LiveDashboard init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Auto select active running train on socket connection
  useEffect(() => {
    if (trains.length > 0 && !trains.find(t => t.trainNumber === selectedTrainNumber)) {
      const running = trains.find(t => t.currentRun?.status === 'running' || t.currentRun?.status === 'at_station');
      setSelectedTrainNumber(running ? running.trainNumber : trains[0].trainNumber);
    }
  }, [trains, selectedTrainNumber]);

  // Fetch ML predictions for selected train
  useEffect(() => {
    if (!selectedTrainNumber) return;
    async function loadPreds() {
      try {
        const p = await fetchPredictions(selectedTrainNumber);
        setPredictions(p.predictions || []);
      } catch (e) {
        setPredictions([]);
      }
    }
    loadPreds();
  }, [selectedTrainNumber]);

  // Filtered train list
  const filteredTrains = useMemo(() => {
    if (!trains || trains.length === 0) return [];
    return trains.filter(t => {
      const run = t.currentRun || t;
      const matchesSearch = 
        (t.trainNumber && t.trainNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.originCode && t.originCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.destinationCode && t.destinationCode.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (categoryFilter === 'running') {
        return run.status === 'running' || run.status === 'at_station';
      }
      if (categoryFilter === 'vande_bharat') {
        return (t.name && t.name.toLowerCase().includes('vande bharat')) || t.type === 'Semi-high-speed';
      }
      return true;
    });
  }, [trains, searchQuery, categoryFilter]);

  // Selected Train Object with safe fallback
  const currentTrain = useMemo(() => {
    if (!trains || trains.length === 0) return null;
    return trains.find(t => t.trainNumber === selectedTrainNumber) || filteredTrains[0] || trains[0] || null;
  }, [trains, selectedTrainNumber, filteredTrains]);

  const currentRun = currentTrain?.currentRun || currentTrain;
  const schedule = currentTrain?.schedule || currentRun?.stationLog || [];
  const nextHaltIndex = currentRun?.nextStationIndex || 1;
  const nextStop = schedule[nextHaltIndex] || schedule[schedule.length - 1] || null;
  const originStop = schedule[0] || null;
  const destStop = schedule[schedule.length - 1] || null;

  // Station log for next stop
  const nextStopLog = currentRun?.stationLog?.[nextHaltIndex] || null;
  const nextStopPred = predictions.find(p => p.stationCode === nextStop?.stationCode);
  const currentDelay = nextStopLog?.delayMinutes !== undefined ? nextStopLog.delayMinutes : (nextStopPred?.predictedDelayMinutes || 0);

  // Next Halt distance
  const currentKm = currentRun?.currentKm || 0;
  const nextStopKm = nextStop?.kmFromStart || currentKm + 25;
  const distToNext = Math.max(1, Math.round(nextStopKm - currentKm));
  
  // Real dynamic cruising speed
  const maxAllowedSpeed = currentTrain.type === 'Semi-high-speed' ? 130 : 110;
  const baseCruisingSpeed = currentTrain.type === 'Semi-high-speed' ? 112 : 92;
  const currentSpeed = currentRun?.status === 'at_station' 
    ? 0 
    : (currentRun?.currentSpeed && currentRun.currentSpeed > 0 ? Math.round(currentRun.currentSpeed) : baseCruisingSpeed);

  // Confidence calculation
  const confidencePercent = Math.max(88, Math.min(98, Math.round(96 - (currentDelay * 0.4))));

  // Progress percentage
  const totalKm = currentRun?.totalKm || destStop?.kmFromStart || 450;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentKm / totalKm) * 100)));

  // Scheduled and Predicted times for Next Major Station Hero
  const depBaseTime = currentRun?.departureTime || currentTrain?.departureTime || '2026-08-31T06:00:00.000Z';
  const heroScheduledTime = (() => {
    if (nextStopLog?.scheduledArrival) return formatTime(nextStopLog.scheduledArrival);
    if (nextStop?.scheduledArrival) return formatTime(nextStop.scheduledArrival);
    const d = new Date(depBaseTime);
    if (!isNaN(d.getTime())) {
      const offset = nextStop?.arrivalOffset !== null && nextStop?.arrivalOffset !== undefined ? nextStop.arrivalOffset : (nextHaltIndex * 35);
      d.setMinutes(d.getMinutes() + offset);
      return formatTime(d);
    }
    return '07:26';
  })();

  const heroPredictedTime = (() => {
    if (nextStopLog?.actualArrival && isArrived) return formatTime(nextStopLog.actualArrival);
    const d = new Date(depBaseTime);
    if (!isNaN(d.getTime())) {
      const offset = nextStop?.arrivalOffset !== null && nextStop?.arrivalOffset !== undefined ? nextStop.arrivalOffset : (nextHaltIndex * 35);
      d.setMinutes(d.getMinutes() + offset + currentDelay);
      return formatTime(d);
    }
    return heroScheduledTime;
  })();

  if (loading && (!trains || trains.length === 0)) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#4c9aff]/20 border-t-[#4c9aff] animate-spin mb-4" />
        <div className="text-sm font-mono text-[#e9eff9] font-bold">Connecting to RailPulse Real-time Telemetry...</div>
        <div className="text-xs font-mono text-[#8ba0be] mt-1">Loading Maharashtra train corridors & live GPS feeds</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Train Selector Carousel */}
      <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-3 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setCategoryFilter('running')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                categoryFilter === 'running'
                  ? 'bg-[#2ecc8f] text-[#080d16] shadow-[0_0_12px_rgba(46,204,143,0.3)]'
                  : 'bg-[#141f31] text-[#8ba0be] hover:text-[#e9eff9] border border-[#1d2a41]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Live Running ({trains.filter(t => t.currentRun?.status === 'running' || t.currentRun?.status === 'at_station').length})
            </button>

            <button
              onClick={() => setCategoryFilter('vande_bharat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                categoryFilter === 'vande_bharat'
                  ? 'bg-[#4c9aff] text-[#080d16] shadow-[0_0_12px_rgba(76,154,255,0.3)]'
                  : 'bg-[#141f31] text-[#8ba0be] hover:text-[#e9eff9] border border-[#1d2a41]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Vande Bharat
            </button>

            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-[#e9eff9] text-[#080d16]'
                  : 'bg-[#141f31] text-[#8ba0be] hover:text-[#e9eff9] border border-[#1d2a41]'
              }`}
            >
              All Maharashtra Fleet ({trains.length})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5b718f]" />
            <input
              type="text"
              placeholder="Search train / station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141f31] border border-[#1d2a41] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#e9eff9] placeholder-[#5b718f] font-mono outline-none focus:border-[#4c9aff]"
            />
          </div>
        </div>

        {/* Horizontal Train Selection Chips */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {filteredTrains.map(t => {
            const isSel = t.trainNumber === currentTrain?.trainNumber;
            const isRun = t.currentRun?.status === 'running' || t.currentRun?.status === 'at_station';
            const arrs = t.currentRun?.stationLog?.filter(s => s.arrived) || [];
            const d = arrs.length > 0 ? arrs[arrs.length - 1].delayMinutes : 0;

            return (
              <button
                key={t.trainNumber}
                onClick={() => setSelectedTrainNumber(t.trainNumber)}
                className={`px-3 py-2 rounded-xl text-left font-mono transition-all shrink-0 min-w-[170px] border ${
                  isSel
                    ? 'bg-[#141f31] border-[#4c9aff] shadow-[0_0_15px_rgba(76,154,255,0.15)] ring-1 ring-[#4c9aff]'
                    : 'bg-[#080d16] border-[#1d2a41] hover:border-[#4c9aff]/50 text-[#8ba0be]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#4c9aff]">#{t.trainNumber}</span>
                  {isRun && (
                    <span className="flex items-center gap-1 text-[10px] text-[#2ecc8f] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ecc8f] animate-ping" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-[#e9eff9] truncate">{t.name}</div>
                <div className="flex items-center justify-between text-[10px] text-[#5b718f] mt-1">
                  <span>{t.originCode || 'CSMT'} → {t.destinationCode || 'SUR'}</span>
                  <span className={d > 10 ? 'text-[#f5a524]' : 'text-[#2ecc8f]'}>
                    {d > 0 ? `+${d}m` : 'On Time'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {currentTrain && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Live Status & Metrics (Matching Mockup Left Column) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* 1. Delay / Status Alert Banner */}
            <div className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
              currentDelay > 5
                ? 'bg-[#f5a524]/10 border-[#f5a524]/30 text-[#f5a524]'
                : 'bg-[#2ecc8f]/10 border-[#2ecc8f]/30 text-[#2ecc8f]'
            }`}>
              <div className="flex items-center gap-2.5">
                {currentDelay > 5 ? (
                  <AlertTriangle className="w-4 h-4 text-[#f5a524] shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#2ecc8f] shrink-0" />
                )}
                <div>
                  <div className="font-bold">
                    {currentDelay > 5 ? 'Minor Delay Detected' : 'Nominal Track Clearance'}
                  </div>
                  <div className="text-[11px] text-[#8ba0be] mt-0.5">
                    {currentDelay > 5 
                      ? 'Speed restriction near ghat approach / loop line regulation'
                      : 'Unrestricted signal aspect (110–130 km/h green track block)'}
                  </div>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded font-bold text-xs shrink-0 ${
                currentDelay > 5 ? 'bg-[#f5a524] text-[#080d16]' : 'bg-[#2ecc8f] text-[#080d16]'
              }`}>
                {currentDelay > 0 ? `DELAYED ${currentDelay}M` : 'ON TIME'}
              </div>
            </div>

            {/* 2. Hero: NEXT MAJOR STATION Card */}
            <div className="bg-[#0e1725] border border-[#1d2a41] rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono tracking-widest text-[#8ba0be] uppercase">
                  NEXT MAJOR STATION
                </span>
                <span className="text-xs font-mono text-[#4c9aff] bg-[#141f31] px-2.5 py-0.5 rounded-full border border-[#1d2a41]">
                  AI Dynamic Forecast
                </span>
              </div>

              <h2 className="text-3xl font-extrabold text-[#e9eff9] font-sans tracking-tight">
                {nextStop?.stationName || 'Next Station'}
              </h2>

              {/* Dynamic ETA */}
              <div className="flex items-baseline gap-2 mt-2 font-mono">
                <Clock className="w-4 h-4 text-[#4c9aff] self-center" />
                <span className="text-lg font-bold text-[#e9eff9]">
                  ETA {heroPredictedTime}
                </span>
                <span className="text-xs text-[#8ba0be]">
                  (Originally {heroScheduledTime})
                </span>
              </div>

              {/* Train Identifier */}
              <div className="mt-4 pt-3 border-t border-[#1d2a41] flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-[10px] text-[#5b718f] uppercase">TRAIN</div>
                  <div className="font-bold text-[#e9eff9]">{currentTrain.name} (#{currentTrain.trainNumber})</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#5b718f] uppercase">ROUTE</div>
                  <div className="text-[#8ba0be]">{currentTrain.originCode || 'CSMT'} → {currentTrain.destinationCode || 'SUR'}</div>
                </div>
              </div>

              {/* Route Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-[#8ba0be]">
                  <span>{originStop?.stationName || currentTrain.originCode}</span>
                  <span className="font-bold text-[#4c9aff]">{progressPercent}% Journey</span>
                  <span>{destStop?.stationName || currentTrain.destinationCode}</span>
                </div>
                <div className="h-2 bg-[#141f31] rounded-full overflow-hidden p-0.5 border border-[#1d2a41]">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4c9aff] via-[#2ecc8f] to-[#f5a524] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(76,154,255,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3. 3-Card Telemetry Grid (Speed, Distance, ML Accuracy) */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* CURRENT SPEED */}
              <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-3.5 shadow-md">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#8ba0be]">
                  <Gauge className="w-3.5 h-3.5 text-[#4c9aff]" />
                  <span>SPEED</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#e9eff9] mt-1">
                  {currentSpeed} <span className="text-xs text-[#5b718f] font-normal">km/h</span>
                </div>
                <div className="text-[10px] font-mono text-[#2ecc8f] mt-0.5">
                  Max: {currentTrain.type === 'Semi-high-speed' ? '130' : '110'} km/h
                </div>
              </div>

              {/* NEXT HALT DISTANCE */}
              <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-3.5 shadow-md">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#8ba0be]">
                  <MapPin className="w-3.5 h-3.5 text-[#f5a524]" />
                  <span>NEXT HALT</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#e9eff9] mt-1">
                  {distToNext} <span className="text-xs text-[#5b718f] font-normal">km</span>
                </div>
                <div className="text-[10px] font-mono text-[#8ba0be] mt-0.5 truncate">
                  To {nextStop?.stationCode || 'SUR'}
                </div>
              </div>

              {/* ML PREDICTION CONFIDENCE */}
              <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-3.5 shadow-md">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#8ba0be]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2ecc8f]" />
                  <span>ML CONF.</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#e9eff9] mt-1">
                  {confidencePercent}%
                </div>
                <div className="text-[10px] font-mono text-[#2ecc8f] mt-0.5">
                  High Precision
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Route Stoppages & Dynamic ETAs Card */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="bg-[#0e1725] border border-[#1d2a41] rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between space-y-4">
              
              <div className="flex items-center justify-between border-b border-[#1d2a41] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#e9eff9] font-sans flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#4c9aff]" />
                    <span>Route Stoppages & Dynamic ETAs</span>
                  </h3>
                  <div className="text-[11px] text-[#8ba0be] font-mono mt-0.5">
                    Live progression along #{currentTrain.trainNumber} ({currentTrain.name})
                  </div>
                </div>

                <button
                  onClick={() => navigate('/map')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141f31] hover:bg-[#1d2a41] border border-[#4c9aff]/40 text-[#4c9aff] hover:text-[#e9eff9] text-xs font-mono transition-all cursor-pointer shadow-sm"
                >
                  <span>🗺️ View Route Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Station Stoppages Progression List */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {currentTrain.schedule?.map((stop, idx) => {
                  const isArrived = idx < nextHaltIndex;
                  const isCurrentNext = idx === nextHaltIndex;
                  const logEntry = currentRun?.stationLog?.[idx];

                  // Scheduled Arrival Time
                  const schedTime = (() => {
                    if (logEntry?.scheduledArrival) return formatTime(logEntry.scheduledArrival);
                    if (stop.scheduledArrival) return formatTime(stop.scheduledArrival);
                    const d = new Date(depBaseTime);
                    if (!isNaN(d.getTime())) {
                      const offset = stop.arrivalOffset !== null && stop.arrivalOffset !== undefined ? stop.arrivalOffset : (stop.departureOffset || idx * 35);
                      d.setMinutes(d.getMinutes() + offset);
                      return formatTime(d);
                    }
                    return '06:00';
                  })();

                  // Predicted Arrival Time
                  const predTime = (() => {
                    if (logEntry?.actualArrival && isArrived) return formatTime(logEntry.actualArrival);
                    const d = new Date(depBaseTime);
                    if (!isNaN(d.getTime())) {
                      const offset = stop.arrivalOffset !== null && stop.arrivalOffset !== undefined ? stop.arrivalOffset : (stop.departureOffset || idx * 35);
                      const stopDelay = logEntry?.delayMinutes !== undefined ? logEntry.delayMinutes : (isArrived ? 0 : currentDelay);
                      d.setMinutes(d.getMinutes() + offset + stopDelay);
                      return formatTime(d);
                    }
                    return schedTime;
                  })();

                  return (
                    <div 
                      key={stop.stationCode + idx}
                      onClick={() => onNavigateToStation(stop.stationCode)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-mono ${
                        isCurrentNext 
                          ? 'bg-[#141f31] border-[#4c9aff] shadow-[0_0_10px_rgba(76,154,255,0.2)]'
                          : isArrived 
                            ? 'bg-[#0b131f]/70 border-[#1d2a41]/60 opacity-80'
                            : 'bg-[#0e1725] border-[#1d2a41] hover:border-[#4c9aff]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isArrived ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#2ecc8f] shrink-0" />
                        ) : isCurrentNext ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f5a524] shrink-0 animate-ping" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full border border-[#8ba0be] bg-transparent shrink-0" />
                        )}
                        <div>
                          <div className={`text-xs ${isCurrentNext ? 'font-bold text-[#e9eff9]' : isArrived ? 'text-[#8ba0be]' : 'text-[#e9eff9]'}`}>
                            {stop.stationName || stop.stationCode} ({stop.stationCode})
                          </div>
                          <div className="text-[10px] text-[#5b718f]">
                            {stop.kmFromStart || (idx * 45)} km from origin
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-bold ${isCurrentNext ? 'text-[#f5a524]' : 'text-[#e9eff9]'}`}>
                          {predTime}
                        </div>
                        <div className="text-[10px] text-[#5b718f]">
                          Sch: {schedTime}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Hubs Bar */}
              <div className="pt-3 border-t border-[#1d2a41] flex items-center justify-between text-[11px] font-mono text-[#8ba0be]">
                <span>Status: <strong className="text-[#2ecc8f]">Active Monitored Corridor</strong></span>
                <span className="text-[#4c9aff]">Click any stop to open station board →</span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}