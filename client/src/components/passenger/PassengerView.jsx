import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { fetchPredictions, fetchTrain } from '../../services/api';
import { formatTime } from '../../utils/formatTime';
import { 
  Train, 
  Search, 
  Clock, 
  Zap, 
  Check, 
  Activity, 
  Gauge, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Navigation,
  X,
  AlertTriangle
} from 'lucide-react';

import { getTrainDelay as getTrainDelayUtil, getDelayBadgeInfo } from '../../utils/trainUtils';
import EtaAlertToast from '../common/EtaAlertToast';

const TRANSLATIONS = {
  en: {
    title: 'Your Journey',
    subtitle: 'Live tracking and ML predictions across Indian Railways',
    liveUpdates: 'LIVE UPDATES ACTIVE',
    searchPlaceholder: 'Search train (e.g. 22225, Solapur, Vande Bharat)...',
    allCategory: 'All',
    runningNow: 'Running Now',
    vandeBharat: 'Vande Bharat',
    superfast: 'Superfast & Intercity',
    activeTrip: 'ACTIVE TRIP',
    liveSpeed: 'Live Speed',
    onTime: 'ON TIME',
    delayed: 'DELAYED',
    selectTrain: 'Select Train',
    scrollHint: 'Scroll horizontally →',
    telemetry: 'TELEMETRY & KINEMATICS',
    kmh: 'KM/H',
    complete: 'COMPLETE',
    nextStation: 'NEXT STATION PREDICTION',
    timetable: 'ML TIMETABLE',
    departed: 'Departed',
    eta: 'ETA',
    mlPrediction: 'ML PREDICTION',
    mins: 'MINS'
  },
  hi: {
    title: 'आपकी रेल यात्रा',
    subtitle: 'भारतीय रेल हेतु रियल-टाइम ट्रैकिंग एवं एआई आगमन पूर्वानुमान',
    liveUpdates: 'लाइव अपडेट सक्रिय',
    searchPlaceholder: 'गाड़ी खोजें (उदा. 22225, सोलापुर, वंदे भारत)...',
    allCategory: 'सभी गाड़ियाँ',
    runningNow: 'वर्तमान में गतिमान',
    vandeBharat: 'वंदे भारत',
    superfast: 'सुपरफास्ट एवं इंटरसिटी',
    activeTrip: 'सक्रिय रेल सेवा',
    liveSpeed: 'लाइव गति',
    onTime: 'समय पर',
    delayed: 'विलंब',
    selectTrain: 'गाड़ी चुनें',
    scrollHint: 'अन्य गाड़ियाँ देखें →',
    telemetry: 'गति एवं रेल दूरमिति',
    kmh: 'किमी/घंटा',
    complete: 'पूर्ण',
    nextStation: 'अगला स्टेशन आगमन पूर्वानुमान',
    timetable: 'एआई समय-सारणी',
    departed: 'प्रस्थान',
    eta: 'अनुमानित आगमन',
    mlPrediction: 'एआई पूर्वानुमान',
    mins: 'मिनट'
  }
};

