import React from 'react';

export function FocusMode({ task, onDone, onSkip, onExit }) {
  const hasTask = Boolean(task);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-neutral-100">
      <div className="w-full max-w-3xl">
        <div className="text-[10px] uppercase tracking-[0.6em] text-neutral-500">Focus Mode</div>

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
                className="border border-neon-green/30 bg-neon-green px-10 py-5 text-base font-black text-black transition hover:bg-neon-green/90 focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-black"
              >
                Mark Done
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="border border-neutral-800 bg-white/[0.03] px-10 py-5 text-base font-semibold text-neutral-100 transition hover:border-neon-red/40 hover:bg-neon-red/10 hover:text-neon-red focus:outline-none focus:ring-2 focus:ring-neon-red focus:ring-offset-2 focus:ring-offset-black"
              >
                Skip for now
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center border border-neon-green/20 bg-neon-green/10 text-2xl text-neon-green">
              ?
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
                className="border border-neon-green/30 bg-neon-green px-10 py-5 text-base font-black text-black transition hover:bg-neon-green/90 focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-black"
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
