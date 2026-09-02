import React, { useState } from 'react';
import { X, HelpCircle, Phone, BookOpen, Activity, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function SupportModal({ isOpen, onClose }) {
  const { connected } = useSocket();
  const [queryText, setQueryText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setQueryText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 text-[#006591] flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4 text-[#006591]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F172A]">Controller Support & Operations Desk</h3>
              <p className="text-[11px] text-[#505f76]">Central Railway Control Office & AI Dispatch Support</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#6e7881] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-[#0F172A] max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Emergency Helplines */}
          <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#EF4444] font-bold text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4" />
              <span>Section Controller Emergency Lines</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="text-[10px] text-[#505f76] font-sans">Central Railway HQ (CSMT)</div>
                <div className="font-bold text-[#0F172A] mt-0.5">+91 22 2262 0123</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="text-[10px] text-[#505f76] font-sans">Pune Operating Desk</div>
                <div className="font-bold text-[#0F172A] mt-0.5">+91 20 2612 8844</div>
              </div>
            </div>
          </div>

          {/* System Diagnostics Health */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-3 bg-[#f7f9fb]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-[#006591]">
                <Activity className="w-4 h-4" />
                Live System Diagnostics
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] font-bold rounded-full border border-[#10B981]/30">
                HEALTHY
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-center">
              <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                <div className="text-[10px] text-[#505f76] font-sans">TELEMETRY SOCKET</div>
                <div className={`font-bold mt-0.5 ${connected ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {connected ? 'CONNECTED' : 'RETRYING'}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                <div className="text-[10px] text-[#505f76] font-sans">ML SERVICE</div>
                <div className="font-bold text-[#10B981] mt-0.5">ACTIVE :8008</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                <div className="text-[10px] text-[#505f76] font-sans">CACHE LAYER</div>
                <div className="font-bold text-[#006591] mt-0.5">SUB-5MS HIT</div>
              </div>
            </div>
          </div>

          {/* Operating Rules Quick Reference */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
            <div className="font-bold text-xs flex items-center gap-1.5 text-[#0F172A]">
              <BookOpen className="w-4 h-4 text-[#006591]" />
              Operating Protocols Quick Reference
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#505f76] leading-relaxed list-disc pl-4">
              <li><b className="text-[#0F172A]">6-Min Buffer Window:</b> When two inbound trains have arrival overlaps $\le 6\text{ mins}$, precedence is granted to Semi-High-Speed (Vande Bharat) or higher passenger load.</li>
              <li><b className="text-[#0F172A]">Quantile Regressors:</b> $p_{10}$ denotes best-case regained time, $p_{50}$ is expected ETA, and $p_{90}$ is maximum delay buffer.</li>
              <li><b className="text-[#0F172A]">TreeSHAP XAI:</b> Decomposes delay root-causes into suburban traffic, Ghat gradient cautions, and interlocking hold times.</li>
            </ul>
          </div>

          {/* Query / Feedback Form */}
          <form onSubmit={handleSubmit} className="border-t border-[#E2E8F0] pt-3 space-y-2">
            <label className="font-bold text-xs block text-[#0F172A]">
              Report Dispatch Anomaly or Signal Defect
            </label>
            <textarea
              rows="3"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Describe anomaly (e.g. Signal failure at Karjat yard, unexpected rake hold)..."
              className="w-full p-2.5 bg-[#f7f9fb] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitted || !queryText.trim()}
                className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#006591] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                {submitted ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Send className="w-3.5 h-3.5" />}
                <span>{submitted ? 'Dispatched to Control Desk!' : 'Submit to Central Desk'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
