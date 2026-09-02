import React, { useState, useEffect } from 'react';
import { X, Settings, Bell, Sliders, Map, ShieldCheck, Check, RotateCcw } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [audioAlerts, setAudioAlerts] = useState(() => {
    return localStorage.getItem('railmind_audio_alerts') === 'true';
  });
  const [autoPanMap, setAutoPanMap] = useState(() => {
    return localStorage.getItem('railmind_autopan') !== 'false';
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return localStorage.getItem('railmind_refresh') || '1';
  });
  const [conflictBuffer, setConflictBuffer] = useState(() => {
    return localStorage.getItem('railmind_buffer') || '6';
  });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('railmind_audio_alerts', audioAlerts);
    localStorage.setItem('railmind_autopan', autoPanMap);
    localStorage.setItem('railmind_refresh', refreshInterval);
    localStorage.setItem('railmind_buffer', conflictBuffer);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setAudioAlerts(false);
    setAutoPanMap(true);
    setRefreshInterval('1');
    setConflictBuffer('6');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 text-[#006591] flex items-center justify-center font-bold">
              <Settings className="w-4 h-4 text-[#006591]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F172A]">System Settings</h3>
              <p className="text-[11px] text-[#505f76]">RailMind dispatch & telemetry preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#6e7881] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs text-[#0F172A]">
          
          {/* Audio Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-[#006591]" />
                Audio Conflict Alerts
              </div>
              <div className="text-[11px] text-[#505f76]">Play acoustic tone on high-risk conflict detection</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#bec8d2] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ea5e9]"></div>
            </label>
          </div>

          {/* Auto-pan map */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-2">
                <Map className="w-3.5 h-3.5 text-[#006591]" />
                GIS Map Auto-Pan
              </div>
              <div className="text-[11px] text-[#505f76]">Auto-center camera on train selection in live map</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoPanMap}
                onChange={(e) => setAutoPanMap(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#bec8d2] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ea5e9]"></div>
            </label>
          </div>

          {/* Telemetry Refresh Rate */}
          <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
            <label className="font-bold text-sm flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#006591]" />
              Telemetry Broadcast Interval
            </label>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              {['1', '2', '5'].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setRefreshInterval(sec)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    refreshInterval === sec
                      ? 'bg-[#006591] text-white border-[#006591] shadow-sm'
                      : 'bg-[#f7f9fb] text-[#505f76] border-[#E2E8F0] hover:bg-white'
                  }`}
                >
                  {sec} Second{sec !== '1' ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Conflict Headway Buffer */}
          <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
            <label className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006591]" />
              Platform Conflict Buffer Window
            </label>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              {['5', '6', '10'].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setConflictBuffer(mins)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    conflictBuffer === mins
                      ? 'bg-[#006591] text-white border-[#006591] shadow-sm'
                      : 'bg-[#f7f9fb] text-[#505f76] border-[#E2E8F0] hover:bg-white'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-[#f7f9fb]">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#505f76] hover:text-[#0F172A] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-bold text-[#505f76] hover:bg-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#0ea5e9] hover:bg-[#006591] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
