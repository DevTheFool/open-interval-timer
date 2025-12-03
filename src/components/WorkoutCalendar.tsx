import { useMemo, useState } from "react";

type Props = {
  completedDates: Set<string>;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function WorkoutCalendar({ completedDates }: Props) {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const monthDate = useMemo(
    () => new Date(view.year, view.month, 1),
    [view.month, view.year]
  );

  const days = useMemo(() => {
    const firstDay = new Date(view.year, view.month, 1);
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday as first day
    const list: Array<{ date: Date; inMonth: boolean }> = [];

    for (let i = 0; i < startOffset; i++) {
      const d = new Date(view.year, view.month, i - startOffset + 1);
      list.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ date: new Date(view.year, view.month, d), inMonth: true });
    }
    let overflowDay = 1;
    while (list.length % 7 !== 0) {
      list.push({
        date: new Date(view.year, view.month + 1, overflowDay),
        inMonth: false,
      });
      overflowDay++;
    }
    return list;
  }, [view.month, view.year]);

  const changeMonth = (delta: number) => {
    setView((prev) => {
      const nextMonth = prev.month + delta;
      const nextYear =
        nextMonth < 0
          ? prev.year - 1
          : nextMonth > 11
          ? prev.year + 1
          : prev.year;
      const normalizedMonth = (nextMonth + 12) % 12;
      return { year: nextYear, month: normalizedMonth };
    });
  };

  return (
    <div className="rounded-3xl border border-input/40 bg-background/60 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Workout history
          </p>
          <p className="text-sm font-semibold">
            {monthDate.toLocaleString("default", { month: "long" })}{" "}
            {monthDate.getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="h-9 w-9 rounded-lg border border-input/40 bg-input/20 text-sm font-semibold transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            &lt;
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="h-9 w-9 rounded-lg border border-input/40 bg-input/20 text-sm font-semibold transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-1 font-semibold">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(({ date, inMonth }) => {
          const key = toDateKey(date);
          const isToday = key === todayKey;
          const isLogged = completedDates.has(key);
          const baseClasses = inMonth
            ? "bg-slate-900 text-foreground border-input/40"
            : "bg-slate-900/40 text-muted-foreground border-input/20";
          const todayClasses = isToday
            ? "outline outline-1 outline-emerald-400/60"
            : "";
          return (
            <div
              key={key}
              className={`relative aspect-square rounded-xl border p-2 text-left ${baseClasses} ${todayClasses}`}
            >
              <span className="absolute left-2 top-2 text-xs font-semibold">
                {date.getDate()}
              </span>
              {isLogged && (
                <span className="absolute bottom-1 right-1 text-md">💪</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
