import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  ArrowRight, 
  ShieldAlert,
  Calendar
} from 'lucide-react';

export default function PlatformCrewPanel({ trains = [] }) {
  const [activeTab, setActiveTab] = useState('platforms'); // 'platforms' | 'crew'

  // Synthesize platform occupancy for key terminals based on live train fleet
  const majorStations = [
    { code: 'CSMT', name: 'Mumbai CSMT', platforms: 18, totalBerths: 18 },
    { code: 'PUNE', name: 'Pune Junction', platforms: 6, totalBerths: 6 },
    { code: 'NGP', name: 'Nagpur Junction', platforms: 8, totalBerths: 8 },
    { code: 'SUR', name: 'Solapur Junction', platforms: 5, totalBerths: 5 },
    { code: 'KOP', name: 'Kolhapur CSMT', platforms: 3, totalBerths: 3 }
  ];

  // Derive turnaround & crew risk alerts from active delayed services
  const delayedTrains = trains.filter(t => (t.currentDelay || 0) >= 10);

  const turnaroundRisks = (delayedTrains.length > 0 ? delayedTrains.slice(0, 4) : trains.slice(0, 4)).map((t, idx) => {
    const lateArrival = t.currentDelay || (idx * 6 + 12);
    const nominalTurn = 50; // minutes nominal turnaround buffer
    const availableTurn = Math.max(10, nominalTurn - lateArrival);
    const risk = availableTurn < 25 ? 'CRITICAL' : availableTurn < 35 ? 'WARNING' : 'STABLE';

    return {
      trainNumber: t.trainNumber,
      trainName: t.name,
      destStation: t.destinationName || 'Mumbai CSMT',
      lateArrivalMinutes: lateArrival,
      nominalTurnaround: `${nominalTurn} min`,
      availableTurnaround: `${availableTurn} min`,
      turnaroundRisk: risk,
      rakeType: (t.type === 'Vande Bharat' ? '16-Car Vande Bharat Rake' : '22-Coach LHB Rake'),
      nextService: `Train #${parseInt(t.trainNumber) + 1} (${t.originName || 'PUNE'} Express)`
    };
  });

  const crewDutyWatch = trains.slice(0, 5).map((t, idx) => {
    const elapsedMinutes = (idx * 55 + 240); // 4 to 8 hours
    const hours = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    const maxDutyHours = 8;
    const isExceeded = hours >= maxDutyHours;
    const isWarning = hours >= 7;

    return {
      crewId: `CRW-MUM-${t.trainNumber.slice(-3)}`,
      trainNumber: t.trainNumber,
      trainName: t.name,
      locoPilot: ['R. K. Sharma', 'V. S. Patil', 'M. Deshmukh', 'A. K. Tiwari', 'S. S. Gaikwad'][idx % 5],
      guard: ['P. Nair', 'N. Jadhav', 'S. Kulkarni', 'B. Rao', 'D. Chavan'][idx % 5],
      onDutyTime: `${hours}h ${mins}m`,
      status: isExceeded ? 'HOURS_EXCEEDED' : isWarning ? 'RELIEF_REQUIRED' : 'NORMAL',
      handoverStation: ['Kalyan (KYN)', 'Igatpuri (IGP)', 'Karjat (KJT)', 'Daund (DD)', 'Pune (PUNE)'][idx % 5]
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Platform Berth & Crew Rota Impact Matrix</h2>
            <p className="text-xs text-slate-400">
              Terminal Turnaround Buffers, Rake Linking, and Loco Pilot / Guard Duty Hour Compliance
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'platforms' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terminal Turnarounds ({turnaroundRisks.length})
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'crew' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Crew Hours & Relief ({crewDutyWatch.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {activeTab === 'platforms' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {turnaroundRisks.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.turnaroundRisk === 'CRITICAL' 
                      ? 'bg-rose-50/70 border-rose-200' 
                      : item.turnaroundRisk === 'WARNING'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{item.trainName} ({item.trainNumber})</span>
                      <span className="text-[11px] text-slate-500">{item.rakeType} → {item.destStation}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.turnaroundRisk === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : item.turnaroundRisk === 'WARNING'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {item.turnaroundRisk === 'CRITICAL' ? 'Turnaround Buffer Breach' : item.turnaroundRisk === 'WARNING' ? 'Tight Turnaround' : 'Normal'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center p-2 bg-white rounded-lg border border-slate-200/80 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Late Arrival</span>
                      <span className="font-bold text-rose-600">+{item.lateArrivalMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Nominal Buffer</span>
                      <span className="text-slate-600">{item.nominalTurnaround}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Avail. Buffer</span>
                      <span className={`font-bold ${item.turnaroundRisk === 'CRITICAL' ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                        {item.availableTurnaround}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="truncate pr-2">Linked Next Service: <strong>{item.nextService}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Crew Roster ID</th>
                  <th className="p-3">Assigned Service</th>
                  <th className="p-3">Loco Pilot / Guard</th>
                  <th className="p-3">Continuous On-Duty</th>
                  <th className="p-3">Relief / Handover Point</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {crewDutyWatch.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{c.crewId}</td>
                    <td className="p-3 font-medium text-slate-900">{c.trainName} ({c.trainNumber})</td>
                    <td className="p-3 text-slate-600">
                      <div>LP: {c.locoPilot}</div>
                      <div className="text-[10px] text-slate-400">Guard: {c.guard}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{c.onDutyTime}</td>
                    <td className="p-3 text-slate-700 font-medium">{c.handoverStation}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'HOURS_EXCEEDED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : c.status === 'RELIEF_REQUIRED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {c.status === 'HOURS_EXCEEDED' ? 'Exceeded 8h Limit' : c.status === 'RELIEF_REQUIRED' ? 'Relief Due at Next Stop' : 'Within Limits'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
