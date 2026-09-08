export default function CorridorMap({ trains, stations }) {
  const maxKm = stations[stations.length - 1]?.km || 760;
  return (
    <div className="bg-white border rounded-xl p-4 overflow-x-auto">
      <h3 className="font-semibold text-rail-900 mb-3">Delhi – Varanasi corridor</h3>
      <div className="relative h-32 min-w-[640px] mx-4">
        <div className="absolute left-0 right-0 top-12 h-1 bg-rail-800 rounded" />
        {stations.map((s) => (
          <div
            key={s.code}
            className="absolute top-10"
            style={{ left: `${(s.km / maxKm) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border border-rail-900 mx-auto" />
            <p className="text-[10px] mt-2 text-center text-slate-600">{s.code}</p>
          </div>
        ))}
        {trains.map((t) => (
          <div
            key={t.number}
            className="absolute"
            style={{
              left: `${(t.kmFromNdls / maxKm) * 100}%`,
              top: t.direction === "down" ? "0px" : "52px",
              transform: "translateX(-50%)",
            }}
            title={`${t.number} ${t.name}`}
          >
            <div
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded text-white ${
                t.severity === "on-time" ? "bg-emerald-600" : t.severity === "minor" ? "bg-amber-500" : "bg-red-600"
              }`}
            >
              {t.number}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
