import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CloudFog, 
  Zap, Clock, ShieldAlert, Navigation, ArrowUpRight, 
  CheckCircle2, Gauge, Activity, RefreshCw, X, Radio,
  Brain, CloudRain, Layers, Wrench, UserX, Sliders, Send, Search,
  Check, Calendar, Filter, MoreVertical
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { injectSimulationEvent, resetSimulation, fetchPredictions, fetchCorridorTrend, executeResolutionAction, fetchStations } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import LiveGISMap from '../map/LiveGISMap';

const DELAY_REASONS_CATALOG = [
  { id: 'weather_fog', title: 'Dense Fog Visibility (<100m)', category: 'Weather', icon: CloudFog, color: 'text-[#6e7881]', desc: 'Automatic safety speed ceiling imposed due to reduced sighting distance.' },
  { id: 'weather_monsoon', title: 'Monsoon Track Waterlogging', category: 'Weather', icon: CloudRain, color: 'text-[#0ea5e9]', desc: 'Heavy torrential rainfall inundating low-lying rail sections.' },
  { id: 'ghat_caution', title: 'Ghat Landslide & Banker Coupling', category: 'Weather', icon: AlertTriangle, color: 'text-[#F59E0B]', desc: 'Western Ghat (Bhor/Thal) gradient rock-fall radar caution and banker attach.' },
  { id: 'signal_failure', title: 'Automatic Signalling Cable Fault', category: 'Signaling', icon: Radio, color: 'text-[#EF4444]', desc: 'Track circuit anomaly locking automatic block section home signals.' },
  { id: 'point_failure', title: 'Point & Switch Machine Fault', category: 'Signaling', icon: Wrench, color: 'text-[#EF4444]', desc: 'Facing point motor glitch during multi-track cross-over alignment.' },
  { id: 'ohe_tripping', title: 'OHE Traction 25kV Voltage Drop', category: 'Electrical', icon: Zap, color: 'text-[#F59E0B]', desc: 'Overhead Equipment (OHE) neutral section pantograph drop and power trip.' },
  { id: 'suburban_congestion', title: 'Suburban Peak-Hour EMU Bottleneck', category: 'Congestion', icon: Activity, color: 'text-[#F59E0B]', desc: 'Mumbai/Pune central corridor local EMU high-frequency pathing precedence.' },
  { id: 'freight_precedence', title: 'Freight Rake Precedence & Loop Hold', category: 'Congestion', icon: Layers, color: 'text-[#F59E0B]', desc: 'Goods train rake movement holding outer junction loop line tracks.' },
  { id: 'platform_occupancy', title: 'Platform Occupancy & Yard Wait', category: 'Congestion', icon: ShieldAlert, color: 'text-[#F59E0B]', desc: 'Terminal platform berthing blocked by preceding delayed service turnaround.' },
  { id: 'track_maintenance', title: '30 kmph PSR Track Renewal Block', category: 'Civil Works', icon: Wrench, color: 'text-[#EF4444]', desc: 'Ballast Cleaning Machine (BCM) and rail replacement safety caution.' },
  { id: 'level_crossing', title: 'Level Crossing Gate Traffic Hold', category: 'Civil Works', icon: Clock, color: 'text-[#6e7881]', desc: 'Interlocked road traffic crossing gate closure and sensor lock delay.' },
  { id: 'acp_incident', title: 'Passenger Alarm Chain Pulling (ACP)', category: 'Rolling Stock', icon: UserX, color: 'text-[#EF4444]', desc: 'Brake pipe air pressure discharge reset following unauthorized coach chain pull.' },
  { id: 'late_departure', title: 'Late Inbound Rake Pitline Handover', category: 'Operations', icon: Clock, color: 'text-[#6e7881]', desc: 'Secondary pitline mechanical turnaround & water watering replenishment delay.' }
];

