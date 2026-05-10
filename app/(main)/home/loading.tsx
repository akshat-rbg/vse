export default function Loading() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-1 pb-8 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/5" />
          <div className="space-y-1.5">
            <div className="h-2 w-16 rounded bg-white/5" />
            <div className="h-3 w-24 rounded bg-white/5" />
          </div>
        </div>
        <div className="h-5 w-16 rounded-full bg-white/5" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
            <div className="h-2 w-10 rounded bg-white/5" />
            <div className="mt-1 h-5 w-16 rounded bg-white/5" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-3.5 bg-white/[0.02] border border-white/5">
        <div className="h-3 w-32 rounded bg-white/5" />
        <div className="mt-3 h-1.5 rounded-full bg-white/5" />
        <div className="mt-2 h-2 w-20 rounded bg-white/5" />
      </div>

      <div className="space-y-1">
        <div className="h-2 w-16 rounded bg-white/5" />
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-white/5" />
                <div className="space-y-1">
                  <div className="h-2.5 w-24 rounded bg-white/5" />
                  <div className="h-2 w-16 rounded bg-white/5" />
                </div>
              </div>
              <div className="h-3 w-12 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
