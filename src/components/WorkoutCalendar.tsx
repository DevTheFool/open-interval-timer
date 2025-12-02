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
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday as first day
  const days: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, i - startOffset + 1);
    days.push({ date: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), inMonth: true });
  }
  let overflowDay = 1;
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(year, month + 1, overflowDay), inMonth: false });
    overflowDay++;
  }

  return (
    <div className="rounded-3xl border border-input/40 bg-background/60 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Workout history
          </p>
          <p className="text-sm font-semibold">
            {today.toLocaleString("default", { month: "long" })} {year}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-emerald-500/50" />
            Logged
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-slate-800" />
            No log
          </span>
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
          const isToday = key === toDateKey(today);
          const isLogged = completedDates.has(key);
          const baseClasses = inMonth
            ? "bg-slate-900 text-foreground border-input/40"
            : "bg-slate-900/40 text-muted-foreground border-input/20";
          const loggedClasses = isLogged
            ? "bg-emerald-600/40 border-emerald-500/40"
            : "";
          const todayClasses = isToday
            ? "outline outline-1 outline-emerald-400/60"
            : "";
          return (
            <div
              key={key}
              className={`relative aspect-square rounded-xl border p-2 text-left ${baseClasses} ${loggedClasses} ${todayClasses}`}
            >
              <span className="absolute left-2 top-2 text-xs font-semibold">
                {date.getDate()}
              </span>
              {isLogged && (
                <span className="absolute bottom-1 right-1 text-lg">💪</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
