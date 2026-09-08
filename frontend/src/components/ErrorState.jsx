export default function ErrorState({ title = "Something went wrong", detail, onRetry }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 border border-signal-red/30 bg-navy-900/80 p-6 text-center">
      <p className="font-display text-lg text-signal-red">{title}</p>
      {detail && <p className="max-w-md text-sm text-steel-400">{detail}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring border border-amber-500/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400 hover:bg-amber-500/10"
        >
          Retry
        </button>
      )}
    </div>
  );
}