export default function PassengerView() {
  const { trains, trainsList, simulatedTime } = useSocket();
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const searchContainerRef = useRef(null);

  const t = TRANSLATIONS[language];

  // Unified realistic delay resolver
  const getTrainDelay = (trainObj) => getTrainDelayUtil(trainObj, trains);

  // Initialize with first active train
  useEffect(() => {
    if (!selectedTrainNumber && trainsList.length > 0) {
      const runningTrain = trainsList.find(t => {
        const run = trains.get(t.trainNumber) || t.currentRun;
        return run && (run.status === 'running' || run.status === 'at_station');
      });
      const defaultTrain = runningTrain ? runningTrain.trainNumber : (trainsList[0]?.trainNumber || '22225');
      setSelectedTrainNumber(defaultTrain);
      handleSelectTrain(defaultTrain);
    }
  }, [trainsList]);

  // Click outside to close autocomplete suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTrain = async (trainNumber) => {
    setSelectedTrainNumber(trainNumber);
    setShowSuggestions(false);
    setLoading(true);
    try {
      const train = await fetchTrain(trainNumber);
      setTrainData(train);
      const preds = await fetchPredictions(trainNumber);
      const list = Array.isArray(preds) ? preds : (preds.predictions || []);
      setPredictions(list);
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Sync with real-time socket updates
  useEffect(() => {
    if (selectedTrainNumber && trains.has(selectedTrainNumber)) {
      const liveRun = trains.get(selectedTrainNumber);
      setTrainData(prev => prev ? { ...prev, currentRun: liveRun, ...liveRun } : liveRun);
    }
  }, [selectedTrainNumber, trains]);

  const activeTrain = trainData || trainsList.find(t => t.trainNumber === selectedTrainNumber) || trainsList[0] || null;
  const run = activeTrain?.currentRun || activeTrain || {};
  const schedule = activeTrain?.schedule || run?.stationLog || [];
  const stationLog = run?.stationLog || schedule || [];

  const activeDelay = getTrainDelay(activeTrain);
  const currentSpeed = Math.round(run?.currentSpeed || (activeDelay > 10 ? 65 : 110));
  const currentKm = Math.round(run?.currentKm || 140);
  const totalKm = Math.round(run?.totalKm || activeTrain?.totalKm || 192);
  const pctComplete = Math.min(100, Math.max(0, Math.round((currentKm / (totalKm || 1)) * 100))) || 72;
  const nextIdx = run?.nextStationIndex || 0;

  // Station lists
  const passedStops = stationLog.filter((s, idx) => s.arrived || idx < nextIdx);
  const nextStop = stationLog.find((s, idx) => idx === nextIdx) || stationLog[0] || null;
  const futureStops = stationLog.filter((s, idx) => !s.arrived && idx > nextIdx);

  // Circular Speed Gauge SVG offset
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pctComplete / 100) * circumference;

  const isHeavyDelayed = activeDelay > 10;
  const isMinorDelayed = activeDelay > 0 && activeDelay <= 10;

  // Live Autocomplete Suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();

    return trainsList.filter(t => {
      const num = String(t.trainNumber || '').toLowerCase();
      const name = String(t.name || '').toLowerCase();
      const origin = String(t.originCode || '').toLowerCase();
      const dest = String(t.destinationCode || '').toLowerCase();
      return num.startsWith(q) || num.includes(q) || name.includes(q) || origin.includes(q) || dest.includes(q);
    }).slice(0, 8);
  }, [trainsList, searchQuery]);

  // Filtered train list for carousel
  const filteredTrainsList = useMemo(() => {
    return trainsList.filter(t => {
      const runObj = trains.get(t.trainNumber) || t.currentRun;
      const isRunning = runObj?.status === 'running' || runObj?.status === 'at_station';
      const name = (t.name || '').toLowerCase();
      const num = (t.trainNumber || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !searchQuery || name.includes(q) || num.includes(q);
      if (!matchesSearch) return false;
      if (activeCategory === 'running') return isRunning;
      if (activeCategory === 'vande_bharat') return name.includes('vande') || name.includes('shatabdi');
      if (activeCategory === 'superfast') return name.includes('superfast') || name.includes('intercity') || name.includes('express');
      return true;
    });
  }, [trainsList, trains, searchQuery, activeCategory]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Floating Alert Notifications & SMS/WhatsApp Broadcast */}
      <EtaAlertToast />
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#E2E8F0] pb-4 bg-transparent">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{t.title}</h1>
          <p className="text-sm text-[#505f76] mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'en' ? 'bg-white text-[#006591] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'hi' ? 'bg-[#006591] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 px-3.5 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot" />
            <span className="font-mono text-xs font-bold text-[#10B981] uppercase tracking-wider">
              {t.liveUpdates}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Global Train Search with LIVE AUTOCOMPLETE SUGGESTIONS */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3 relative z-30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search Box with Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-[#6e7881] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="pl-9 pr-8 py-2.5 bg-[#f7f9fb] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 w-full font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7881] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Floating Autocomplete Suggestions Box */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto custom-scrollbar divide-y divide-[#E2E8F0]">
                <div className="px-3.5 py-2 bg-[#f7f9fb] text-[10px] font-bold text-[#505f76] uppercase tracking-wider flex justify-between items-center">
                  <span>Matching Trains ({suggestions.length})</span>
                  <span className="text-[#0ea5e9] font-normal">Click to view journey</span>
                </div>

                {suggestions.map(tItem => {
                  const isCur = tItem.trainNumber === (activeTrain?.trainNumber || selectedTrainNumber);
                  const delayVal = getTrainDelay(tItem);
                  const isHeavy = delayVal > 10;
                  const isMinor = delayVal > 0 && delayVal <= 10;
                  const runObj = trains.get(tItem.trainNumber) || tItem.currentRun;
                  const speed = Math.round(runObj?.currentSpeed || (delayVal > 10 ? 60 : 105));

                  return (
                    <div
                      key={tItem.trainNumber}
                      onClick={() => {
                        handleSelectTrain(tItem.trainNumber);
                        setSearchQuery(tItem.trainNumber);
                        setShowSuggestions(false);
                      }}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-[#f2f4f6] transition-colors cursor-pointer ${
                        isCur ? 'bg-[#d0e1fb]/30 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-[#0ea5e9]/10 text-[#006591] font-mono text-xs font-bold border border-[#0ea5e9]/20">
                          #{tItem.trainNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A]">{tItem.name}</div>
                          <div className="text-[11px] text-[#505f76]">
                            {tItem.originCode || 'CSMT'} → {tItem.destinationCode || 'SUR'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHeavy 
                            ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' 
                            : isMinor 
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' 
                            : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                        }`}>
                          {delayVal > 0 ? `+${delayVal}m` : (language === 'hi' ? 'समय पर' : 'ON TIME')}
                        </span>
                        <div className="text-[10px] text-[#505f76] mt-0.5">
                          {speed > 0 ? `${speed} km/h` : (language === 'hi' ? 'स्टेशन पर' : 'At Station')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `${t.allCategory} (${trainsList.length})` },
              { id: 'running', label: t.runningNow },
              { id: 'vande_bharat', label: t.vandeBharat },
              { id: 'superfast', label: t.superfast }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#006591] text-white shadow-sm'
                    : 'bg-[#f7f9fb] text-[#505f76] hover:bg-[#E2E8F0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid (Left Span 7, Right Span 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Trip Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#505f76] tracking-wider uppercase">ACTIVE TRIP</span>
              <span className="font-mono text-xs font-bold text-[#0ea5e9]">TRN-{activeTrain?.trainNumber || '12028'}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">{activeTrain?.name || 'Shatabdi Express'}</h2>
                <div className="text-xs text-[#505f76] mt-0.5 font-medium">
                  {activeTrain?.originCode || 'Mumbai CSMT'} → {activeTrain?.destinationCode || 'Pune Jn'} • Total: {totalKm} km
                </div>
              </div>

              <div className="text-right">
                <div className={`font-mono text-xs font-bold px-2.5 py-1 rounded inline-block ${
                  isHeavyDelayed 
                    ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' 
                    : isMinorDelayed 
                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' 
                    : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                }`}>
                  {activeDelay > 0 ? `DELAYED +${activeDelay}m` : 'ON TIME'}
                </div>
                <div className="text-xs text-[#505f76] mt-1 font-medium">
                  Live Speed: {currentSpeed} km/h
                </div>
              </div>
            </div>

            {/* Horizontal Snap Quick-Select Carousel of Matching Trains */}
            <div className="pt-3 border-t border-[#E2E8F0]">
              <div className="text-[10px] font-bold text-[#505f76] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select Train ({filteredTrainsList.length} Available)</span>
                <span className="text-[#0ea5e9] text-[9px]">Scroll horizontally →</span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-2">
                {filteredTrainsList.map(t => {
                  const isCur = t.trainNumber === (activeTrain?.trainNumber || selectedTrainNumber);
                  const delayVal = getTrainDelay(t);
                  const isHeavy = delayVal > 10;
                  const isMinor = delayVal > 0 && delayVal <= 10;

                  return (
                    <button
                      key={t.trainNumber}
                      onClick={() => handleSelectTrain(t.trainNumber)}
                      className={`flex-none w-48 rounded-xl p-3 text-left transition-all cursor-pointer border ${
                        isCur
                          ? 'bg-[#d0e1fb]/40 border-[#0ea5e9] shadow-sm ring-2 ring-[#0ea5e9]/20'
                          : 'bg-[#f7f9fb] border-[#E2E8F0] hover:border-[#0ea5e9]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isCur ? 'text-[#006591]' : 'text-[#505f76]'}`}>
                          {isCur ? 'SELECTED' : 'AVAILABLE'}
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${
                          isHeavy ? 'text-[#EF4444]' : isMinor ? 'text-[#F59E0B]' : 'text-[#10B981]'
                        }`}>
                          {delayVal > 0 ? `+${delayVal}m` : 'ON TIME'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#0F172A] truncate">
                        {t.name}
                      </div>

                      <div className="text-[11px] text-[#505f76] truncate mt-0.5 font-medium">
                        {t.originCode || 'CSMT'} → {t.destinationCode || 'PUNE'}
                      </div>

                      <div className="font-mono text-[11px] text-[#006591] font-bold mt-1">
                        #{t.trainNumber}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Journey Tracker (Circular Speed Dial & Ring) */}
          <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] relative">
            <div className="absolute top-5 left-5 text-[11px] font-bold text-[#505f76] uppercase tracking-wider">
              TELEMETRY & KINEMATICS
            </div>

            {/* Circular Speed Dial */}
            <div className="relative w-48 h-48 flex items-center justify-center mt-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#f2f4f6" 
                  strokeWidth="8" 
                />
                {/* Progress Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={isHeavyDelayed ? '#EF4444' : isMinorDelayed ? '#F59E0B' : '#10B981'} 
                  strokeWidth="8" 
                  strokeDasharray="282.7" 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Centered Speed Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-3xl font-bold text-[#0F172A]">
                  {currentSpeed}
                </span>
                <span className="text-[10px] font-bold text-[#505f76] tracking-wider uppercase mt-0.5">
                  KM/H
                </span>
                <div className="w-8 h-[1px] bg-[#E2E8F0] my-1.5" />
                <span className={`font-mono text-[11px] font-bold ${
                  isHeavyDelayed ? 'text-[#EF4444]' : isMinorDelayed ? 'text-[#F59E0B]' : 'text-[#10B981]'
                }`}>
                  {pctComplete}% COMPLETE
                </span>
              </div>
            </div>

            {/* Next Station Countdown Highlight Box */}
            <div className="mt-6 text-center bg-[#f7f9fb] border border-[#E2E8F0] px-6 py-4 rounded-xl w-full max-w-sm">
              <div className="text-[10px] font-bold text-[#505f76] tracking-wider uppercase mb-1">
                NEXT STATION PREDICTION
              </div>
              <div className="font-bold text-lg text-[#006591]">
                {nextStop?.stationName || 'Pune Junction'}
              </div>
              <div className={`font-mono text-xl font-extrabold mt-0.5 ${
                isHeavyDelayed ? 'text-[#EF4444]' : isMinorDelayed ? 'text-[#F59E0B]' : 'text-[#0ea5e9]'
              }`}>
                {activeDelay > 0 ? `ETA +${activeDelay}m (${Math.max(2, Math.round(18 - (activeDelay * 0.4)))} MINS)` : 'ON TIME (14 MINS)'}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (Span 5) */}
        <div className="lg:col-span-5 bg-white shadow-sm rounded-xl border border-[#E2E8F0] p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2E8F0]">
            <div>
              <span className="text-[11px] font-bold text-[#505f76] uppercase tracking-wider block">
                ML TIMETABLE • #{activeTrain?.trainNumber}
              </span>
              <span className="text-xs font-bold text-[#0F172A]">
                {activeTrain?.name}
              </span>
            </div>
            <Activity className="w-4 h-4 text-[#006591]" />
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 relative max-h-[580px]">
            {/* Vertical Timeline Track Line */}
            <div className="absolute left-4 top-3 bottom-6 w-[2px] bg-[#E2E8F0]" />

            <div className="flex flex-col gap-6 relative z-10">
              
              {/* Passed Stops */}
              {passedStops.map((st, idx) => {
                const stopDelay = st.delayMinutes !== undefined && st.delayMinutes !== null ? st.delayMinutes : Math.round(activeDelay * ((idx + 1) / Math.max(1, passedStops.length)));

                return (
                  <div key={st.stationCode || idx} className="flex items-start gap-4 opacity-70">
                    <div className={`w-8 h-8 rounded-full bg-white border flex items-center justify-center z-10 shrink-0 shadow-sm ${
                      stopDelay > 5 ? 'border-[#EF4444] text-[#EF4444]' : stopDelay > 0 ? 'border-[#F59E0B] text-[#F59E0B]' : 'border-[#10B981] text-[#10B981]'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-[#0F172A]">{st.stationName}</h4>
                        <span className="font-mono text-xs text-[#505f76]">
                          {formatTime(st.actualArrival || st.scheduledArrival || '17:30')}
                        </span>
                      </div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${
                        stopDelay > 5 ? 'text-[#EF4444]' : stopDelay > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'
                      }`}>
                        Departed {stopDelay > 0 ? `+${stopDelay}m` : 'On Time'}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Active Next Stop (Live Highlight) */}
              {nextStop && (
                <div className="flex items-start gap-4 relative">
                  {/* Active Track Line Segment */}
                  <div className={`absolute left-[15px] -top-6 bottom-4 w-[2px] z-0 ${
                    isHeavyDelayed ? 'bg-[#EF4444]' : isMinorDelayed ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                  }`} />
                  
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center z-10 shrink-0 relative ${
                    isHeavyDelayed 
                      ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]' 
                      : isMinorDelayed 
                      ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]' 
                      : 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full pulse-dot ${
                      isHeavyDelayed ? 'bg-[#EF4444]' : isMinorDelayed ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                    }`} />
                  </div>

                  <div className={`flex-grow border rounded-xl p-3.5 -mt-1 shadow-sm ${
                    isHeavyDelayed 
                      ? 'bg-[#EF4444]/5 border-[#EF4444]/40' 
                      : isMinorDelayed 
                      ? 'bg-[#F59E0B]/5 border-[#F59E0B]/40' 
                      : 'bg-[#f7f9fb] border-[#10B981]/50'
                  }`}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <h4 className="font-bold text-sm text-[#006591]">{nextStop.stationName}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase ${
                          isHeavyDelayed ? 'text-[#EF4444]' : isMinorDelayed ? 'text-[#F59E0B]' : 'text-[#10B981]'
                        }`}>
                          ETA
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0F172A]">
                          {formatTime(nextStop.scheduledArrival || '19:42')}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 font-mono text-[11px] font-bold ${
                      isHeavyDelayed ? 'text-[#EF4444]' : isMinorDelayed ? 'text-[#F59E0B]' : 'text-[#10B981]'
                    }`}>
                      <Zap className="w-3 h-3 fill-current" />
                      <span>
                        {activeDelay > 0 
                          ? `ML PREDICTION: ARRIVING +${activeDelay} MIN DELAYED` 
                          : 'ML PREDICTION: ARRIVING ON TIME (0 MIN DELAY)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Future Stops */}
              {futureStops.map((st, idx) => (
                <div key={st.stationCode || idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center z-10 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#bec8d2]" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-medium text-[#505f76]">{st.stationName}</h4>
                      <span className="font-mono text-xs text-[#bec8d2]">
                        {formatTime(st.scheduledArrival || '21:10')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
