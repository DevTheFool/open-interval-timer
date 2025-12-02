import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/utils";
import type { Phase } from "@/hooks/useHiitTimer";

type Props = {
  phase: Phase;
  remaining: number;
  currentSet: number;
  sets: number;
  workDuration: number;
  restDuration: number;
  totalRemaining: number;
  isPaused: boolean;
  onClose: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onTogglePause: () => void;
};

export function RunningView({
  phase,
  remaining,
  currentSet,
  sets,
  workDuration,
  restDuration,
  totalRemaining,
  isPaused,
  onClose,
  onSkipBack,
  onSkipForward,
  onTogglePause,
}: Props) {
  const label =
    phase === "prepare" ? "Prepare" : phase === "work" ? "Work" : "Rest";
  const workProgress =
    phase === "work" && workDuration > 0
      ? Math.min(Math.max(1 - remaining / workDuration, 0), 1)
      : 0;
  const restProgress =
    phase === "rest" && restDuration > 0
      ? Math.min(Math.max(1 - remaining / restDuration, 0), 1)
      : 0;
  const baseBg =
    phase === "work"
      ? "bg-emerald-950 text-emerald-50"
      : "bg-indigo-950 text-indigo-50";

  return (
    <div
      className={`relative flex min-h-[100dvh] w-full flex-col px-4 pb-8 pt-5 ${baseBg}`}
    >
      {phase === "work" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-emerald-400/50 transition-[height] duration-[600ms] ease-out"
            style={{ height: `${workProgress * 100}%` }}
          />
        </div>
      )}
      {phase === "rest" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-indigo-400/50 transition-[height] duration-[700ms] ease-out"
            style={{ height: `${restProgress * 100}%` }}
          />
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="mb-6 flex items-center justify-between text-sm font-semibold text-muted-foreground">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/40 bg-white/10 text-foreground shadow-sm shadow-black/30"
            onClick={onClose}
          >
            X
          </Button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wide">Remaining</p>
            <p className="text-lg font-bold tabular-nums">
              {formatSeconds(Math.max(totalRemaining, 0))}
            </p>
          </div>
          <div className="min-w-[36px]" />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="text-center space-y-1">
            <p className="text-3xl font-semibold tracking-tight">
              {label} {Math.min(currentSet, sets)}/{sets}
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-10 text-center shadow-lg shadow-black/30 backdrop-blur">
              <p className="text-6xl font-bold tabular-nums tracking-tight text-white">
                {formatSeconds(remaining)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Keep the screen on.</p>
        </div>

        <div className="mt-auto grid grid-cols-5 items-center gap-3">
          <Button
            variant="outline"
            className="col-span-1 h-14 w-full rounded-xl text-base font-semibold"
            onClick={onSkipBack}
          >
            {"<<"}
          </Button>
          <Button
            className="col-span-3 h-14 w-full rounded-xl text-base font-semibold"
            variant={isPaused ? "default" : "outline"}
            onClick={onTogglePause}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            className="col-span-1 h-14 w-full rounded-xl text-base font-semibold"
            onClick={onSkipForward}
          >
            {">>"}
          </Button>
        </div>
      </div>
    </div>
  );
}
