import React, { useState, useEffect } from 'react';
import StationSelector from './StationSelector';
import ArrivalBoard from './ArrivalBoard';
import { useSocket } from '../../context/SocketContext';
import { formatTime } from '../../utils/formatTime';
import { Monitor, Clock, Radio } from 'lucide-react';

export default function StationBoardView() {
  const [stationCode, setStationCode] = useState('CSMT');
  const { simulatedTime } = useSocket();
  const [istTime, setIstTime] = useState('');

  const quickStations = [
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

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#080d16] text-[#e9eff9] flex flex-col font-sans p-4">
      <div className="max-w-[1500px] mx-auto w-full flex-1 flex flex-col gap-4">
        
        {/* Board Header */}
        <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#141f31] border border-[#1d2a41]">
              <Monitor className="w-5 h-5 text-[#4c9aff]" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#8ba0be]">INDIAN RAILWAYS PASSENGER DISPLAY BOARD</div>
              <h1 className="text-xl font-bold font-mono text-[#e9eff9]">Platform Display System</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StationSelector value={stationCode} onChange={setStationCode} />

            <div className="bg-[#141f31] border border-[#1d2a41] px-3.5 py-1.5 rounded-lg text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5b718f]">IST CLOCK</div>
              <div className="text-xl font-mono font-bold text-[#f5a524]">
                {istTime || '12:00:00'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Station Hub Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          <span className="text-[11px] font-mono text-[#5b718f] uppercase mr-1 shrink-0">Popular Hubs:</span>
          {quickStations.map(st => (
            <button
              key={st.code}
              onClick={() => setStationCode(st.code)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
                stationCode === st.code
                  ? 'bg-[#4c9aff] text-[#080d16] font-bold shadow-md'
                  : 'bg-[#141f31] text-[#8ba0be] hover:text-[#e9eff9] hover:bg-[#1d2a41] border border-[#1d2a41]'
              }`}
            >
              {st.name} ({st.code})
            </button>
          ))}
        </div>

        {/* Board Content */}
        <div className="bg-[#0e1725] border border-[#1d2a41] rounded-xl p-5 shadow-xl flex-1">
          <ArrivalBoard stationCode={stationCode} />
        </div>

      </div>
    </div>
  );
}
