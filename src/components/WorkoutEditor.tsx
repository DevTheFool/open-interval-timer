import { useState } from "react";
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
  onReorder: (fromIndex: number, toIndex: number) => void;
};

export function WorkoutEditor({
  workout,
  prepSeconds,
  onBack,
  onUpdateName,
  onDelete,
  onOpenExercise,
  onReorder,
}: Props) {
  const totalSeconds = workoutDuration(workout.exercises, prepSeconds);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    onReorder(dragIndex, targetIndex);
    setDragIndex(null);
  };

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
              <p className="text-sm font-semibold">Tap to edit or add a move</p>
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
              <div
                key={exercise.id}
                draggable
                role="button"
                tabIndex={0}
                aria-grabbed={dragIndex === idx}
                onClick={() => onOpenExercise(exercise.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenExercise(exercise.id);
                  }
                }}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDragIndex(idx);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(idx);
                }}
                onDragEnd={() => setDragIndex(null)}
                className="group relative w-full rounded-2xl border bg-input/30 border-input/40 px-5 py-4 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 data-[dragging=true]:opacity-60"
                data-dragging={dragIndex === idx}
              >
                <span className="absolute left-[-5px] top-1/2 rounded-l-sm rounded-r-xl bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow transform -translate-y-1/2">
                  x{exercise.sets}
                </span>
                <div className="flex justify-between items-center">
                  <div className="space-y-1 pl-3">
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-sm font-semibold tabular-nums text-muted-foreground">
                        {formatSeconds(exercise.workSeconds)}
                      </span>
                      <span className="text-sm font-semibold text-emerald-400">
                        {exercise.name}
                      </span>
                    </div>
                    {exercise.restSeconds > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-sm font-semibold tabular-nums text-muted-foreground">
                          {formatSeconds(exercise.restSeconds)}
                        </span>
                        <span className="text-sm font-semibold text-sky-300">
                          REST
                        </span>
                      </div>
                    )}
                    {exercise.restLastSeconds > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-sm font-semibold tabular-nums text-muted-foreground">
                          {formatSeconds(exercise.restLastSeconds)}
                        </span>
                        <span className="text-sm font-semibold text-sky-400">
                          REST (LAST)
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {formatSeconds(exerciseDuration(exercise))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="h-12 rounded-xl text-base font-semibold"
          onClick={onBack}
          disabled={workout.exercises.length === 0}
        >
          {workout.exercises.length === 0 ? "Add an exercise to save" : "Done"}
        </Button>
      </div>
    </div>
  );
}
