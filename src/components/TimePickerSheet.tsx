import { useEffect, useMemo, useState } from "react";

import { clamp } from "@/lib/utils";

type Props = {
  open: boolean;
  title?: string;
  initialSeconds: number;
  minSeconds: number;
  maxSeconds: number;
  onClose: () => void;
  onConfirm: (seconds: number) => void;
};

const secondOptions = Array.from({ length: 60 }, (_, i) => i); // 0..59

type ColumnProps = {
  label: string;
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  unit: string;
};

function TimeColumn({ label, values, selected, onSelect, unit }: ColumnProps) {
  return (
    <div className="flex h-72 flex-1 flex-col overflow-hidden rounded-2xl border border-input/40 bg-input/20">
      <div className="border-b border-input/30 px-3 py-2 text-center text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-2">
        <div className="flex flex-col gap-1">
          {values.map((value) => {
            const isActive = value === selected;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onSelect(value)}
                className={`w-full rounded-xl px-3 py-2 text-center text-lg font-semibold tabular-nums transition ${
                  isActive
                    ? "bg-primary/20 ring-1 ring-primary/40"
                    : "text-foreground/80 hover:bg-input/30"
                }`}
              >
                {value.toString().padStart(2, "0")}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  {unit}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TimePickerSheet({
  open,
  title = "Set time",
  initialSeconds,
  minSeconds,
  maxSeconds,
  onClose,
  onConfirm,
}: Props) {
  const [seconds, setSeconds] = useState(() =>
    clamp(initialSeconds, minSeconds, maxSeconds)
  );

  useEffect(() => {
    if (!open) return;
    setSeconds(clamp(initialSeconds, minSeconds, maxSeconds));
  }, [initialSeconds, minSeconds, maxSeconds, open]);

  const minutesOptions = useMemo(() => {
    const maxMinutes = Math.floor(maxSeconds / 60);
    return Array.from({ length: maxMinutes + 1 }, (_, i) => i);
  }, [maxSeconds]);

  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;

  const handleSelect = (nextMinute: number, nextSecond: number) => {
    const total = nextMinute * 60 + nextSecond;
    setSeconds(clamp(total, minSeconds, maxSeconds));
  };

  const handleDone = () => {
    onConfirm(seconds);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close time picker"
        className="flex-1"
        onClick={handleDone}
      />
      <div className="max-h-[70vh] rounded-t-3xl border border-input/40 bg-slate-950 px-4 pb-7 pt-4 shadow-xl">
        {title ? (
          <p className="pb-3 text-center text-sm font-semibold text-muted-foreground">
            {title}
          </p>
        ) : null}
        <div className="flex gap-3">
          <TimeColumn
            label="Minutes"
            unit="m"
            values={minutesOptions}
            selected={minute}
            onSelect={(value) => handleSelect(value, second)}
          />
          <TimeColumn
            label="Seconds"
            unit="s"
            values={secondOptions}
            selected={second}
            onSelect={(value) => handleSelect(minute, value)}
          />
        </div>
      </div>
    </div>
  );
}