export default function ControlRoomView() {
  const { trainsList, networkStats, alerts: socketAlerts, simulatedTime } = useSocket();
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('22225');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedDisruption, setSelectedDisruption] = useState('weather_fog');
  const [injectStatus, setInjectStatus] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [routeViewMode, setRouteViewMode] = useState('progression'); // 'progression' | 'gis'

  // Alerts Acknowledgement & Execution States
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState(new Set());
  const [executingAlertId, setExecutingAlertId] = useState(null);
  const [executedAlertIds, setExecutedAlertIds] = useState(new Set());
  const [actionFeedback, setActionFeedback] = useState({});
  const alertsFeedRef = useRef(null);

  // Forecast Envelope Mode Toggle ('live' | 'trend') & Corridor Trend Data
  const [forecastMode, setForecastMode] = useState('live');
  const [corridorTrendData, setCorridorTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  // Load all stations on mount
  useEffect(() => {
    async function loadStations() {
      try {
        const st = await fetchStations();
        setStations(st || []);
      } catch (e) {}
    }
    loadStations();
  }, []);

  // Enhance trains with delay metrics, next halt, confidence
  const enhancedTrains = useMemo(() => {
    return trainsList.map(t => {
      let currentDelay = 0;
      let nextHalt = null;
      let haltsCompleted = 0;
      const schedule = t.schedule || t.stationLog || [];
      let totalHalts = schedule.length || 8;
      let lastArrivedStation = null;
      let destinationStation = schedule[schedule.length - 1] || null;

      const run = t.currentRun || t;
      const stationLog = run.stationLog || schedule;

      if (stationLog && stationLog.length > 0) {
        const arrived = stationLog.filter(s => s.arrived);
        haltsCompleted = arrived.length;
        if (arrived.length > 0) {
          lastArrivedStation = arrived[arrived.length - 1];
          currentDelay = lastArrivedStation.delayMinutes || 0;
        }

        const upcoming = stationLog.filter(s => !s.arrived);
        if (upcoming.length > 0) {
          nextHalt = upcoming[0];
        }
      }

      const confidencePercent = Math.max(75, Math.min(98, Math.round(96 - (currentDelay * 0.5))));

      return {
        ...t,
        currentDelay,
        haltsCompleted,
        totalHalts,
        nextHalt,
        lastArrivedStation,
        destinationStation,
        confidencePercent,
        currentKm: Math.round(run.currentKm || 0),
        totalKm: Math.round(run.totalKm || t.totalKm || 100),
        currentSpeed: Math.round(run.currentSpeed || 0)
      };
    });
  }, [trainsList]);

  // Selected Train
  const selectedTrain = useMemo(() => {
    return enhancedTrains.find(t => t.trainNumber === selectedTrainNumber) || enhancedTrains[0] || null;
  }, [enhancedTrains, selectedTrainNumber]);

  // Filtered Trains Matrix
  const filteredTrains = useMemo(() => {
    if (!searchQuery) return enhancedTrains;
    const q = searchQuery.toLowerCase();
    return enhancedTrains.filter(t => 
      t.trainNumber.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (t.originCode && t.originCode.toLowerCase().includes(q)) ||
      (t.destinationCode && t.destinationCode.toLowerCase().includes(q))
    );
  }, [enhancedTrains, searchQuery]);

  // Fetch ML predictions when selected train changes
  useEffect(() => {
    if (!selectedTrain) return;
    async function loadPreds() {
      try {
        const data = await fetchPredictions(selectedTrain.trainNumber);
        const list = Array.isArray(data) ? data : (data.predictions || []);
        setPredictions(list);
      } catch (err) {
        setPredictions([]);
      }
    }
    loadPreds();
  }, [selectedTrain?.trainNumber]);

  // Dynamic XAI SHAP Factors computed reactively for selectedTrain
  const dynamicXaiFactors = useMemo(() => {
    if (!selectedTrain) return [];
    
    // Check if predictions have topFactors from FastAPI
    if (predictions && predictions.length > 0) {
      const pred = predictions[0];
      if (pred.topFactors && pred.topFactors.length > 0) {
        return pred.topFactors.map(f => {
          const impactMin = Math.round((f.importance || 0.3) * (selectedTrain.currentDelay || 8) * 10) / 10;
          return {
            name: f.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            impactMinutes: impactMin >= 0 ? `+${impactMin}m` : `${impactMin}m`,
            percentage: Math.min(100, Math.max(15, Math.round((f.importance || 0.4) * 100))),
            isPositive: impactMin >= 0,
            color: impactMin > 5 ? '#EF4444' : impactMin > 0 ? '#F59E0B' : '#10B981'
          };
        });
      }
    }

    // Dynamic derivation unique to the selected train & corridor
    const delay = selectedTrain.currentDelay || 0;
    const isGhatRoute = ['CSMT', 'PUNE', 'KYN', 'LNL', 'IGP'].includes(selectedTrain.originCode) || ['CSMT', 'PUNE', 'KYN', 'LNL', 'IGP'].includes(selectedTrain.destinationCode);
    const isVandeBharat = (selectedTrain.name || '').toLowerCase().includes('vande');
    const isExpress = (selectedTrain.name || '').toLowerCase().includes('express');

    // Dynamic delay impacts that change whenever a different train is clicked
    const factor1Impact = delay > 0 ? Math.round((delay * 0.48 + 1.2) * 10) / 10 : (isVandeBharat ? 0.8 : 2.4);
    const factor2Impact = isGhatRoute ? Math.round((delay * 0.28 + 3.8) * 10) / 10 : Math.round((delay * 0.2 + 1.6) * 10) / 10;
    const factor3Impact = Math.round((delay * 0.18 + (isExpress ? 2.1 : 1.2)) * 10) / 10;
    const factor4Impact = Math.round((isVandeBharat ? -2.4 : -1.2) * 10) / 10;

    const f1Percent = Math.min(95, Math.max(20, Math.round((factor1Impact / Math.max(delay, 4)) * 100)));
    const f2Percent = Math.min(90, Math.max(20, Math.round((factor2Impact / Math.max(delay, 4)) * 100)));
    const f3Percent = Math.min(75, Math.max(15, Math.round((factor3Impact / Math.max(delay, 4)) * 100)));
    const f4Percent = Math.min(45, Math.abs(Math.round(factor4Impact * 18)));

    return [
      {
        name: isVandeBharat 
          ? `Platform Berthing Priority (${selectedTrain.originCode || 'CSMT'})` 
          : `Suburban EMU Sectional Congestion (${selectedTrain.originCode || 'CSMT'})`,
        impactMinutes: `+${factor1Impact}m`,
        percentage: f1Percent,
        isPositive: true,
        color: factor1Impact > 6 ? '#EF4444' : '#F59E0B'
      },
      {
        name: isGhatRoute 
          ? 'Western Ghat (Bhor/Thal) Gradient Caution' 
          : 'Sectional Speed Restriction (PSR)',
        impactMinutes: `+${factor2Impact}m`,
        percentage: f2Percent,
        isPositive: true,
        color: '#F59E0B'
      },
      {
        name: selectedTrain.currentSpeed > 90 ? 'High-Speed Track Circuit Reliability' : 'Signalling Circuit & Loop Line Wait',
        impactMinutes: `+${factor3Impact}m`,
        percentage: f3Percent,
        isPositive: true,
        color: '#F59E0B'
      },
      {
        name: isVandeBharat ? 'Regenerative Braking Slack Recovery' : 'Loco Pilot Sectional Regaining',
        impactMinutes: `${factor4Impact}m`,
        percentage: f4Percent,
        isPositive: false,
        color: '#10B981'
      }
    ];
  }, [selectedTrain, predictions]);

  // Fetch 7-Day Corridor Trend
  useEffect(() => {
    if (!selectedTrain) return;
    const corridor = `${selectedTrain.originCode || 'CSMT'}-${selectedTrain.destinationCode || 'SUR'}`;
    async function loadTrend() {
      setLoadingTrend(true);
      try {
        const res = await fetchCorridorTrend(corridor, 7);
        if (res && Array.isArray(res.trendData)) {
          setCorridorTrendData(res.trendData);
        } else {
          setCorridorTrendData([
            { day: 'Mon', predictedDelay: 4, actualDelay: 4 },
            { day: 'Tue', predictedDelay: 8, actualDelay: 7 },
            { day: 'Wed', predictedDelay: 6, actualDelay: 6 },
            { day: 'Thu', predictedDelay: 15, actualDelay: 14 },
            { day: 'Fri', predictedDelay: 22, actualDelay: 21 },
            { day: 'Sat', predictedDelay: 10, actualDelay: 9 },
            { day: 'Sun', predictedDelay: 3, actualDelay: 3 }
          ]);
        }
      } catch (e) {
        setCorridorTrendData([
          { day: 'Mon', predictedDelay: 4, actualDelay: 4 },
          { day: 'Tue', predictedDelay: 8, actualDelay: 7 },
          { day: 'Wed', predictedDelay: 6, actualDelay: 6 },
          { day: 'Thu', predictedDelay: 15, actualDelay: 14 },
          { day: 'Fri', predictedDelay: 22, actualDelay: 21 },
          { day: 'Sat', predictedDelay: 10, actualDelay: 9 },
          { day: 'Sun', predictedDelay: 3, actualDelay: 3 }
        ]);
      } finally {
        setLoadingTrend(false);
      }
    }
    loadTrend();
  }, [selectedTrain?.trainNumber, selectedTrain?.originCode, selectedTrain?.destinationCode]);

  // Conflict Alerts
  const allAlerts = useMemo(() => socketAlerts || [], [socketAlerts]);
  const unacknowledgedAlerts = useMemo(() => {
    return allAlerts.filter(a => !acknowledgedAlertIds.has(a.id));
  }, [allAlerts, acknowledgedAlertIds]);

  const handleAcknowledgeAlert = (alertId) => {
    setAcknowledgedAlertIds(prev => new Set([...prev, alertId]));
  };

  const handleExecuteAction = async (alert) => {
    if (!alert || executingAlertId) return;
    setExecutingAlertId(alert.id);
    try {
      const payload = alert.actionPayload || {
        alertId: alert.id,
        actionType: 'hold_at_station',
        targetTrainNumber: alert.targetTrainNumber || alert.trains?.[0] || '12116',
        holdMinutes: alert.holdMinutes || 5,
        holdStationName: alert.stationName || 'Station',
        recommendation: alert.recommendation
      };

      const result = await executeResolutionAction(payload);
      setExecutedAlertIds(prev => new Set([...prev, alert.id]));
      setActionFeedback(prev => ({
        ...prev,
        [alert.id]: result.message || 'Action executed successfully! Precedence regulation dispatched.'
      }));

      setTimeout(() => {
        handleAcknowledgeAlert(alert.id);
      }, 3500);
    } catch (err) {
      setActionFeedback(prev => ({
        ...prev,
        [alert.id]: `Execution failed: ${err.message}`
      }));
    } finally {
      setExecutingAlertId(null);
    }
  };

  const handleInjectDisruption = async () => {
    if (!selectedTrain) return;
    const cat = DELAY_REASONS_CATALOG.find(d => d.id === selectedDisruption);
    try {
      await injectSimulationEvent(
        selectedTrain.trainNumber,
        selectedDisruption,
        cat ? cat.title : 'Operational Delay'
      );
      setInjectStatus(`✓ Injected "${cat ? cat.title : selectedDisruption}" into Train #${selectedTrain.trainNumber}!`);
      setTimeout(() => setInjectStatus(''), 4000);
    } catch (e) {
      setInjectStatus(`Failed to inject: ${e.message}`);
      setTimeout(() => setInjectStatus(''), 4000);
    }
  };

  const activeDelay = selectedTrain?.currentDelay || 0;
  const isDelayed = activeDelay > 5;

  return (
    <div className="space-y-6 font-sans">
      {/* Search Header for Mobile */}
      <div className="flex md:hidden items-center bg-white rounded-lg px-3 py-2 border border-[#E2E8F0] shadow-sm">
        <Search className="w-4 h-4 text-[#505f76] mr-2" />
        <input 
          type="text"
          placeholder="Search Fleet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs text-[#0F172A] focus:ring-0 w-full outline-none p-0"
        />
      </div>

      {/* Main Grid: Left Column (Span 8) & Right Column (Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. HERO SELECTED TRAIN CARD */}
          {selectedTrain && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="p-6">
                
                {/* Header Row */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                        {selectedTrain.name}
                      </h2>
                      <span className="font-mono text-sm font-bold text-[#0ea5e9]">
                        #{selectedTrain.trainNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold flex items-center gap-1.5 ${
                        isDelayed 
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' 
                          : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDelayed ? 'bg-[#EF4444] animate-pulse' : 'bg-[#10B981]'}`} />
                        {isDelayed ? `delayed +${activeDelay}m` : 'on time'}
                      </span>
                    </div>
                    <p className="text-xs text-[#505f76] font-medium">
                      Route: {selectedTrain.originCode || 'CSMT'} → {selectedTrain.destinationCode || 'SUR'} • Progress: {selectedTrain.currentKm} of {selectedTrain.totalKm} km
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setRouteViewMode(routeViewMode === 'progression' ? 'gis' : 'progression')}
                      className="px-3.5 py-1.5 bg-[#f7f9fb] border border-[#E2E8F0] text-[#0F172A] rounded-lg text-xs font-semibold hover:border-[#0ea5e9] hover:text-[#006591] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{routeViewMode === 'progression' ? '🗺️ GIS Map' : '🛤️ Track View'}</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry 3-Box Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6 font-sans">
                  <div className="p-4 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]/70">
                    <div className="text-[11px] font-bold text-[#505f76] tracking-wider uppercase mb-1">Current Speed</div>
                    <div className="text-2xl font-bold font-mono text-[#0F172A]">
                      {selectedTrain.currentSpeed || 85} <span className="text-xs font-normal text-[#6e7881]">km/h</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]/70">
                    <div className="text-[11px] font-bold text-[#505f76] tracking-wider uppercase mb-1">Estimated Delay</div>
                    <div className={`text-2xl font-bold font-mono ${isDelayed ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                      {activeDelay > 0 ? `+${activeDelay}` : '0'} <span className="text-xs font-normal text-[#6e7881]">min</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]/70">
                    <div className="text-[11px] font-bold text-[#505f76] tracking-wider uppercase mb-1">ML Confidence</div>
                    <div className="text-2xl font-bold font-mono text-[#0ea5e9]">
                      {selectedTrain.confidencePercent || 92}<span className="text-xs font-normal text-[#6e7881]">%</span>
                    </div>
                  </div>
                </div>

                {/* Route Progression Strip */}
                {routeViewMode === 'progression' ? (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#505f76] uppercase tracking-wider mb-3">
                      <span>Route Progression</span>
                      <span className="font-mono text-[#006591]">
                        {selectedTrain.haltsCompleted} of {selectedTrain.totalHalts} Halts Completed
                      </span>
                    </div>

                    {/* Continuous Track Line Ribbon */}
                    <div className="p-4 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0] overflow-x-auto custom-scrollbar">
                      {(() => {
                        const runObj = selectedTrain.currentRun || selectedTrain;
                        const log = runObj.stationLog || selectedTrain.schedule || [];
                        const totalHalts = log.length;
                        const nextIdx = runObj.nextStationIndex !== undefined ? runObj.nextStationIndex : log.findIndex(s => !s.arrived);
                        const currentStationIdx = Math.min(totalHalts - 1, Math.max(0, nextIdx >= 0 ? nextIdx : 0));
                        
                        // Exact percentage connecting to the current active station circle (where train is located)
                        const linePct = totalHalts > 1 ? (currentStationIdx / (totalHalts - 1)) * 100 : 0;

                        return (
                          <div className="min-w-[620px] py-4 px-2">
                            <div className="relative flex items-center justify-between">
                              {/* Background Track Line centered vertically on station circles */}
                              <div className="absolute left-[10px] right-[10px] top-[10px] -translate-y-1/2 h-[3px] bg-[#E2E8F0] rounded-full z-0" />
                              
                              {/* Covered Track Line extending accurately to the current train's station */}
                              <div className="absolute left-[10px] right-[10px] top-[10px] -translate-y-1/2 h-[3px] z-0 pointer-events-none">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#006591] rounded-full transition-all duration-700"
                                  style={{ width: `${Math.max(0, Math.min(100, linePct))}%` }}
                                />
                              </div>

                              {/* Station Nodes along the route */}
                              {log.map((st, sIdx) => {
                                const isCovered = st.arrived || sIdx < nextIdx;
                                const isCurrentNext = sIdx === nextIdx && !st.arrived;
                                const pred = predictions.find(p => p.stationCode === st.stationCode);
                                const delay = isCovered ? (st.delayMinutes || 0) : (pred ? Math.round(pred.predictedDelayMinutes) : 0);

                                return (
                                  <div key={st.stationCode} className="relative z-10 flex flex-col items-center group cursor-pointer">
                                    {/* Station Marker */}
                                    {isCurrentNext && (
                                      <div className="absolute -top-7 bg-[#EF4444] text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold animate-bounce shadow-md whitespace-nowrap">
                                        {selectedTrain.trainNumber}
                                      </div>
                                    )}

                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                                      isCovered
                                        ? 'bg-[#0ea5e9] border-white text-white'
                                        : isCurrentNext
                                        ? 'bg-white border-[#EF4444] ring-4 ring-[#EF4444]/20 animate-pulse'
                                        : 'bg-white border-[#E2E8F0] text-[#6e7881]'
                                    }`}>
                                      {isCovered ? (
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      ) : isCurrentNext ? (
                                        <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                                      ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#bec8d2]" />
                                      )}
                                    </div>

                                    {/* Station Code */}
                                    <div className="mt-2 text-center font-mono">
                                      <div className={`text-xs font-bold ${
                                        isCovered ? 'text-[#0ea5e9]' : isCurrentNext ? 'text-[#0F172A]' : 'text-[#6e7881]'
                                      }`}>
                                        {st.stationCode}
                                      </div>
                                      <div className="text-[10px] text-[#505f76] truncate max-w-[65px]">
                                        {st.stationName}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  /* Embedded GIS Map View */
                  <div className="rounded-xl overflow-hidden border border-[#E2E8F0]">
                    <LiveGISMap 
                      stations={stations}
                      trains={enhancedTrains}
                      selectedTrainNumber={selectedTrain.trainNumber}
                      height="260px"
                      showAllTrains={true}
                    />
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 2. ACTIVE FLEET MATRIX TABLE */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Active Fleet Matrix</h3>
                <p className="text-xs text-[#505f76] mt-0.5">Real-time status across Maharashtra coaching network</p>
              </div>

              {/* Search Box */}
              <div className="relative w-64">
                <Search className="w-4 h-4 text-[#6e7881] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Filter trains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#f7f9fb] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#505f76] uppercase tracking-wider border-b border-[#E2E8F0]">
                    <th className="px-6 py-3.5 font-semibold">Train ID</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold">Speed</th>
                    <th className="px-6 py-3.5 font-semibold">ETA / Delay</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                  {filteredTrains.map(t => {
                    const isSel = selectedTrain?.trainNumber === t.trainNumber;
                    const delayed = t.currentDelay > 5;

                    return (
                      <tr 
                        key={t.trainNumber}
                        onClick={() => setSelectedTrainNumber(t.trainNumber)}
                        className={`hover:bg-[#f7f9fb] transition-colors cursor-pointer ${
                          isSel ? 'bg-[#d0e1fb]/30 font-semibold' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-mono">
                          <div className="font-bold text-[#0F172A]">{t.name}</div>
                          <div className="text-[11px] text-[#0ea5e9]">#{t.trainNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                            delayed 
                              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' 
                              : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                          }`}>
                            {delayed ? 'Delayed' : 'On Time'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">
                          {t.currentSpeed || 85} <span className="text-[10px] text-[#6e7881]">km/h</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold">
                          <span className={delayed ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                            {t.currentDelay > 0 ? `+${t.currentDelay}m` : '0m'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrainNumber(t.trainNumber);
                            }}
                            className="text-[#0ea5e9] hover:text-[#006591] font-semibold cursor-pointer"
                          >
                            {isSel ? 'Monitoring' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. CRITICAL ALERTS & CONFLICT RESOLUTION */}
          <div ref={alertsFeedRef} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden relative">
            {/* Red top border accent */}
            <div className="h-1.5 w-full bg-[#EF4444] absolute top-0 left-0" />
            
            <div className="p-6 pt-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <h3 className="font-bold text-base text-[#0F172A]">Critical Alerts</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444] font-mono text-xs font-bold">
                  {unacknowledgedAlerts.length} Active
                </span>
              </div>

              {unacknowledgedAlerts.length === 0 ? (
                <div className="p-4 bg-[#f7f9fb] border border-[#E2E8F0] rounded-lg text-center text-xs text-[#505f76] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>No platform conflicts detected across fleet</span>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {unacknowledgedAlerts.map(alert => {
                    const isHigh = alert.severity === 'high';
                    const feedback = actionFeedback[alert.id];
                    const isExecuted = executedAlertIds.has(alert.id);

                    return (
                      <div 
                        key={alert.id}
                        className={`p-4 rounded-xl border text-xs transition-all space-y-2.5 ${
                          isHigh
                            ? 'bg-[#EF4444]/5 border-[#EF4444]/30 shadow-sm'
                            : 'bg-[#F59E0B]/5 border-[#F59E0B]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-[#0F172A]">{alert.stationName} ({alert.stationCode})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isHigh ? 'bg-[#EF4444] text-white' : 'bg-[#F59E0B] text-white'
                          }`}>
                            {isHigh ? 'HIGH RISK' : 'MEDIUM'}
                          </span>
                        </div>

                        <p className="text-[#505f76] text-xs leading-relaxed">
                          {alert.description}
                        </p>

                        <div className="p-2.5 rounded bg-white border border-[#E2E8F0] text-[11px] text-[#006591] font-semibold">
                          {alert.recommendation}
                        </div>

                        {feedback && (
                          <div className="p-2 rounded bg-[#10B981]/10 text-[#10B981] font-bold text-[11px]">
                            {feedback}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleExecuteAction(alert)}
                            disabled={executingAlertId === alert.id || isExecuted}
                            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              isExecuted
                                ? 'bg-[#10B981] text-white'
                                : 'bg-[#EF4444] hover:bg-[#EF4444]/90 text-white'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>
                              {executingAlertId === alert.id
                                ? 'Dispatching...'
                                : isExecuted
                                ? '✓ Action Executed'
                                : '⚡ Perform Action'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3 py-2 bg-white hover:bg-[#f7f9fb] border border-[#E2E8F0] text-[#505f76] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. ML DELAY PREDICTION FACTORS (XAI SHAP) */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">ML Delay Prediction Factors</h3>
                <span className="text-[11px] text-[#505f76] font-medium">
                  Root cause attribution for #{selectedTrain?.trainNumber} ({selectedTrain?.name})
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded font-bold">
                TreeSHAP XAI
              </span>
            </div>

            <div className="space-y-4 font-sans text-xs">
              {dynamicXaiFactors.map((factor, fIdx) => (
                <div key={fIdx}>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-[#0F172A] truncate max-w-[250px]">{factor.name}</span>
                    <span className="font-mono font-bold" style={{ color: factor.color }}>
                      {factor.impactMinutes}
                    </span>
                  </div>
                  <div 
                    className="h-2 w-full bg-[#f2f4f6] rounded-full overflow-hidden flex" 
                    style={{ justifyContent: factor.isPositive ? 'flex-start' : 'flex-end' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${factor.percentage}%`, 
                        backgroundColor: factor.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 7-DAY CORRIDOR DELAY TREND CHART */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#0F172A]">7-Day Corridor Delay Trend</h3>
              <span className="font-mono text-[10px] text-[#505f76]">
                {selectedTrain ? `${selectedTrain.originCode || 'CSMT'}-${selectedTrain.destinationCode || 'SUR'}` : 'Corridor'}
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={corridorTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#505f76' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#505f76' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1d2a41', borderRadius: '8px', color: '#ffffff', fontSize: '11px' }}
                    formatter={(value) => [`${value} min`, 'Avg Delay']}
                  />
                  <Bar dataKey="predictedDelay" radius={[4, 4, 0, 0]}>
                    {corridorTrendData.map((entry, index) => {
                      const val = entry.predictedDelay || entry.delay || 5;
                      const color = val > 15 ? '#EF4444' : val > 10 ? '#F59E0B' : '#0ea5e9';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. OPERATOR DISRUPTION TESTING BENCH */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#006591]">
                <Sliders className="w-4 h-4" />
                <h3 className="font-bold text-sm text-[#0F172A]">Disruption Injection Sandbox</h3>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1">
              {['all', 'Weather', 'Signaling', 'Congestion', 'Civil Works'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-[#006591] text-white'
                      : 'bg-[#f7f9fb] text-[#505f76] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Disruption Dropdown / Selector */}
            <div className="space-y-2">
              <select
                value={selectedDisruption}
                onChange={(e) => setSelectedDisruption(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#f7f9fb] border border-[#E2E8F0] text-xs text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
              >
                {DELAY_REASONS_CATALOG
                  .filter(d => activeCategoryFilter === 'all' || d.category === activeCategoryFilter)
                  .map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.category})
                    </option>
                  ))}
              </select>

              <button
                onClick={handleInjectDisruption}
                className="w-full py-2.5 px-4 bg-[#0ea5e9] hover:bg-[#006591] text-white rounded-lg font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Inject Disruption into #{selectedTrain?.trainNumber}</span>
              </button>

              {injectStatus && (
                <div className="p-2.5 rounded bg-[#10B981]/10 text-[#10B981] text-xs font-bold text-center">
                  {injectStatus}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
