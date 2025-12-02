import { useEffect, useState } from "react";

const STORAGE_KEY = "workout-history";

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function useWorkoutHistory() {
  const [dates, setDates] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  }, [dates]);

  const markCompleted = (date: Date = new Date()) => {
    const key = toDateKey(date);
    setDates(prev => (prev.includes(key) ? prev : [...prev, key]));
  };

  return { dates, markCompleted };
}
