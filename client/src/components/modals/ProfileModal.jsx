import React, { useRef, useEffect, useState } from 'react';
import { User, Shield, Radio, Clock, Check, X, LogOut, Key } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const [onDuty, setOnDuty] = useState(true);

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

  return (
    <div 
      ref={modalRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden animate-fadeIn font-sans text-xs"
    >
      {/* Profile Header */}
      <div className="p-4 bg-gradient-to-r from-[#006591] to-[#0ea5e9] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white text-[#006591] font-black text-base flex items-center justify-center shadow-md">
            SC
          </div>
          <div>
            <h4 className="font-bold text-sm">Swapnil</h4>
            <p className="text-[11px] text-white/80">Lead Section Controller</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Details */}
      <div className="p-4 space-y-3">
        
        {/* Duty Status Badge */}
        <div className="flex items-center justify-between p-2.5 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0]">
          <div>
            <div className="text-[10px] font-bold text-[#505f76] uppercase">DESK ROSTER STATUS</div>
            <div className="font-bold text-xs text-[#0F172A] mt-0.5">
              {onDuty ? 'Active On Duty' : 'Shift Handover'}
            </div>
          </div>
          <button
            onClick={() => setOnDuty(!onDuty)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              onDuty 
                ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
            }`}
          >
            {onDuty ? '● ON DUTY' : '○ HANDOVER'}
          </button>
        </div>

        {/* Console Specifications */}
        <div className="space-y-2 text-xs divide-y divide-[#E2E8F0]">
          <div className="pt-2 flex justify-between">
            <span className="text-[#505f76]">Division:</span>
            <span className="font-semibold text-[#0F172A]">Central Railway (Pune)</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="text-[#505f76]">Controlled Section:</span>
            <span className="font-semibold text-[#0F172A]">North Corridor & Bhor Ghat</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="text-[#505f76]">Active Roster:</span>
            <span className="font-semibold text-[#0F172A]">06:00 – 14:00 IST (Shift 1)</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="text-[#505f76]">Signal Desk ID:</span>
            <span className="font-mono font-semibold text-[#006591]">CR-PUNE-DESK-04</span>
          </div>
        </div>

        {/* Lock / Close Console */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="w-full py-2 px-3 rounded-lg bg-[#f7f9fb] hover:bg-[#E2E8F0] text-[#505f76] hover:text-[#0F172A] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Lock Dispatch Console</span>
          </button>
        </div>

      </div>
    </div>
  );
}
