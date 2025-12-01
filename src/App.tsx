import "./index.css";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type Phase = "idle" | "prepare" | "work" | "rest" | "done";

const PREP_SECONDS = 10;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatSeconds = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function useHiitTimer() {
  const [sets, setSets] = useState(4);
  const [workSeconds, setWorkSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(60);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  const totalWorkoutSeconds = useMemo(
    () => sets * workSeconds + Math.max(sets - 1, 0) * restSeconds,
    [restSeconds, sets, workSeconds],
  );

  const start = () => {
    setPhase("prepare");
    setRemaining(PREP_SECONDS);
    setCurrentSet(1);
    setIsRunning(true);
  };

  const reset = () => {
    setPhase("idle");
    setRemaining(0);
    setCurrentSet(1);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, remaining]);

  useEffect(() => {
    if (!isRunning || remaining > 0) return;

    if (phase === "prepare") {
      setPhase("work");
      setRemaining(workSeconds);
      return;
    }

    if (phase === "work") {
      if (currentSet >= sets) {
        setPhase("done");
        setIsRunning(false);
        return;
      }
      setPhase("rest");
      setRemaining(restSeconds);
      return;
    }

    if (phase === "rest") {
      const nextSet = Math.min(currentSet + 1, sets);
      setCurrentSet(nextSet);
      setPhase("work");
      setRemaining(workSeconds);
    }
  }, [currentSet, isRunning, phase, remaining, restSeconds, sets, workSeconds]);

  return {
    controls: {
      sets,
      workSeconds,
      restSeconds,
      setSets: (value: number) => setSets(clamp(value, 1, 20)),
      setWorkSeconds: (value: number) => setWorkSeconds(clamp(value, 5, 600)),
      setRestSeconds: (value: number) => setRestSeconds(clamp(value, 5, 600)),
    },
    status: {
      phase,
      remaining,
      currentSet,
      totalWorkoutSeconds,
    },
    actions: {
      start,
      reset,
    },
    isRunning,
  };
}

const phaseCopy: Record<Phase, { label: string; tone: string }> = {
  idle: { label: "Ready", tone: "bg-muted text-foreground" },
  prepare: { label: "Prepare", tone: "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950 dark:text-amber-100" },
  work: { label: "Work", tone: "bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100" },
  rest: { label: "Rest", tone: "bg-sky-100 text-sky-900 border border-sky-200 dark:bg-sky-950 dark:text-sky-100" },
  done: { label: "Finished", tone: "bg-purple-100 text-purple-900 border border-purple-200 dark:bg-purple-950 dark:text-purple-50" },
};

export function App() {
  const { controls, status, actions, isRunning } = useHiitTimer();
  const { sets, workSeconds, restSeconds, setSets, setWorkSeconds, setRestSeconds } = controls;
  const { phase, remaining, currentSet, totalWorkoutSeconds } = status;

  const showRemaining = phase === "idle" ? totalWorkoutSeconds : phase === "done" ? 0 : remaining;

  const canStart = phase === "idle" || phase === "done";

  const adjustSeconds = (setter: (value: number) => void, current: number, delta: number) => {
    setter(current + delta);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-10 pt-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">HIIT Interval Timer</p>
            <h1 className="text-2xl font-semibold">Open Interval Timer</h1>
          </div>
          <span className="text-xs text-muted-foreground">Phone friendly</span>
        </header>

        <section className="space-y-4 rounded-3xl border bg-background/80 p-5 shadow-sm backdrop-blur dark:border-input/40 dark:bg-background/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current phase</p>
              <p className="text-lg font-semibold">Set {Math.min(currentSet, sets)} of {sets}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${phaseCopy[phase].tone}`}>
              {phaseCopy[phase].label}
            </span>
          </div>

          <div className="rounded-2xl border bg-card px-4 py-5 text-center shadow-inner dark:border-input/40">
            <p className="text-sm text-muted-foreground">Time left</p>
            <p className="text-5xl font-bold tabular-nums tracking-tight">{formatSeconds(showRemaining)}</p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Sets",
                value: sets,
                onChange: (delta: number) => setSets(sets + delta),
                step: 1,
                subtitle: "Total work cycles",
                suffix: "x",
              },
              {
                label: "Work",
                value: workSeconds,
                onChange: (delta: number) => adjustSeconds(setWorkSeconds, workSeconds, delta),
                step: 5,
                subtitle: "Push hard",
                suffix: "s",
              },
              {
                label: "Rest",
                value: restSeconds,
                onChange: (delta: number) => adjustSeconds(setRestSeconds, restSeconds, delta),
                step: 5,
                subtitle: "Catch your breath",
                suffix: "s",
              },
            ].map(control => (
              <div
                key={control.label}
                className="flex items-center justify-between rounded-2xl border bg-muted/40 px-4 py-3 dark:border-input/40 dark:bg-input/20"
              >
                <div>
                  <p className="text-sm font-medium">{control.label}</p>
                  <p className="text-xs text-muted-foreground">{control.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isRunning}
                    onClick={() => control.onChange(-control.step)}
                  >
                    −
                  </Button>
                  <div className="min-w-[72px] rounded-xl bg-background px-4 py-2 text-center text-lg font-semibold tabular-nums">
                    {control.value}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">{control.suffix}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isRunning}
                    onClick={() => control.onChange(control.step)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="h-14 w-full justify-between rounded-xl text-base font-semibold"
              onClick={() => {
                if (canStart) actions.start();
              }}
              disabled={!canStart}
            >
              <span>Start workout</span>
              <span className="rounded-lg bg-primary-foreground/10 px-3 py-1 text-sm font-semibold text-primary-foreground">
                {formatSeconds(totalWorkoutSeconds)}
              </span>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => actions.reset()}
            >
              Reset
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Includes a {PREP_SECONDS}s prepare period, then cycles Work ➜ Rest until sets are complete.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
