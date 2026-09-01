import React from 'react';
import { useSocket } from '../../context/SocketContext';

export default function Footer() {
  const { connected } = useSocket();

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 py-1 h-8 bg-[#ffffff] border-t border-[#E2E8F0] font-mono text-[11px] text-[#505f76] shadow-sm">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5 text-[#006591] font-semibold">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'}`} />
          ML Service: Active
        </span>
        <span className="hidden sm:inline text-[#505f76]">Latency: 14ms</span>
        <span className="hidden sm:inline text-[#505f76]">Sim: 15x</span>
      </div>

      <div className="font-semibold text-[#6e7881]">
        v4.2.0-stable
      </div>
    </footer>
  );
}
