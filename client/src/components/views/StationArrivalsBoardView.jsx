import React, { useState, useEffect, useMemo } from 'react';
import { fetchStations, fetchStationBoard } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import { 
  Monitor, 
  Clock, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Radio
} from 'lucide-react';

import { useSocket } from '../../context/SocketContext';

export default function StationArrivalsBoardView({ initialStationCode = 'CSMT' }) {
  const { simulatedTime, connected } = useSocket();
  const [stations, setStations] = useState([]);
  const [stationCode, setStationCode] = useState(initialStationCode);
  const [boardData, setBoardData] = useState(null);
  const [activeTab, setActiveTab] = useState('arrivals'); // 'arrivals' | 'departures'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [istTime, setIstTime] = useState('');

  // Top Popular Hubs
  const popularHubs = [
    { code: 'CSMT', name: 'Mumbai CSMT' },
    { code: 'PUNE', name: 'Pune Jn' },
    { code: 'KYN', name: 'Kalyan' },
    { code: 'TNA', name: 'Thane' },
    { code: 'NK', name: 'Nashik' },
    { code: 'NGP', name: 'Nagpur' },
    { code: 'SUR', name: 'Solapur' },
    { code: 'KOP', name: 'Kolhapur' },
    { code: 'AWB', name: 'Chh. Sambhajinagar' },
    { code: 'RN', name: 'Ratnagiri' }
  ];

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      setIstTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Stations
  useEffect(() => {
    async function loadStations() {
      try {
        const data = await fetchStations();
        setStations(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadStations();
  }, []);

  // Reactive Board Data fetch on simulated time tick / stationCode change
  useEffect(() => {
    let isMounted = true;
    async function loadBoard() {
      try {
        const data = await fetchStationBoard(stationCode);
        if (isMounted) setBoardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBoard();
    return () => {
      isMounted = false;
    };
  }, [stationCode, simulatedTime]);

  const arrivalsList = useMemo(() => {
    if (!boardData?.arrivals) return [];
    return boardData.arrivals.filter(item => {
      const matchSearch = 
        item.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.from && item.from.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.to && item.to.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [boardData, searchQuery]);

  const currentStationName = boardData?.station?.name || popularHubs.find(h => h.code === stationCode)?.name || stationCode;

  return (
    <div className="space-y-4">
      
      {/* Station Selector Header & Hub Chips */}
      <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#141f31] border border-[#1d2a41] text-[#4c9aff]">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#8ba0be] uppercase">
                STATION BOARD
              </div>
              <h1 className="text-2xl font-extrabold text-[#e9eff9] font-sans">
                {currentStationName} ({stationCode})
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Search station dropdown */}
            <select
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value)}
              className="bg-[#141f31] border border-[#1d2a41] text-[#e9eff9] text-xs rounded-lg px-3 py-2 font-mono outline-none cursor-pointer focus:border-[#4c9aff]"
            >
              {stations.map(s => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>

            {/* Live IST clock */}
            <div className="bg-[#141f31] border border-[#1d2a41] px-3 py-1.5 rounded-lg text-right font-mono">
              <div className="text-[9px] text-[#5b718f] uppercase">LIVE IST</div>
              <div className="text-base font-bold text-[#f5a524]">{istTime || '12:00:00'}</div>
            </div>

          </div>
        </div>

        {/* Popular Station Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          <span className="text-[10px] font-mono text-[#5b718f] uppercase shrink-0 mr-1">Hubs:</span>
          {popularHubs.map(hub => (
            <button
              key={hub.code}
              onClick={() => setStationCode(hub.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
                stationCode === hub.code
                  ? 'bg-[#4c9aff] text-[#080d16] font-bold shadow-[0_0_12px_rgba(76,154,255,0.3)]'
                  : 'bg-[#141f31] text-[#8ba0be] hover:text-[#e9eff9] hover:bg-[#1d2a41] border border-[#1d2a41]'
              }`}
            >
              {hub.name} ({hub.code})
            </button>
          ))}
        </div>
      </div>

      {/* Main Board View: Arrivals / Departures Tabs & List */}
      <div className="bg-[#0e1725] border border-[#1d2a41] rounded-2xl p-5 shadow-xl space-y-4">
        
        {/* Navigation Tabs (Arrivals vs Departures) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d2a41] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('arrivals')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'arrivals'
                  ? 'bg-[#141f31] text-[#e9eff9] border border-[#4c9aff] shadow-[0_0_10px_rgba(76,154,255,0.2)]'
                  : 'text-[#8ba0be] hover:text-[#e9eff9]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#2ecc8f]" />
              Arrivals ({arrivalsList.length})
            </button>

            <button
              onClick={() => setActiveTab('departures')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'departures'
                  ? 'bg-[#141f31] text-[#e9eff9] border border-[#4c9aff] shadow-[0_0_10px_rgba(76,154,255,0.2)]'
                  : 'text-[#8ba0be] hover:text-[#e9eff9]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#4c9aff]" />
              Departures
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5b718f]" />
            <input
              type="text"
              placeholder="Filter incoming train..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141f31] border border-[#1d2a41] rounded-lg pl-8 pr-3 py-1 text-xs text-[#e9eff9] placeholder-[#5b718f] font-mono outline-none focus:border-[#4c9aff]"
            />
          </div>
        </div>

        {/* Board Cards Grid (Matching User Mockup Column 2 Design) */}
        {loading && arrivalsList.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-[#8ba0be]">
            Loading platform telemetry feed...
          </div>
        ) : arrivalsList.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-[#8ba0be]">
            No train services scheduled for this station in current operational window.
          </div>
        ) : (
          <div className="space-y-3">
            {arrivalsList.map((item, idx) => {
              const delay = item.delayMinutes || 0;
              const isDelayed = delay > 5;
              const isArrived = item.status === 'Arrived' || item.status === 'Departed';
              const platformNum = ((idx % 6) + 1);

              return (
                <div
                  key={item.trainNumber + idx}
                  className="bg-[#141f31]/60 hover:bg-[#141f31] border border-[#1d2a41] hover:border-[#4c9aff]/40 rounded-xl p-4 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Status Badge & Train Info */}
                  <div className="flex items-start gap-4">
                    
                    {/* Status Pill */}
                    <div className="shrink-0">
                      {isArrived ? (
                        <div className="px-2.5 py-1 rounded bg-[#2ecc8f]/20 text-[#2ecc8f] font-mono font-bold text-[10px] uppercase border border-[#2ecc8f]/30">
                          ARRIVED
                        </div>
                      ) : isDelayed ? (
                        <div className="px-2.5 py-1 rounded bg-[#f5a524]/20 text-[#f5a524] font-mono font-bold text-[10px] uppercase border border-[#f5a524]/30 flex items-center gap-1">
                          <span>DELAYED</span>
                          <span>+{delay}M</span>
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded bg-[#2ecc8f]/20 text-[#2ecc8f] font-mono font-bold text-[10px] uppercase border border-[#2ecc8f]/30">
                          ON TIME
                        </div>
                      )}
                    </div>

                    {/* Train Name & Route */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#4c9aff]">
                          Exp {item.trainNumber}
                        </span>
                        <h3 className="text-sm font-bold text-[#e9eff9]">
                          {item.trainName}
                        </h3>
                      </div>
                      <div className="text-[11px] font-mono text-[#8ba0be] mt-0.5">
                        {item.from || 'CSMT'} → {item.to || 'SUR'}
                      </div>
                    </div>

                  </div>

                  {/* Right: Platform & Time Schedules */}
                  <div className="flex items-center justify-between md:justify-end gap-6 font-mono">
                    
                    {/* Platform Badge */}
                    <div className="text-right">
                      <div className="text-[10px] text-[#5b718f] uppercase">Platform</div>
                      <div className="text-xl font-extrabold text-[#4c9aff]">
                        {platformNum}
                      </div>
                    </div>

                    {/* Scheduled vs Predicted Arrival Times */}
                    <div className="text-right min-w-[130px]">
                      <div className="text-[10px] text-[#8ba0be]">
                        Sch. Arrival: <span className="text-[#e9eff9] font-medium">{item.scheduledTime || '--:--'}</span>
                      </div>
                      <div className="text-xs font-bold text-[#e9eff9] mt-0.5">
                        Predicted: <span className={isDelayed ? 'text-[#f5a524]' : 'text-[#2ecc8f]'}>{item.predictedTime || item.scheduledTime}</span>
                      </div>
                    </div>

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