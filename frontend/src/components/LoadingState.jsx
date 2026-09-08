export default function LoadingState({ label = "Loading network…" }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 text-steel-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
      <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}
