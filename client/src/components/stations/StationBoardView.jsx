import React, { useState, useEffect, useMemo } from 'react';
import { fetchStations, fetchStationBoard } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import { PAN_INDIA_STATIONS_FALLBACK } from '../../data/fallbackData';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Search, 
  Clock, 
  CheckCircle2,
  Train,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function StationBoardView({ initialStationCode = 'NDLS', onSelectStation }) {
  const { simulatedTime, alerts, trainsList } = useSocket();
  const [stationCode, setStationCode] = useState(initialStationCode);
  const [stations, setStations] = useState([]);
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conflictDismissed, setConflictDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all'); // 'all' | 'arrivals' | 'departures'

  const handleStationChange = (newCode) => {
    setStationCode(newCode);
    if (onSelectStation) {
      onSelectStation(newCode);
    }
  };

  // Load all stations for switcher
  useEffect(() => {
    async function loadStations() {
      try {
        const list = await fetchStations();
        if (list && list.length > 0) {
          setStations(list);
        } else {
          setStations(PAN_INDIA_STATIONS_FALLBACK);
        }
      } catch (e) {
        setStations(PAN_INDIA_STATIONS_FALLBACK);
      }
    }
    loadStations();
  }, []);

  // Update if initial prop changes
  useEffect(() => {
    if (initialStationCode && initialStationCode !== stationCode) {
      setStationCode(initialStationCode);
    }
  }, [initialStationCode]);

  // Load Board Data
  useEffect(() => {
    let isMounted = true;
    setBoardData(null);
    async function loadBoard() {
      setLoading(true);
      try {
        const data = await fetchStationBoard(stationCode);
        if (isMounted) setBoardData(data);
      } catch (err) {
        if (isMounted) setBoardData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBoard();
    const interval = setInterval(loadBoard, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [stationCode]);

  // Group stations by Zone for clean dropdown navigation
  const groupedStations = useMemo(() => {
    const list = stations.length > 0 ? stations : PAN_INDIA_STATIONS_FALLBACK;
    const groups = {};
    list.forEach(st => {
      const zone = st.zone || 'Other';
      if (!groups[zone]) groups[zone] = [];
      groups[zone].push(st);
    });
    return groups;
  }, [stations]);

  // Current Station object
  const currentStation = useMemo(() => {
    return stations.find(s => s.code === stationCode) || {
      code: stationCode,
      name: stationCode === 'NDLS' ? 'New Delhi' : stationCode === 'CSMT' ? 'Mumbai CSMT' : `${stationCode} Station`
    };
  }, [stations, stationCode]);

  // Generate clean, realistic train board rows strictly for THIS station
  const cleanTrainRows = useMemo(() => {
    let list = [];

    // 1. Prioritize backend real-time arrival board for this exact station
    if (boardData && (boardData.station?.code === stationCode || !boardData.station) && Array.isArray(boardData.arrivals) && boardData.arrivals.length > 0) {
      list = boardData.arrivals.map((arr, idx) => {
        const isArrival = arr.to === currentStation.name || arr.to === stationCode || (idx % 2 === 0);
        return {
          trainNumber: arr.trainNumber,
          name: arr.trainName,
          originCode: arr.from,
          destinationCode: arr.to,
          isArrival,
          platform: String(arr.platform || ((parseInt(String(arr.trainNumber).slice(-1), 10) || 1) % 6) + 1),
          scheduledFormatted: formatTime(arr.scheduledArrival),
          predictedFormatted: formatTime(arr.expectedArrival),
          delayMinutes: arr.delayMinutes || 0,
          status: arr.status || 'ON TIME',
          drift: (arr.delayMinutes || 0) > 5 ? 'up' : (arr.delayMinutes || 0) > 0 ? 'down' : 'none'
        };
      });
    } else if (trainsList && trainsList.length > 0) {
      // 2. Client-side fallback: ONLY select trains that actually stop at this stationCode
      const matchingTrains = trainsList.filter(t => {
        const run = t.currentRun || t;
        const log = run.stationLog || t.schedule || [];
        return log.some(s => s.stationCode === stationCode);
      });

      list = matchingTrains.map((t, idx) => {
        const run = t.currentRun || t;
        const log = run.stationLog || t.schedule || [];
        const halt = log.find(s => s.stationCode === stationCode);
        const delay = halt?.delayMinutes !== undefined && halt?.delayMinutes !== null
          ? halt.delayMinutes
          : (t.currentDelay || 0);

        const sched = halt?.scheduledArrival || halt?.scheduledDeparture;
        const isArrival = t.destinationCode === stationCode || (idx % 2 === 0);
        const platform = ((parseInt(String(t.trainNumber).slice(-1), 10) || 1) % 6) + 1;

        const baseDate = simulatedTime ? new Date(simulatedTime) : new Date();
        let scheduledDate = new Date(baseDate);
        if (sched) {
          const parts = String(sched).split(':').map(Number);
          scheduledDate.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
        }
        const expectedDate = new Date(scheduledDate.getTime() + delay * 60000);

        return {
          trainNumber: t.trainNumber,
          name: t.name,
          originCode: t.originCode || 'ORIGIN',
          destinationCode: t.destinationCode || 'DEST',
          isArrival,
          platform: String(platform),
          scheduledFormatted: formatTime(sched || scheduledDate.toISOString()),
          predictedFormatted: formatTime(expectedDate.toISOString()),
          delayMinutes: delay,
          status: halt?.arrived && !halt?.departed ? 'ARRIVED' : delay > 5 ? 'DELAYED' : 'ON TIME',
          drift: delay > 5 ? 'up' : delay > 0 ? 'down' : 'none'
        };
      });
    }

    // Filter by Direction (All / Arrivals / Departures)
    if (serviceFilter === 'arrivals') {
      list = list.filter(r => r.isArrival);
    } else if (serviceFilter === 'departures') {
      list = list.filter(r => !r.isArrival);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(r => 
        (r.trainNumber && r.trainNumber.toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.originCode && r.originCode.toLowerCase().includes(q)) ||
        (r.destinationCode && r.destinationCode.toLowerCase().includes(q))
      );
    }

    return list;
  }, [boardData, trainsList, stationCode, simulatedTime, currentStation, serviceFilter, searchQuery]);

  // Find if any live conflict is active specifically at this station
  const activeConflict = useMemo(() => {
    if (!alerts || alerts.length === 0) return null;
    return alerts.find(a => 
      a.stationCode === stationCode || 
      (a.location && a.location.toUpperCase().includes(stationCode)) ||
      (a.description && a.description.toUpperCase().includes(stationCode))
    ) || null;
  }, [alerts, stationCode]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Subtle, Professional Conflict Alert (Conditional when actual conflict is detected for this station) */}
      {activeConflict && !conflictDismissed && (
        <div className="bg-white border-l-4 border-l-[#F59E0B] border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-[#0F172A] tracking-tight">
                Simultaneous Arrival Clearance Warning • {currentStation.name}
              </h3>
              <p className="text-xs text-[#505f76] mt-0.5 leading-relaxed">
                {activeConflict.message || `Potential platform occupancy conflict detected at ${currentStation.name}. Automated precedence recommendation active.`}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setConflictDismissed(true)}
            className="shrink-0 px-3 py-1.5 bg-[#f7f9fb] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#0F172A] rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* 2. Digital Board Container */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Top Controls & Direction Tabs */}
        <div className="p-5 border-b border-[#E2E8F0] flex flex-wrap justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0ea5e9]/10 text-[#006591] flex items-center justify-center font-bold shrink-0">
              <Train className="w-5 h-5 text-[#006591]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="relative inline-flex items-center">
                  <select
                    value={stationCode}
                    onChange={(e) => handleStationChange(e.target.value)}
                    className="font-bold text-lg text-[#0F172A] tracking-tight bg-transparent border-b border-dashed border-[#0ea5e9] pr-6 outline-none cursor-pointer appearance-none hover:text-[#006591]"
                  >
                    {Object.keys(groupedStations).sort().map(zone => (
                      <optgroup key={zone} label={`Zone: ${zone}`}>
                        {groupedStations[zone].map(s => (
                          <option key={s.code} value={s.code}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#006591] pointer-events-none absolute right-0" />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#0ea5e9]/10 text-[#006591] font-mono text-xs font-bold">
                  {stationCode}
                </span>
              </div>
              <p className="text-xs text-[#505f76] mt-0.5">
                Dynamic platform occupancy & ML arrival forecasts across 120+ junctions · Showing {cleanTrainRows.length} services
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Direction Tabs */}
            <div className="flex items-center p-1 bg-[#f7f9fb] rounded-lg border border-[#E2E8F0] text-xs font-semibold">
              <button
                onClick={() => setServiceFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  serviceFilter === 'all'
                    ? 'bg-white text-[#006591] font-bold shadow-sm'
                    : 'text-[#505f76] hover:text-[#0F172A]'
                }`}
              >
                All Services
              </button>
              <button
                onClick={() => setServiceFilter('arrivals')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  serviceFilter === 'arrivals'
                    ? 'bg-white text-[#006591] font-bold shadow-sm'
                    : 'text-[#505f76] hover:text-[#0F172A]'
                }`}
              >
                Arrivals
              </button>
              <button
                onClick={() => setServiceFilter('departures')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  serviceFilter === 'departures'
                    ? 'bg-white text-[#006591] font-bold shadow-sm'
                    : 'text-[#505f76] hover:text-[#0F172A]'
                }`}
              >
                Departures
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-56">
              <Search className="w-4 h-4 text-[#6e7881] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search board..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#f7f9fb] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 w-full font-medium"
              />
            </div>
          </div>
        </div>

        {/* Clean Table Column Headers */}
        <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-[#f7f9fb] text-[11px] font-bold text-[#505f76] uppercase tracking-wider border-b border-[#E2E8F0] items-center">
          <div className="col-span-2">TRAIN NO</div>
          <div className="col-span-4">SERVICE NAME & CORRIDOR</div>
          <div className="col-span-2">SCHEDULED</div>
          <div className="col-span-2 text-[#006591]">EXPECTED ETA</div>
          <div className="col-span-1 text-center">PLATFORM</div>
          <div className="col-span-1 text-right">STATUS</div>
        </div>

        {/* Clean, Non-Noisy Table Rows */}
        {cleanTrainRows.length === 0 ? (
          <div className="py-16 text-center text-[#505f76] bg-white space-y-2">
            <div className="text-3xl">🚉</div>
            <div className="font-bold text-sm text-[#0F172A]">
              No Active Services Calling at {currentStation.name} ({stationCode})
            </div>
            <p className="text-xs text-[#6e7881] max-w-md mx-auto">
              There are currently no inbound or outbound coaching services scheduled at this station for the selected filter. Try selecting another major junction (e.g. NDLS, CSMT, PUNE, MAS, HWH).
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0] bg-white">
          {cleanTrainRows.map((row, idx) => {
            const isDelayed = row.delayMinutes > 5;
            const isWarning = row.delayMinutes > 0 && row.delayMinutes <= 5;

            return (
              <div 
                key={row.trainNumber || idx}
                className={`grid grid-cols-12 gap-3 px-6 py-4 items-center transition-all hover:bg-[#f7f9fb] border-l-4 ${
                  isDelayed 
                    ? 'border-l-[#EF4444] bg-white' 
                    : isWarning
                    ? 'border-l-[#F59E0B] bg-white'
                    : 'border-l-[#10B981] bg-white'
                }`}
              >
                {/* Train Number Badge */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#006591] bg-[#0ea5e9]/10 px-2.5 py-1 rounded-md border border-[#0ea5e9]/20">
                    #{row.trainNumber}
                  </span>
                </div>

                {/* Train Name & Corridor */}
                <div className="col-span-4">
                  <div className="font-bold text-xs text-[#0F172A] truncate">
                    {row.name}
                  </div>
                  <div className="text-[11px] text-[#505f76] flex items-center gap-1.5 mt-0.5">
                    <span>{row.originCode}</span>
                    <span className="text-[#6e7881]">→</span>
                    <span>{row.destinationCode}</span>
                    <span className="text-[10px] text-[#6e7881] ml-1 font-semibold">
                      ({row.isArrival ? 'Inbound' : 'Outbound'})
                    </span>
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="col-span-2 font-mono text-xs text-[#505f76] font-medium">
                  {row.scheduledFormatted}
                </div>

                {/* ML Predicted ETA */}
                <div className="col-span-2 flex items-center gap-1.5 font-mono text-xs font-bold">
                  <span className={isDelayed ? 'text-[#EF4444]' : isWarning ? 'text-[#F59E0B]' : 'text-[#006591]'}>
                    {row.predictedFormatted}
                  </span>
                  {isDelayed ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#EF4444]" title="Losing time" />
                  ) : isWarning ? (
                    <TrendingDown className="w-3.5 h-3.5 text-[#F59E0B]" title="Minor delay" />
                  ) : (
                    <span className="text-[#10B981] text-[10px]">✓</span>
                  )}
                </div>

                {/* Platform Number */}
                <div className="col-span-1 flex justify-center">
                  <span className="w-7 h-7 rounded-lg bg-[#f2f4f6] border border-[#E2E8F0] font-mono text-xs font-bold text-[#0F172A] flex items-center justify-center shadow-xs">
                    {row.platform}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="col-span-1 flex justify-end">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border whitespace-nowrap ${
                    isDelayed
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'
                      : isWarning
                      ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'
                      : 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
                  }`}>
                    {isDelayed ? `+${row.delayMinutes}m` : isWarning ? `+${row.delayMinutes}m` : 'ON TIME'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        )}

      </div>

    </div>
  );
}
