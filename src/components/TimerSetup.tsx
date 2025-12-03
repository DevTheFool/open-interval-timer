import { Button } from "@/components/ui/button";
import { WorkoutCalendar } from "@/components/WorkoutCalendar";
import { formatSeconds, workoutDuration } from "@/lib/utils";
import type { WorkoutPlan } from "@/types";

type Props = {
  sets: number;
  workSeconds: number;
  restSeconds: number;
  setSets: (value: number) => void;
  setWorkSeconds: (value: number) => void;
  setRestSeconds: (value: number) => void;
  totalWorkoutSeconds: number;
  prepSeconds: number;
  onStart: () => void;
  canStart: boolean;
  completedDates: Set<string>;
  workouts: WorkoutPlan[];
  onSelectWorkout: (workout: WorkoutPlan) => void;
  onEditWorkout: (workoutId: string) => void;
  onCreateWorkout: () => void;
};

const controlList = [
  {
    key: "sets",
    label: "Sets",
    subtitle: "Total work cycles",
    suffix: "x",
    step: 1,
  },
  { key: "work", label: "Work", subtitle: "Push hard", suffix: "s", step: 5 },
  {
    key: "rest",
    label: "Rest",
    subtitle: "Between sets",
    suffix: "s",
    step: 5,
  },
] as const;

export function TimerSetup({
  sets,
  workSeconds,
  restSeconds,
  setSets,
  setWorkSeconds,
  setRestSeconds,
  totalWorkoutSeconds,
  prepSeconds,
  onStart,
  canStart,
  completedDates,
  workouts,
  onSelectWorkout,
  onEditWorkout,
  onCreateWorkout,
}: Props) {
  const adjustSeconds = (
    setter: (v: number) => void,
    current: number,
    delta: number
  ) => setter(current + delta);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-foreground">
      <main className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-10 pt-8">
        <section className="space-y-4 rounded-3xl border border-input/40 bg-background/80 p-5 shadow-sm backdrop-blur">
          <div className="space-y-3">
            {controlList.map((control) => {
              const value =
                control.key === "sets"
                  ? sets
                  : control.key === "work"
                  ? workSeconds
                  : restSeconds;
              const setter =
                control.key === "sets"
                  ? setSets
                  : control.key === "work"
                  ? setWorkSeconds
                  : setRestSeconds;
              return (
                <div
                  key={control.key}
                  className="flex items-center justify-between rounded-2xl border border-input/40 bg-input/20 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {control.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {control.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setter(value - control.step)}
                    >
                      -
                    </Button>
                    <div className="min-w-[72px] rounded-xl bg-background px-4 py-2 text-center text-lg font-semibold tabular-nums">
                      {value}
                      <span className="ml-1 text-xs font-medium text-muted-foreground">
                        {control.suffix}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setter(value + control.step)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="h-14 w-full justify-between rounded-xl text-base font-semibold"
              onClick={onStart}
              disabled={!canStart}
            >
              <span>Start workout</span>
              <span className="rounded-lg bg-primary-foreground/10 px-3 py-1 text-sm font-semibold text-primary-foreground">
                {formatSeconds(totalWorkoutSeconds)}
              </span>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {prepSeconds}s prepare, then cycles Work -{">"} Rest until sets
              are complete.
            </p>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-input/40 bg-background/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Saved workouts
              </p>
              <p className="text-sm font-semibold">Tap to start a routine</p>
            </div>
            <Button size="sm" variant="outline" onClick={onCreateWorkout}>
              + Multi-exercise
            </Button>
          </div>
          <div className="space-y-2">
            {workouts.filter((workout) => workout.exercises.length > 0)
              .length === 0 && (
              <p className="text-sm text-muted-foreground">
                No routines yet. Create one to chain exercises.
              </p>
            )}
            {workouts
              .filter((workout) => workout.exercises.length > 0)
              .map((workout) => {
                const duration = formatSeconds(
                  workoutDuration(workout.exercises, prepSeconds)
                );
                return (
                  <div
                    key={workout.id}
                    role="button"
                    tabIndex={0}
                    className="w-full rounded-2xl border border-input/40 bg-input/20 px-4 py-3 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    onClick={() => onSelectWorkout(workout)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectWorkout(workout);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-base font-semibold">
                          {workout.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold tabular-nums">
                            {duration}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {`Exercises: ${workout.exercises.length}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditWorkout(workout.id);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <WorkoutCalendar completedDates={completedDates} />
      </main>
    </div>
  );
}
