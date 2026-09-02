import React, { useRef, useEffect, useState } from 'react';
import { Clock, Zap, Gauge, Calendar, Check, X, RotateCcw } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';

export default function SimClockModal({ isOpen, onClose, simulatedTime }) {
  const modalRef = useRef(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(15);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSetSpeed = (multiplier) => {
    setSpeedMultiplier(multiplier);
    setSynced(true);
    setTimeout(() => setSynced(false), 1200);
  };

  const formattedDate = simulatedTime 
    ? new Date(simulatedTime).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
    : 'Tuesday, Sep 1, 2026';

  const timeStr = simulatedTime ? formatTime(simulatedTime) : '05:00 am';

  return (
    <div 
      ref={modalRef}
      className="absolute right-12 top-full mt-2 w-80 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden animate-fadeIn font-sans text-xs"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f7f9fb]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#006591]" />
          <span className="font-bold text-[#0F172A] text-sm">Simulation Clock</span>
        </div>
        <button 
          onClick={onClose}
          className="text-[#6e7881] hover:text-[#0F172A] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        
        {/* Large Time Display */}
        <div className="bg-[#f7f9fb] border border-[#E2E8F0] rounded-xl p-4 text-center space-y-1">
          <div className="text-[10px] font-bold text-[#505f76] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>OPERATIONAL TIMING</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {timeStr}
          </div>
          <div className="text-[11px] text-[#505f76] flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3 text-[#6e7881]" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Speed Multiplier Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#505f76] uppercase">
            <span>Simulation Warp Speed</span>
            <span className="font-mono text-[#006591] font-bold">{speedMultiplier}× Active</span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono">
            {[
              { label: 'Real-Time', val: 1 },
              { label: '15× Speed', val: 15 },
              { label: '24× Fast', val: 24 }
            ].map(m => (
              <button
                key={m.val}
                onClick={() => handleSetSpeed(m.val)}
                className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  speedMultiplier === m.val
                    ? 'bg-[#006591] text-white border-[#006591] shadow-sm'
                    : 'bg-[#f7f9fb] text-[#505f76] border-[#E2E8F0] hover:bg-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Toast */}
        {synced && (
          <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981] font-bold text-[11px] text-center flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Engine Synced to {speedMultiplier}× Multiplier!</span>
          </div>
        )}

      </div>
    </div>
  );
}
