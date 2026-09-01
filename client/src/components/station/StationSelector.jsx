import React, { useState, useEffect } from 'react';
import { fetchStations } from '../../services/api';

export default function StationSelector({ value, onChange }) {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStations();
        setStations(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-[#8ba0be] uppercase tracking-wider">Station:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141f31] border border-[#1d2a41] text-[#e9eff9] text-xs rounded-lg focus:ring-1 focus:ring-[#4c9aff] focus:border-[#4c9aff] block w-56 p-2 font-mono outline-none cursor-pointer"
      >
        {stations.map(s => (
           <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
        ))}
      </select>
    </div>
  );
}
