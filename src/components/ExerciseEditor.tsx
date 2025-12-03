import { useEffect, useState } from "react";

import { TimePickerSheet } from "@/components/TimePickerSheet";
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
    isTime: false,
  },
  {
    key: "work",
    label: "Work",
    step: 5,
    suffix: "s",
    subtitle: "Push hard",
    min: 5,
    max: 3659,
    isTime: true,
  },
  {
    key: "rest",
    label: "Rest",
    step: 5,
    suffix: "s",
    subtitle: "Between sets",
    min: 0,
    max: 3659,
    isTime: true,
  },
  {
    key: "restLast",
    label: "Rest (last)",
    step: 5,
    suffix: "s",
    subtitle: "After final set",
    min: 0,
    max: 3659,
    isTime: true,
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
  const [picker, setPicker] = useState<{
    field: "work" | "rest" | "restLast";
    value: number;
    min: number;
    max: number;
  } | null>(null);

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

  const openPicker = (
    field: "work" | "rest" | "restLast",
    value: number,
    min: number,
    max: number
  ) => setPicker({ field, value, min, max });

  const handleConfirmPicker = (value: number) => {
    if (!picker) return;
    if (picker.field === "work") setWorkSeconds(value);
    if (picker.field === "rest") setRestSeconds(value);
    if (picker.field === "restLast") setRestLastSeconds(value);
    setPicker(null);
  };

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
            const minutes = Math.floor(value / 60);
            const seconds = value % 60;
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
                  <div
                    role={control.isTime ? "button" : undefined}
                    tabIndex={control.isTime ? 0 : -1}
                    onClick={() => {
                      if (!control.isTime) return;
                      openPicker(
                        control.key as "work" | "rest" | "restLast",
                        value,
                        control.min,
                        control.max
                      );
                    }}
                    onKeyDown={(e) => {
                      if (
                        control.isTime &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        e.preventDefault();
                        openPicker(
                          control.key as "work" | "rest" | "restLast",
                          value,
                          control.min,
                          control.max
                        );
                      }
                    }}
                    className="min-w-[110px] rounded-xl bg-background px-4 py-2 text-center text-lg font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {control.isTime ? (
                      <div className="flex items-center justify-center gap-1">
                        <span>{minutes}m</span>
                        <span className="text-muted-foreground">
                          {seconds.toString().padStart(2, "0")}s
                        </span>
                      </div>
                    ) : (
                      <>
                        {value}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                          {control.suffix}
                        </span>
                      </>
                    )}
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
        <TimePickerSheet
          open={Boolean(picker)}
          title={
            picker?.field === "work"
              ? "Work duration"
              : picker?.field === "rest"
              ? "Rest duration"
              : "Rest (last)"
          }
          initialSeconds={picker?.value ?? 0}
          minSeconds={picker?.min ?? 0}
          maxSeconds={picker?.max ?? 3600}
          onClose={() => setPicker(null)}
          onConfirm={handleConfirmPicker}
        />
      </div>
    </div>
  );
}
