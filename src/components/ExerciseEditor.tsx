import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { clamp, createId } from "@/lib/utils";
import type { ExerciseConfig } from "@/types";

type Props = {
  initial?: ExerciseConfig | null;
  onSave: (exercise: ExerciseConfig) => void;
  onDelete?: (exerciseId: string) => void;
  onBack: () => void;
};

const controlList = [
  {
    key: "sets",
    label: "Sets",
    step: 1,
    suffix: "x",
    subtitle: "Work bouts",
    min: 1,
    max: 50,
  },
  {
    key: "work",
    label: "Work",
    step: 5,
    suffix: "s",
    subtitle: "Push hard",
    min: 5,
    max: 3600,
  },
  {
    key: "rest",
    label: "Rest",
    step: 5,
    suffix: "s",
    subtitle: "Between sets",
    min: 0,
    max: 3600,
  },
  {
    key: "restLast",
    label: "Rest (last)",
    step: 5,
    suffix: "s",
    subtitle: "After final set",
    min: 0,
    max: 3600,
  },
] as const;

export function ExerciseEditor({ initial, onSave, onDelete, onBack }: Props) {
  const [name, setName] = useState(initial?.name ?? "Exercise");
  const [sets, setSets] = useState(initial?.sets ?? 4);
  const [workSeconds, setWorkSeconds] = useState(initial?.workSeconds ?? 30);
  const [restSeconds, setRestSeconds] = useState(initial?.restSeconds ?? 30);
  const [restLastSeconds, setRestLastSeconds] = useState(
    initial?.restLastSeconds ?? 0
  );

  useEffect(() => {
    if (!initial) return;
    setName(initial.name);
    setSets(initial.sets);
    setWorkSeconds(initial.workSeconds);
    setRestSeconds(initial.restSeconds);
    setRestLastSeconds(initial.restLastSeconds);
  }, [initial]);

  const handleSave = () => {
    const trimmedName = name.trim() || "Exercise";
    onSave({
      id: initial?.id ?? createId(),
      name: trimmedName,
      sets: clamp(sets, 1, 50),
      workSeconds: clamp(workSeconds, 5, 3600),
      restSeconds: clamp(restSeconds, 0, 3600),
      restLastSeconds: clamp(restLastSeconds, 0, 3600),
    });
    onBack();
  };

  const adjustSeconds = (
    setter: (v: number) => void,
    current: number,
    delta: number,
    min: number,
    max: number
  ) => setter(clamp(current + delta, min, max));

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900 to-black text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          {initial && onDelete ? (
            <Button
              variant="destructive"
              size="icon"
              title="Delete exercise"
              onClick={() => {
                if (confirm("Delete this exercise?")) {
                  onDelete(initial.id);
                }
              }}
            >
              🗑
            </Button>
          ) : (
            <div className="size-10" />
          )}
        </div>

        <div className="flex gap-2 flex-col rounded-3xl border border-input/40 bg-background/80 p-4 shadow-sm backdrop-blur">
          <label className="text-sm font-semibold text-muted-foreground">
            Exercise name
          </label>
          <input
            className="w-full rounded-xl border border-input/40 bg-input/30 px-4 py-3 text-base font-semibold outline-none ring-primary/40 focus:border-primary focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push-ups, Sprint..."
          />
        </div>

        <div className="space-y-3 rounded-3xl border border-input/40 bg-background/80 p-4 shadow-sm backdrop-blur">
          {controlList.map((control) => {
            const value =
              control.key === "sets"
                ? sets
                : control.key === "work"
                ? workSeconds
                : control.key === "rest"
                ? restSeconds
                : restLastSeconds;
            const setter =
              control.key === "sets"
                ? setSets
                : control.key === "work"
                ? setWorkSeconds
                : control.key === "rest"
                ? setRestSeconds
                : setRestLastSeconds;
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
                    onClick={() =>
                      adjustSeconds(
                        setter,
                        value,
                        -control.step,
                        control.min,
                        control.max
                      )
                    }
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
                    onClick={() =>
                      adjustSeconds(
                        setter,
                        value,
                        control.step,
                        control.min,
                        control.max
                      )
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="h-12 rounded-xl text-base font-semibold"
          onClick={handleSave}
        >
          Save exercise
        </Button>
      </div>
    </div>
  );
}
