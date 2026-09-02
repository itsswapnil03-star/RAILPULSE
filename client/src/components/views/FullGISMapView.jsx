import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '../../context/SocketContext';
import { fetchStations } from '../../services/api';
import LiveGISMap from '../map/LiveGISMap';
import { 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  Plus, 
  Minus, 
  Radio, 
  Zap, 
  Clock,
  Train,
  Search,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { formatTime } from '../../utils/formatTime';
import { getTrainDelay, getDelayBadgeInfo } from '../../utils/trainUtils';

export default function FullGISMapView({ onSelectStation }) {
  const { trains, trainsList, networkStats, alerts } = useSocket();
  const [stations, setStations] = useState([]);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('22225');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStations() {
      try {
        const data = await fetchStations();
        setStations(data || []);
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadStations();
  }, []);

  // Filtered train list for quick switcher
  const filteredTrains = useMemo(() => {
    if (!searchQuery.trim()) return trainsList;
    const q = searchQuery.trim().toLowerCase();
    return trainsList.filter(t => 
      (t.trainNumber && t.trainNumber.toLowerCase().includes(q)) ||
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.originCode && t.originCode.toLowerCase().includes(q)) ||
      (t.destinationCode && t.destinationCode.toLowerCase().includes(q))
    );
  }, [trainsList, searchQuery]);

  const currentTrain = useMemo(() => {
    return trainsList.find(t => t.trainNumber === selectedTrainNumber) || trainsList[0] || null;
  }, [trainsList, selectedTrainNumber]);

  const currentDelay = getTrainDelay(currentTrain, trains);
  const currentBadge = getDelayBadgeInfo(currentDelay);

  const run = currentTrain?.currentRun || currentTrain || {};
  const currentSpeed = Math.round(run.currentSpeed || (currentDelay > 10 ? 65 : 110));
  const currentKm = Math.round(run.currentKm || 140);
  const totalKm = Math.round(run.totalKm || currentTrain?.totalKm || 192);
  const pct = Math.min(100, Math.round((currentKm / (totalKm || 1)) * 100)) || 72;

  return (
    <div className="space-y-4 font-sans">
      
      {/* 1. Train Selection Toolbar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0ea5e9]/10 text-[#006591] flex items-center justify-center font-bold">
              <Train className="w-5 h-5 text-[#006591]" />
            </div>
            <div>
              <h1 className="font-bold text-base text-[#0F172A]">
                Single Train Live Route Map
              </h1>
              <p className="text-xs text-[#505f76]">
                Select any train below to inspect its dedicated route and GPS telemetry
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#6e7881] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search train (e.g. 22225, 11008, Deccan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#f7f9fb] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 w-full font-medium"
            />
          </div>

        </div>

        {/* Quick-Select Train Pills Carousel with Identical Realistic Delays as Passenger View */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1 border-t border-[#E2E8F0]">
          {filteredTrains.map(t => {
            const isSelected = t.trainNumber === (currentTrain?.trainNumber || selectedTrainNumber);
            const trainDelay = getTrainDelay(t, trains);
            const badge = getDelayBadgeInfo(trainDelay);

            return (
              <button
                key={t.trainNumber}
                onClick={() => setSelectedTrainNumber(t.trainNumber)}
                className={`flex-none px-3.5 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#006591] text-white border-[#006591] shadow-sm ring-2 ring-[#0ea5e9]/20'
                    : 'bg-[#f7f9fb] text-[#0F172A] border-[#E2E8F0] hover:bg-white hover:border-[#0ea5e9]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-[#006591]'}`}>
                    #{t.trainNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : `${badge.pillBg} ${badge.textColor} border ${badge.pillBorder}`
                  }`}>
                    {trainDelay > 0 ? `+${trainDelay}m` : 'ON TIME'}
                  </span>
                </div>
                <div className={`text-xs font-semibold truncate max-w-[170px] ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                  {t.name}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#505f76]'}`}>
                  {t.originCode || 'CSMT'} → {t.destinationCode || 'SUR'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Map Container with Floating HUD */}
      <div className="relative w-full h-[calc(100vh-230px)] min-h-[540px] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm font-sans bg-[#f7f9fb]">
        
        {/* Floating Left Telemetry HUD for Selected Train */}
        {currentTrain && (
          <div className="absolute top-5 left-5 w-72 flex flex-col gap-3 z-20 pointer-events-none">
            <div className="glass-panel p-4 rounded-xl pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[10px] font-bold text-[#505f76] uppercase tracking-wider">LIVE TELEMETRY</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${currentBadge.pillBg} ${currentBadge.textColor} ${currentBadge.pillBorder}`}>
                  {currentDelay > 0 ? `DELAYED +${currentDelay}M` : 'ON TIME'}
                </span>
              </div>

              <div>
                <div className="font-bold text-sm text-[#0F172A]">{currentTrain.name}</div>
                <div className="text-xs text-[#505f76] mt-0.5">
                  Route: {currentTrain.originCode || 'CSMT'} → {currentTrain.destinationCode || 'SUR'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2 bg-[#f7f9fb] rounded-lg border border-[#E2E8F0]">
                  <div className="text-[10px] text-[#505f76] font-sans">SPEED</div>
                  <div className="font-bold text-[#0F172A] text-sm mt-0.5">{currentSpeed} km/h</div>
                </div>
                <div className="p-2 bg-[#f7f9fb] rounded-lg border border-[#E2E8F0]">
                  <div className="text-[10px] text-[#505f76] font-sans">PROGRESS</div>
                  <div className="font-bold text-[#006591] text-sm mt-0.5">{currentKm} / {totalKm} km</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#505f76] uppercase mb-1">
                  <span>Journey Completion</span>
                  <span className="font-mono text-[#006591]">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700" 
                    style={{ 
                      width: `${pct}%`,
                      backgroundColor: currentDelay > 10 ? '#EF4444' : currentDelay > 0 ? '#F59E0B' : '#10B981'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Full-Screen Interactive GIS Leaflet Map */}
        <div className="w-full h-full">
          <LiveGISMap 
            stations={stations}
            trains={trainsList}
            selectedTrainNumber={selectedTrainNumber}
            onSelectTrain={(num) => setSelectedTrainNumber(num)}
            height="100%"
          />
        </div>

      </div>

    </div>
  );
}