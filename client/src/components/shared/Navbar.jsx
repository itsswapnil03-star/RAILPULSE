import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { Bell, Clock, MapPin, ChevronDown } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';
import NotificationsDropdown from '../modals/NotificationsDropdown';
import SimClockModal from '../modals/SimClockModal';
import ProfileModal from '../modals/ProfileModal';

export default function Navbar({ selectedStationCode = 'PUNE', onSelectStation }) {
  const { networkStats, alerts, simulatedTime, connected } = useSocket();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState(new Set());

  const punctuality = networkStats?.punctualityRate || 98.4;
  const rawAlerts = alerts || [];
  const activeAlerts = rawAlerts.filter(a => !acknowledgedAlertIds.has(a.id));
  const activeAlertsCount = activeAlerts.length;

  const handleStationChange = (e) => {
    const code = e.target.value;
    if (onSelectStation) {
      onSelectStation(code);
    }
    navigate('/stations');
  };

  const handleAcknowledgeAlert = (id) => {
    setAcknowledgedAlertIds(prev => new Set([...prev, id]));
  };

  const handleAcknowledgeAll = () => {
    setAcknowledgedAlertIds(new Set(rawAlerts.map(a => a.id)));
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#ffffff] border-b border-[#E2E8F0] shadow-sm font-sans">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => navigate('/control')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#006591] to-[#0ea5e9] flex items-center justify-center text-white font-black text-sm shadow-md">
            RM
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
            RailMind
          </span>
        </div>
      </div>

      {/* Center: Global Station Selector Dropdown */}
      <div className="hidden sm:flex items-center justify-center flex-1 max-w-xs mx-4">
        <div className="relative w-full glass-panel rounded-lg flex items-center px-3 py-1.5 border border-[#E2E8F0] focus-within:ring-2 focus-within:ring-[#0ea5e9]/20 bg-[#f7f9fb]">
          <MapPin className="w-4 h-4 text-[#006591] mr-2 shrink-0" />
          <select 
            value={selectedStationCode}
            onChange={handleStationChange}
            className="bg-transparent text-[#006591] font-mono text-xs font-bold w-full outline-none appearance-none cursor-pointer border-none p-0 pr-4"
          >
            <option value="PUNE">Pune Junction (PUNE)</option>
            <option value="CSMT">Mumbai CSMT (CSMT)</option>
            <option value="SUR">Solapur Junction (SUR)</option>
            <option value="NK">Nashik Road (NK)</option>
            <option value="NGP">Nagpur Junction (NGP)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-[#6e7881] pointer-events-none absolute right-2.5" />
        </div>
      </div>

      {/* Right: Live Telemetry Status & Interactive Controls */}
      <div className="flex items-center gap-3.5 font-mono text-xs relative">
        {/* Network Health */}
        <div className="hidden lg:flex items-center gap-2 text-[#006591] font-semibold bg-[#006591]/5 px-3 py-1 rounded-full border border-[#006591]/15">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Network Health: {punctuality}% Punctuality</span>
        </div>

        {/* Active Alerts Pill (Click to open notifications drawer) */}
        <div 
          onClick={() => {
            setIsNotificationsOpen(!isNotificationsOpen);
            setIsClockOpen(false);
            setIsProfileOpen(false);
          }}
          className="flex items-center gap-1.5 text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/20 cursor-pointer hover:bg-[#F59E0B]/20 transition-all select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          <span>{activeAlertsCount} Active Alert{activeAlertsCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#E2E8F0] hidden sm:block" />

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          {/* Bell Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsClockOpen(false);
                setIsProfileOpen(false);
              }}
              title="Notifications & Active Alerts"
              className={`p-2 rounded-full transition-colors cursor-pointer relative ${
                isNotificationsOpen ? 'bg-[#d0e1fb] text-[#006591]' : 'text-[#505f76] hover:text-[#006591] hover:bg-[#f2f4f6]'
              }`}
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
              )}
            </button>

            {/* Floating Notifications Drawer */}
            <NotificationsDropdown 
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              alerts={activeAlerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onAcknowledgeAll={handleAcknowledgeAll}
            />
          </div>

          {/* Clock Simulation Popover */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsClockOpen(!isClockOpen);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              title={`Simulated Time: ${simulatedTime ? formatTime(simulatedTime) : '05:00 am'}`}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isClockOpen ? 'bg-[#d0e1fb] text-[#006591]' : 'text-[#505f76] hover:text-[#006591] hover:bg-[#f2f4f6]'
              }`}
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* Floating Simulation Clock Modal */}
            <SimClockModal 
              isOpen={isClockOpen}
              onClose={() => setIsClockOpen(false)}
              simulatedTime={simulatedTime}
            />
          </div>
        </div>

        {/* Controller Profile Avatar */}
        <div className="relative flex items-center ml-1">
          <button 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
              setIsClockOpen(false);
            }}
            title="Controller Profile"
            className="w-8 h-8 rounded-full bg-[#0ea5e9] hover:bg-[#006591] text-white font-bold text-xs flex items-center justify-center border border-[#E2E8F0] shadow-sm transition-colors cursor-pointer"
          >
            SC
          </button>

          {/* Floating Profile Modal */}
          <ProfileModal 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
