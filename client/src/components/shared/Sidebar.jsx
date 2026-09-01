import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Train, LineChart, Cpu, Zap, Settings, HelpCircle, Users } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { executeResolutionAction } from '../../services/api';

export default function Sidebar({ onPerformAction }) {
  const location = useLocation();
  const { alerts } = useSocket();

  const handleQuickAction = async () => {
    if (onPerformAction) {
      onPerformAction();
      return;
    }
    // Default quick action on highest severity alert if available
    if (alerts && alerts.length > 0) {
      const topAlert = alerts[0];
      if (topAlert.actionPayload) {
        try {
          await executeResolutionAction(topAlert.actionPayload);
        } catch (e) {}
      }
    }
  };

  const navItems = [
    { to: '/control', label: 'Control Room', icon: LayoutDashboard },
    { to: '/map', label: 'GIS Map', icon: Map },
    { to: '/stations', label: 'Station Boards', icon: Train },
    { to: '/passenger', label: 'Passenger View', icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-8 flex flex-col z-40 bg-[#f2f4f6] border-r border-[#E2E8F0] w-64 hidden md:flex font-sans">
      {/* Controller Profile Card */}
      <div className="p-5 border-b border-[#E2E8F0] bg-[#ffffff]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#d0e1fb] flex items-center justify-center text-[#0b1c30] shadow-sm">
            <Cpu className="w-5 h-5 text-[#006591]" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">Section Controller</div>
            <div className="text-[11px] font-semibold text-[#505f76] tracking-wider uppercase mt-0.5">North Corridor</div>
          </div>
        </div>

        {/* Primary CTA: Perform Action */}
        <button 
          onClick={handleQuickAction}
          className="mt-4 w-full bg-[#0ea5e9] hover:bg-[#006591] text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Perform Action</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to === '/control' && location.pathname === '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#d0e1fb] text-[#0b1c30] font-bold shadow-sm'
                  : 'text-[#505f76] hover:text-[#0F172A] hover:bg-[#ffffff]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#006591]' : 'text-[#6e7881]'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Settings & Support */}
      <div className="p-4 border-t border-[#E2E8F0] space-y-1 bg-[#ffffff]/40">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-[#505f76] hover:text-[#0F172A] hover:bg-[#ffffff] rounded-lg transition-colors text-xs font-semibold text-left">
          <Settings className="w-4 h-4 text-[#6e7881]" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-[#505f76] hover:text-[#0F172A] hover:bg-[#ffffff] rounded-lg transition-colors text-xs font-semibold text-left">
          <HelpCircle className="w-4 h-4 text-[#6e7881]" />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
}
