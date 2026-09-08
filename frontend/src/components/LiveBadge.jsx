export default function LiveBadge({ connected, error }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          connected ? "bg-signal-green shadow-[0_0_8px_#3dcc8a]" : "bg-signal-red"
        }`}
      />
      <span className={connected ? "text-signal-green" : "text-signal-red"}>
        {connected ? "LIVE" : error ? "RECONNECTING" : "OFFLINE"}
      </span>
    </div>
  );
}
