import React from 'react';

export function FocusMode({ task, onDone, onSkip, onExit }) {
  const hasTask = Boolean(task);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-center text-neutral-100">
      <div className="w-full max-w-3xl">
        <div className="text-[10px] uppercase tracking-[0.6em] text-violet-300/70">Focus Mode</div>

        {hasTask ? (
          <>
            <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
              {task.label}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
              One action. Nothing else. Finish this, then move on.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onDone}
                className="rounded-2xl bg-emerald-400 px-10 py-5 text-base font-black text-neutral-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
              >
                Mark Done
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-base font-semibold text-neutral-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              >
                Skip for now
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-2xl text-emerald-300">
              ✓
            </div>
            <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
              You&apos;re all caught up!
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
              There&apos;s nothing urgent waiting. You can step out of focus mode and return when you&apos;re ready.
            </p>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={onExit}
                className="rounded-2xl bg-violet-500 px-10 py-5 text-base font-black text-white transition hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
              >
                Exit Focus Mode
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
