import React, { useState, useEffect } from 'react';
import { fetchTrains } from '../../services/api';

export default function TrainSearch({ onSelect }) {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTrains();
        setTrains(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-12 bg-gray-200 rounded-lg"></div>;
  }

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <select
        onChange={(e) => {
          if (e.target.value) onSelect(e.target.value);
        }}
        className="block w-full rounded-2xl border-0 py-4 pl-12 pr-10 text-slate-700 ring-2 ring-inset ring-slate-200 focus:ring-4 focus:ring-cyan-500 sm:text-lg sm:leading-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl transition-all hover:ring-cyan-300 appearance-none cursor-pointer"
        defaultValue=""
      >
        <option value="" disabled>Search or select a train from the network...</option>
        {trains.map((t) => (
          <option key={t.trainNumber} value={t.trainNumber}>
            {t.trainNumber} — {t.name} ({t.type})
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
         <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
}
