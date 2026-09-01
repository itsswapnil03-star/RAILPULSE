import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '../../context/SocketContext';
import { fetchStations, fetchPredictions, interpolateTrainPosition } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import { Play, Pause, ChevronDown, Radio, Info } from 'lucide-react';

// Crisp Station Icon (White circle with dark ring matching user mockup)
const createDemoStationIcon = (isNext = false) => {
  return L.divIcon({
    className: 'demo-station-marker',
    html: `<div style="
      width: ${isNext ? '14px' : '10px'};
      height: ${isNext ? '14px' : '10px'};
      background: #ffffff;
      border: 2.5px solid ${isNext ? '#0284c7' : '#1e293b'};
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Train Pin Marker (Cyan/Blue pin matching user mockup)
const createDemoTrainPinIcon = () => {
  return L.divIcon({
    className: 'demo-train-pin-marker',
    html: `<div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #38bdf8, #0284c7);
        border: 2px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(2,132,199,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 13px;">🚆</span>
      </div>
      <div style="
        width: 8px;
        height: 8px;
        background: #0284c7;
        border-radius: 50%;
        margin-top: 2px;
        opacity: 0.6;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
    </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 38]
  });
};

// Auto-Bounds Map Updater
function RouteMapBounds({ routeCoords }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 1) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [routeCoords, map]);
  return null;
}

