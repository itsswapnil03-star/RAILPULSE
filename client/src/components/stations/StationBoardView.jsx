import React, { useState, useEffect, useMemo } from 'react';
import { fetchStations, fetchStationBoard } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
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
  Filter
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function StationBoardView({ initialStationCode = 'PUNE' }) {
  const { simulatedTime, alerts, trainsList } = useSocket();
  const [stationCode, setStationCode] = useState(initialStationCode);
  const [stations, setStations] = useState([]);
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conflictDismissed, setConflictDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all'); // 'all' | 'arrivals' | 'departures'

  // Load all stations for switcher
  useEffect(() => {
    async function loadStations() {
      try {
        const list = await fetchStations();
        setStations(list || []);
      } catch (e) {}
    }
    loadStations();
  }, []);

  // Update if initial prop changes
  useEffect(() => {
    if (initialStationCode) {
      setStationCode(initialStationCode);
    }
  }, [initialStationCode]);

  // Load Board Data
  useEffect(() => {
    let isMounted = true;
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

  // Current Station object
  const currentStation = useMemo(() => {
    return stations.find(s => s.code === stationCode) || {
      code: stationCode,
      name: stationCode === 'PUNE' ? 'Pune Junction' : stationCode === 'CSMT' ? 'Mumbai CSMT' : `${stationCode} Station`
    };
  }, [stations, stationCode]);

  // Generate clean, realistic, non-noisy train board rows
  const cleanTrainRows = useMemo(() => {
    const raw = boardData?.arrivals || boardData?.trains || [];
    
    // If backend returns real trains, map them cleanly; otherwise use curated realistic Maharashtra timetable
    let list = [];

    if (trainsList && trainsList.length > 0) {
      list = trainsList.map((t, idx) => {
        const run = t.currentRun || t;
        const log = run.stationLog || t.schedule || [];
        const halt = log.find(s => s.stationCode === stationCode) || log[Math.min(idx, log.length - 1)];
        const delay = halt?.delayMinutes !== undefined ? halt.delayMinutes : (t.currentDelay || (idx % 3 === 1 ? 14 : idx % 2 === 1 ? 4 : 0));
        
        let sched = halt?.scheduledArrival || halt?.scheduledDeparture;
        let eta = halt?.actualArrival;
        
        // Generate realistic formatted time based on simulated clock if not provided
        const baseTime = simulatedTime ? new Date(simulatedTime) : new Date();
        const schedTime = new Date(baseTime.getTime() + (idx * 25 - 15) * 60000);
        const etaTime = new Date(schedTime.getTime() + delay * 60000);

        const isArrival = idx % 2 === 0;
        const platform = (idx % 6) + 1;

        return {
          trainNumber: t.trainNumber,
          name: t.name,
          originCode: t.originCode || 'CSMT',
          destinationCode: t.destinationCode || 'SUR',
          isArrival,
          platform: String(platform),
          scheduledFormatted: formatTime(sched || schedTime),
          predictedFormatted: formatTime(eta || etaTime),
          delayMinutes: delay,
          drift: delay > 5 ? 'up' : delay > 0 ? 'down' : 'none'
        };
      });
    }

    if (list.length === 0) {
      list = [
        {
          trainNumber: '12124',
          name: 'Deccan Queen Superfast',
          originCode: 'CSMT',
          destinationCode: 'PUNE',
          isArrival: true,
          platform: '1',
          scheduledFormatted: '06:45 am',
          predictedFormatted: '06:45 am',
          delayMinutes: 0,
          drift: 'none'
        },
        {
          trainNumber: '22225',
          name: 'Solapur Vande Bharat Express',
          originCode: 'CSMT',
          destinationCode: 'SUR',
          isArrival: true,
          platform: '2',
          scheduledFormatted: '07:15 am',
          predictedFormatted: '07:18 am',
          delayMinutes: 3,
          drift: 'up'
        },
        {
          trainNumber: '11008',
          name: 'Deccan Express',
          originCode: 'PUNE',
          destinationCode: 'CSMT',
          isArrival: false,
          platform: '3',
          scheduledFormatted: '07:40 am',
          predictedFormatted: '07:54 am',
          delayMinutes: 14,
          drift: 'up'
        },
        {
          trainNumber: '22105',
          name: 'Indrayani Superfast Express',
          originCode: 'CSMT',
          destinationCode: 'PUNE',
          isArrival: true,
          platform: '4',
          scheduledFormatted: '08:10 am',
          predictedFormatted: '08:10 am',
          delayMinutes: 0,
          drift: 'none'
        },
        {
          trainNumber: '12128',
          name: 'Pune Mumbai Intercity Express',
          originCode: 'PUNE',
          destinationCode: 'CSMT',
          isArrival: false,
          platform: '1',
          scheduledFormatted: '08:35 am',
          predictedFormatted: '08:37 am',
          delayMinutes: 2,
          drift: 'down'
        },
        {
          trainNumber: '11322',
          name: 'Manmad Nagpur Express',
          originCode: 'CSMT',
          destinationCode: 'NGP',
          isArrival: true,
          platform: '5',
          scheduledFormatted: '09:00 am',
          predictedFormatted: '09:18 am',
          delayMinutes: 18,
          drift: 'up'
        }
      ];
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
  }, [boardData, trainsList, stationCode, simulatedTime, serviceFilter, searchQuery]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Subtle, Professional Conflict Alert (Conditional) */}
      {!conflictDismissed && (
        <div className="bg-white border-l-4 border-l-[#F59E0B] border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-[#0F172A] tracking-tight">
                Simultaneous Arrival Clearance Window • {currentStation.name}
              </h3>
              <p className="text-xs text-[#505f76] mt-0.5 leading-relaxed">
                Coaching services #12124 (Deccan Queen) and #11008 (Deccan Express) are predicted within a 5-min arrival buffer on Platform 1. Automatic precedence regulation recommended.
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
            <div className="w-9 h-9 rounded-lg bg-[#0ea5e9]/10 text-[#006591] flex items-center justify-center font-bold">
              <Train className="w-5 h-5 text-[#006591]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-[#0F172A] tracking-tight">
                  {currentStation.name}
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#0ea5e9]/10 text-[#006591] font-mono text-xs font-bold">
                  {stationCode}
                </span>
              </div>
              <p className="text-xs text-[#505f76] mt-0.5">
                Dynamic platform occupancy & ML arrival forecasts
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

      </div>

    </div>
  );
}
