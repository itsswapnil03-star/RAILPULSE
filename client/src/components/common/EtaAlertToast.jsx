import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Smartphone, 
  X, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { triggerTestNotification } from '../../services/api';

export default function EtaAlertToast() {
  const socket = useSocket();
  const [activeAlert, setActiveAlert] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null); // 'sms' | 'whatsapp' | null
  const [testSending, setTestSending] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleEtaAlert = (data) => {
      setActiveAlert(data);
      setHistory(prev => [data, ...prev.slice(0, 15)]);
      // Auto dismiss banner after 12s if user doesn't interact
      const timer = setTimeout(() => {
        setActiveAlert(current => (current?.id === data.id ? null : current));
      }, 12000);
      return () => clearTimeout(timer);
    };

    socket.on('notification:eta_alert', handleEtaAlert);
    return () => {
      socket.off('notification:eta_alert', handleEtaAlert);
    };
  }, [socket]);

  async function handleSendTestAlert() {
    setTestSending(true);
    try {
      await triggerTestNotification({
        delayDelta: 16,
        reason: 'Downstream freight crossing loop line at Karjat Junction'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setTestSending(false), 600);
    }
  }

  return (
    <>
      {/* Floating Alert Banner */}
      {activeAlert && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-amber-500/40 animate-slideDown font-sans text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block">
                  Passenger ETA Drift Alert
                </span>
                <span className="font-bold text-slate-100 text-sm">{activeAlert.trainName}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Station Impact:</span>
              <span className="font-bold text-white font-mono">{activeAlert.stationName} ({activeAlert.stationCode})</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Schedule vs Revised ETA:</span>
              <div className="font-mono">
                <span className="text-slate-400 line-through mr-1.5">{activeAlert.scheduledTime}</span>
                <span className="font-bold text-amber-400">{activeAlert.newETA}</span>
                <span className="ml-1 text-[10px] text-amber-300 font-bold">(+{activeAlert.driftMinutes}m)</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 border-t border-slate-700/60 pt-1.5">
              <span className="text-slate-400">Cause:</span> {activeAlert.reason}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setSelectedChannel('whatsapp')}
              className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Alert</span>
            </button>
            <button
              onClick={() => setSelectedChannel('sms')}
              className="flex-1 py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS Broadcast</span>
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Preview Modal */}
      {selectedChannel && activeAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden font-sans text-xs">
            <div className={`p-4 text-white flex items-center justify-between ${
              selectedChannel === 'whatsapp' ? 'bg-emerald-700' : 'bg-indigo-700'
            }`}>
              <div className="flex items-center gap-2">
                {selectedChannel === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                <div>
                  <h3 className="font-bold text-sm">
                    {selectedChannel === 'whatsapp' ? 'Simulated WhatsApp Passenger Broadcast' : 'Simulated RailAlert SMS Gateway'}
                  </h3>
                  <span className="text-[10px] text-white/80">Dispatched automatically when predicted ETA drift &gt; 10 min</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedChannel(null)}
                className="text-white/80 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 bg-slate-50">
              {/* Phone Mockup Screen */}
              <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-inner space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] text-slate-400 font-mono">
                  <span>To: +91 98200 XXXXX (Ticket PNR #4928104812)</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className={`p-3 rounded-xl text-xs font-mono whitespace-pre-line leading-relaxed ${
                  selectedChannel === 'whatsapp' 
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {selectedChannel === 'whatsapp' ? activeAlert.channels?.whatsapp : activeAlert.channels?.sms}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-950">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Proactive Commuter Communication Protocol</span>
                </div>
                <p className="text-slate-600 leading-normal">
                  Passengers booked on upcoming halts receive real-time calibrated predictions directly on SMS/WhatsApp gateways, reducing platform overcrowding and enquiry booth congestion.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedChannel(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