export default function RouteMapDemoView() {
  const { trainsList, simulatedTime, connected } = useSocket();
  const [stations, setStations] = useState([]);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('12139'); // Default to 12139 Sevagram Express
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState('2x');
  const [predictions, setPredictions] = useState([]);

  const stationsMap = useMemo(() => {
    return new Map(stations.map(s => [s.code, s]));
  }, [stations]);

  // Load all stations
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStations();
        setStations(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  // Filter available trains with routes
  const availableTrains = useMemo(() => {
    if (!trainsList || trainsList.length === 0) return [];
    return trainsList.filter(t => t.schedule && t.schedule.length > 1);
  }, [trainsList]);

  // Fallback train selector if 12139 is not yet loaded
  useEffect(() => {
    if (availableTrains.length > 0) {
      const exists = availableTrains.find(t => t.trainNumber === selectedTrainNumber);
      if (!exists) {
        const sevagram = availableTrains.find(t => t.trainNumber === '12139') || availableTrains[0];
        setSelectedTrainNumber(sevagram.trainNumber);
      }
    }
  }, [availableTrains, selectedTrainNumber]);

  // Selected Train Object
  const selectedTrain = useMemo(() => {
    return availableTrains.find(t => t.trainNumber === selectedTrainNumber) || availableTrains[0] || null;
  }, [availableTrains, selectedTrainNumber]);

  // Fetch ML predictions for selected train
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

  const schedule = selectedTrain?.schedule || [];
  const run = selectedTrain?.currentRun || selectedTrain;

  // Compute Route Coordinates for Map
  const routeCoords = useMemo(() => {
    return schedule
      .map(stop => {
        const st = stationsMap.get(stop.stationCode);
        return st ? [st.lat, st.lng] : null;
      })
      .filter(Boolean);
  }, [schedule, stationsMap]);

  // Compute Real-Time Interpolated GPS Position
  const liveTrainPos = useMemo(() => {
    if (!selectedTrain || stationsMap.size === 0) return null;
    return interpolateTrainPosition(selectedTrain, stationsMap);
  }, [selectedTrain, stationsMap, run?.currentKm]);

  // Determine Next Station, Prev Station & Delay
  const stationLog = run?.stationLog || [];
  const arrivedList = stationLog.filter(s => s.arrived);
  const nextStopIndex = run?.nextStationIndex || arrivedList.length || 0;
  
  const prevStation = schedule[Math.max(0, nextStopIndex - 1)] || schedule[0] || null;
  const nextStation = schedule[Math.min(schedule.length - 1, nextStopIndex)] || schedule[schedule.length - 1] || null;
  
  const lastArrived = arrivedList.length > 0 ? arrivedList[arrivedList.length - 1] : null;
  const activeDelayMinutes = lastArrived?.delayMinutes || (run?.activeDelayEvent ? 7 : 0);

  // Status Badge Logic
  const statusBadge = useMemo(() => {
    if (activeDelayMinutes > 15) {
      return { label: `Delayed (+${activeDelayMinutes} min)`, bg: '#fee2e2', text: '#dc2626', dot: '#dc2626' };
    }
    if (activeDelayMinutes > 0) {
      return { label: 'Minor delay', bg: '#fef3c7', text: '#b45309', dot: '#d97706' };
    }
    return { label: 'On time', bg: '#dcfce7', text: '#15803d', dot: '#16a34a' };
  }, [activeDelayMinutes]);

  // Progress Bar percentage between prev and next station
  const progressPercent = useMemo(() => {
    if (!prevStation || !nextStation || prevStation.stationCode === nextStation.stationCode) return 50;
    const prevKm = prevStation.kmFromStart || 0;
    const nextKm = nextStation.kmFromStart || (prevKm + 50);
    const currKm = run?.currentKm || prevKm;
    const pct = Math.max(0, Math.min(100, ((currKm - prevKm) / (nextKm - prevKm)) * 100));
    return Math.round(pct);
  }, [prevStation, nextStation, run?.currentKm]);

  // Next Station Scheduled vs Predicted ETA
  const nextPred = predictions.find(p => p.stationCode === nextStation?.stationCode);
  const nextScheduledTime = nextStation?.scheduledArrival 
    ? (typeof nextStation.scheduledArrival === 'string' && nextStation.scheduledArrival.length === 5 
        ? nextStation.scheduledArrival 
        : formatTime(nextStation.scheduledArrival))
    : '06:32';

  const nextPredictedTime = nextStation?.scheduledArrival
    ? (() => {
        const d = new Date(nextStation.scheduledArrival);
        if (isNaN(d.getTime())) return '06:39';
        d.setMinutes(d.getMinutes() + activeDelayMinutes);
        return formatTime(d);
      })()
    : '06:39';

  return (
    <div className="w-full bg-[#081220] rounded-2xl border border-[#1e2d42] overflow-hidden shadow-2xl flex flex-col font-sans">
      
      {/* 1. TOP HEADER BAR (Exact layout from user uploaded image) */}
      <div className="bg-[#0b192e] px-4 py-3 border-b border-[#182944] flex flex-wrap items-center justify-between gap-3 text-white">
        
        {/* Left: Brand Title */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-xl font-extrabold tracking-tight text-white">RailMind</span>
          <span className="text-xs text-[#7ba4d5] font-normal">
            Maharashtra route demo — simulated live position
          </span>
        </div>

        {/* Right: Train Selector, Pause Button & Speed Multiplier */}
        <div className="flex items-center gap-2.5">
          
          {/* Train Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedTrainNumber}
              onChange={(e) => setSelectedTrainNumber(e.target.value)}
              className="appearance-none bg-[#11233d] hover:bg-[#162d4e] border border-[#213759] text-[#e2edff] text-xs font-medium rounded-lg px-3 py-2 pr-8 outline-none cursor-pointer transition-all min-w-[280px]"
            >
              {availableTrains.map(t => (
                <option key={t.trainNumber} value={t.trainNumber} className="bg-[#0b192e] text-white">
                  {t.trainNumber} — {t.origin} → {t.destination} ({t.name})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#7ba4d5] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Pause / Play Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#11233d] hover:bg-[#162d4e] border border-[#213759] text-xs font-semibold text-[#e2edff] transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Speed Multiplier Dropdown */}
          <div className="relative">
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(e.target.value)}
              className="appearance-none bg-[#11233d] hover:bg-[#162d4e] border border-[#213759] text-[#e2edff] text-xs font-semibold rounded-lg px-2.5 py-2 pr-7 outline-none cursor-pointer transition-all"
            >
              <option value="1x" className="bg-[#0b192e] text-white">1×</option>
              <option value="2x" className="bg-[#0b192e] text-white">2×</option>
              <option value="5x" className="bg-[#0b192e] text-white">5×</option>
              <option value="10x" className="bg-[#0b192e] text-white">10×</option>
              <option value="24x" className="bg-[#0b192e] text-white">24×</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#7ba4d5] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* 2. MAIN BODY (Split View: Left Map, Right White Cards Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* LEFT COLUMN: INTERACTIVE LEAFLET MAP */}
        <div className="lg:col-span-7 xl:col-span-8 relative h-[450px] lg:h-auto min-h-[500px]">
          <MapContainer
            center={liveTrainPos || [19.5, 75.5]}
            zoom={7}
            style={{ height: '100%', width: '100%', minHeight: '520px' }}
            zoomControl={true}
          >
            {/* OpenStreetMap Standard Clean Layer (matching user screenshot) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto Fit Route Bounds */}
            {routeCoords.length > 1 && <RouteMapBounds routeCoords={routeCoords} />}

            {/* Polyline Route Track */}
            {routeCoords.length > 1 && (
              <Polyline
                positions={routeCoords}
                pathOptions={{
                  color: '#0284c7',
                  weight: 4,
                  opacity: 0.85,
                  dashArray: '1, 6',
                  lineCap: 'round'
                }}
              />
            )}

            {/* Station Circle Markers */}
            {schedule.map((stop, idx) => {
              const st = stationsMap.get(stop.stationCode);
              if (!st) return null;
              const isNext = stop.stationCode === nextStation?.stationCode;

              return (
                <Marker
                  key={stop.stationCode + idx}
                  position={[st.lat, st.lng]}
                  icon={createDemoStationIcon(isNext)}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.9} permanent={false}>
                    <span className="text-xs font-semibold">{st.name || stop.stationName}</span>
                  </Tooltip>
                </Marker>
              );
            })}

            {/* Live Moving Train Pin Marker */}
            {liveTrainPos && (
              <Marker
                position={liveTrainPos}
                icon={createDemoTrainPinIcon()}
              >
                <Tooltip direction="bottom" offset={[0, 10]} opacity={0.95} permanent={false}>
                  <div className="text-xs font-bold font-sans">
                    🚆 {selectedTrain?.name} ({selectedTrain?.trainNumber})
                    <div className="text-[10px] text-slate-500 font-normal">
                      Speed: {run?.currentSpeed || 85} km/h · Delay: +{activeDelayMinutes}m
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* RIGHT COLUMN: WHITE SIDEBAR CARDS (Exact match from screenshot) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#f8fafc] p-4 lg:p-5 flex flex-col gap-4 overflow-y-auto max-h-[700px] border-t lg:border-t-0 lg:border-l border-slate-200">
          
          {selectedTrain && (
            <>
              {/* CARD 1: PRIMARY TRAIN ETA CARD */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-slate-800">
                
                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                    {selectedTrain.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {selectedTrain.trainNumber} — {selectedTrain.origin} → {selectedTrain.destination} (Central Line)
                  </p>
                </div>

                {/* Status Badge */}
                <div>
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusBadge.dot }} />
                    <span>{statusBadge.label}</span>
                  </span>
                </div>

                {/* Next Leg Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden relative">
                    <div 
                      className="bg-sky-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-500">
                    <span>{prevStation?.stationName || prevStation?.stationCode || 'Origin'}</span>
                    <span>{nextStation?.stationName || nextStation?.stationCode || 'Destination'}</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="space-y-2.5 pt-2 text-sm border-t border-slate-100">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Next station</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {nextStation?.stationName || nextStation?.stationCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Scheduled arrival</span>
                    <span className="font-bold text-slate-800">
                      {nextScheduledTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Predicted arrival</span>
                    <span className="font-extrabold text-slate-900">
                      {nextPredictedTime} {activeDelayMinutes > 0 ? `(+${activeDelayMinutes} min)` : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Confidence</span>
                    <span className="font-extrabold text-slate-900">
                      89%
                    </span>
                  </div>

                </div>

                {/* Explanatory Context Note */}
                <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {activeDelayMinutes > 0 
                    ? 'Minor congestion detected near the last station — ETA adjusted slightly.' 
                    : 'Clear line aspect and nominal track clearance — operating on time.'}
                </div>

              </div>

              {/* CARD 2: ROUTE STATIONS LIST */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 text-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ROUTE STATIONS
                </div>

                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {schedule.map((stop, idx) => {
                    const isArrived = idx < nextStopIndex;
                    const isCurrentNext = idx === nextStopIndex;
                    
                    const schedTime = stop.scheduledArrival 
                      ? (typeof stop.scheduledArrival === 'string' && stop.scheduledArrival.length === 5 
                          ? stop.scheduledArrival 
                          : formatTime(stop.scheduledArrival))
                      : '06:00';

                    let displayTime = schedTime;
                    if (isCurrentNext) {
                      displayTime = nextPredictedTime;
                    }

                    return (
                      <div 
                        key={stop.stationCode + idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {isArrived ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          ) : isCurrentNext ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-white shrink-0" />
                          )}
                          <span className={`font-medium ${isCurrentNext ? 'font-bold text-slate-900' : isArrived ? 'text-slate-600' : 'text-slate-700'}`}>
                            {stop.stationName || stop.stationCode}
                          </span>
                        </div>

                        <span className={`font-mono text-xs ${isCurrentNext ? 'font-bold text-amber-600' : 'text-slate-400'}`}>
                          {displayTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}