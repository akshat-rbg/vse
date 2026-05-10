export default function Loading() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-1 pb-24 lg:max-w-3xl lg:pb-6 animate-pulse">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="h-2 w-14 rounded bg-white/5" />
          <div className="h-5 w-28 rounded bg-white/5" />
        </div>
        <div className="h-5 w-8 rounded-full bg-white/5" />
      </div>

      <div className="relative flex items-center gap-2 rounded-xl px-3 py-2.5 bg-white/[0.02] border border-white/5">
        <div className="h-3.5 w-3.5 rounded bg-white/5" />
        <div className="h-3 flex-1 rounded bg-white/5" />
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-2.5 bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-white/5" />
                <div className="h-2 w-16 rounded bg-white/5" />
              </div>
              <div className="h-8 w-8 rounded-lg bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
