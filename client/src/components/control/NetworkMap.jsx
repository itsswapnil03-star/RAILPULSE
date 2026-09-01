import React from 'react';

const MAJOR_STATIONS = [
  { code: 'CSMT', name: 'Mumbai', km: 0 },
  { code: 'KYN', name: 'Kalyan', km: 54 },
  { code: 'LNL', name: 'Lonavala', km: 128 },
  { code: 'PUNE', name: 'Pune', km: 192 },
  { code: 'NK', name: 'Nashik', km: 280 },
  { code: 'DD', name: 'Daund', km: 380 },
  { code: 'BSL', name: 'Bhusawal', km: 500 },
  { code: 'SUR', name: 'Solapur', km: 620 },
  { code: 'AK', name: 'Akola', km: 740 },
  { code: 'NGP', name: 'Nagpur', km: 860 },
  { code: 'G', name: 'Gondia', km: 967 }
];

export default function NetworkMap({ trains = [], onSelectTrain }) {
  const mapWidth = 900;
  const mapHeight = 160;
  const paddingX = 45;
  const trackLength = mapWidth - (paddingX * 2);
  const maxKm = 967;

  const getX = (km) => paddingX + (Math.max(0, Math.min(maxKm, km)) / maxKm) * trackLength;

  return (
    <div className="w-full h-full min-h-[160px] flex items-center justify-center bg-[#080d16] rounded-lg overflow-hidden relative border border-[#1d2a41]">
      {/* Decorative subtle background grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#1d2a41 1px, transparent 1px), linear-gradient(90deg, #1d2a41 1px, transparent 1px)', 
          backgroundSize: '16px 16px' 
        }} 
      />
      
      <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-full relative z-10 select-none">
        
        {/* Glow Filters */}
        <defs>
          <filter id="glow-ok" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-warn" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-crit" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Double Track Lines (UP/DOWN) */}
        {/* Base Track */}
        <line x1={paddingX} y1={mapHeight / 2 - 12} x2={mapWidth - paddingX} y2={mapHeight / 2 - 12} stroke="#1d2a41" strokeWidth="3" strokeLinecap="round" />
        <line x1={paddingX} y1={mapHeight / 2 + 12} x2={mapWidth - paddingX} y2={mapHeight / 2 + 12} stroke="#1d2a41" strokeWidth="3" strokeLinecap="round" />
        
        {/* Glowing Active Route Signals */}
        <line x1={paddingX} y1={mapHeight / 2 - 12} x2={mapWidth - paddingX} y2={mapHeight / 2 - 12} stroke="#4c9aff" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.6" className="animate-[pulse_3s_linear_infinite]" />
        <line x1={paddingX} y1={mapHeight / 2 + 12} x2={mapWidth - paddingX} y2={mapHeight / 2 + 12} stroke="#4c9aff" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.6" className="animate-[pulse_4s_linear_infinite]" />

        {/* Stations */}
        {MAJOR_STATIONS.map((st) => {
          const x = getX(st.km);
          return (
            <g key={st.code} className="group">
              {/* Station tick bar */}
              <line x1={x} y1={mapHeight / 2 - 22} x2={x} y2={mapHeight / 2 + 22} stroke="#1d2a41" strokeWidth="2" />
              <circle cx={x} cy={mapHeight / 2 - 12} r="3" fill="#0e1725" stroke="#4c9aff" strokeWidth="1.5" />
              <circle cx={x} cy={mapHeight / 2 + 12} r="3" fill="#0e1725" stroke="#4c9aff" strokeWidth="1.5" />
              
              {/* Station Code (Top) */}
              <text x={x} y={mapHeight / 2 - 32} textAnchor="middle" className="text-[10px] font-bold fill-[#8ba0be] font-mono tracking-wider">
                {st.code}
              </text>
              {/* Station Name (Bottom) */}
              <text x={x} y={mapHeight / 2 + 38} textAnchor="middle" className="text-[9px] font-medium fill-[#5b718f]">
                {st.name}
              </text>
            </g>
          );
        })}

        {/* Live Trains */}
        {trains.map((t) => {
          const isUp = t.direction === 'UP';
          const x = getX(t.currentKm || 0);
          const y = isUp ? mapHeight / 2 - 12 : mapHeight / 2 + 12;
          
          let fill = '#2ecc8f'; // on time
          let filter = 'url(#glow-ok)';
          if (t.currentDelay > 20) { fill = '#f0576f'; filter = 'url(#glow-crit)'; }
          else if (t.currentDelay > 5) { fill = '#f5a524'; filter = 'url(#glow-warn)'; }

          return (
            <g 
              key={t.trainNumber} 
              className="cursor-pointer transition-all duration-300 hover:scale-125" 
              onClick={() => onSelectTrain && onSelectTrain(t.trainNumber)}
            >
              {/* Ping wave */}
              <circle cx={x} cy={y} r="8" fill={fill} opacity="0.2" className="animate-ping" />
              {/* Outer train node */}
              <circle cx={x} cy={y} r="5.5" fill={fill} filter={filter} />
              <circle cx={x} cy={y} r="2" fill="#fff" />
              
              {/* Train number pill badge */}
              <g transform={`translate(${x}, ${isUp ? y - 16 : y + 16})`}>
                <rect x="-16" y="-7" width="32" height="13" rx="3" fill="#141f31" stroke={fill} strokeWidth="0.8" opacity="0.95" />
                <text x="0" y="3" textAnchor="middle" className="text-[8px] font-bold fill-[#e9eff9] font-mono">
                  {t.trainNumber}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
