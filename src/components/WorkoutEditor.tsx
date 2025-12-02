import { Button } from "@/components/ui/button";
import { exerciseDuration, formatSeconds, workoutDuration } from "@/lib/utils";
import type { WorkoutPlan } from "@/types";

type Props = {
  workout: WorkoutPlan;
  prepSeconds: number;
  onBack: () => void;
  onUpdateName: (name: string) => void;
  onDelete: (id: string) => void;
  onOpenExercise: (exerciseId: string | null) => void;
};

export function WorkoutEditor({
  workout,
  prepSeconds,
  onBack,
  onUpdateName,
  onDelete,
  onOpenExercise,
}: Props) {
  const totalSeconds = workoutDuration(workout.exercises, prepSeconds);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900 to-black text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Total {formatSeconds(totalSeconds)}
            </span>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (confirm("Delete this workout?")) {
                  onDelete(workout.id);
                }
              }}
              title="Delete workout"
            >
              🗑
            </Button>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-input/40 bg-background/80 p-4 shadow-sm backdrop-blur">
          <label className="text-sm font-semibold text-muted-foreground">
            Workout name
          </label>
          <input
            className="w-full rounded-xl border border-input/40 bg-input/30 px-4 py-3 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2"
            value={workout.name}
            onChange={(e) => onUpdateName(e.target.value)}
            placeholder="Leg day, Upper body..."
          />
        </div>

        <div className="space-y-3 rounded-3xl border border-input/40 bg-background/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Exercises
              </p>
              <p className="text-sm font-semibold">
                Tap to edit or add a move
              </p>
            </div>
            <Button size="sm" onClick={() => onOpenExercise(null)}>
              + Add exercise
            </Button>
          </div>
          <div className="space-y-2">
            {workout.exercises.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No exercises yet. Add one to build the routine.
              </p>
            )}
            {workout.exercises.map((exercise, idx) => (
              <button
                key={exercise.id}
                onClick={() => onOpenExercise(exercise.id)}
                className="w-full rounded-2xl border border-input/40 bg-input/20 px-4 py-3 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold">
                      {idx + 1}. {exercise.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exercise.sets} sets · Work {exercise.workSeconds}s · Rest{" "}
                      {exercise.restSeconds}s · Rest (last){" "}
                      {exercise.restLastSeconds}s
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {formatSeconds(exerciseDuration(exercise))}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          className="h-12 rounded-xl text-base font-semibold"
          onClick={onBack}
          disabled={workout.exercises.length === 0}
        >
          {workout.exercises.length === 0
            ? "Add an exercise to save"
            : "Done"}
        </Button>
      </div>
    </div>
  );
}
