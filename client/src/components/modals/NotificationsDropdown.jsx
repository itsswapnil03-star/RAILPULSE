import React, { useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Check, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsDropdown({ isOpen, onClose, alerts = [], onAcknowledgeAlert, onAcknowledgeAll }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      ref={dropdownRef} 
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden animate-fadeIn font-sans text-xs"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f7f9fb]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#006591]" />
          <span className="font-bold text-[#0F172A] text-sm">Active System Alerts</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-mono text-[10px] font-bold">
            {alerts.length}
          </span>
        </div>
        
        {alerts.length > 0 && (
          <button 
            onClick={onAcknowledgeAll}
            className="text-[11px] font-semibold text-[#0ea5e9] hover:text-[#006591] cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0] custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-[#505f76] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="font-bold text-xs text-[#0F172A]">All Clear! No Active Conflicts</div>
            <p className="text-[11px]">Suburban and corridor traffic flowing under normal headway buffers.</p>
          </div>
        ) : (
          alerts.map(alert => {
            const isHigh = alert.severity === 'high';
            return (
              <div key={alert.id} className="p-3.5 hover:bg-[#f7f9fb] transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-[#0F172A]">{alert.stationName} ({alert.stationCode})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    isHigh ? 'bg-[#EF4444] text-white' : 'bg-[#F59E0B] text-white'
                  }`}>
                    {isHigh ? 'HIGH RISK' : 'MEDIUM'}
                  </span>
                </div>

                <p className="text-[11px] text-[#505f76] leading-relaxed">
                  {alert.description}
                </p>

                <div className="p-2 bg-[#f2f4f6] rounded-md text-[10px] text-[#006591] font-semibold flex items-center justify-between">
                  <span className="truncate pr-2">{alert.recommendation}</span>
                  {onAcknowledgeAlert && (
                    <button 
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="shrink-0 text-[10px] text-[#505f76] hover:text-[#0F172A] font-bold underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#f7f9fb] border-t border-[#E2E8F0] text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/control');
          }}
          className="text-xs font-bold text-[#006591] hover:text-[#0ea5e9] flex items-center justify-center gap-1.5 w-full cursor-pointer"
        >
          <span>Open Full Control Room Alerts Desk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
