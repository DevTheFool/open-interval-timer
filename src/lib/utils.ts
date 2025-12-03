import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatSeconds = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const beep = () => {
  if (typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    ctx.resume?.();
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      ctx.close?.().catch(() => {});
    };
  } catch {
    // ignore audio errors
  }
};

export const speak = (text: string) => {
  if (typeof window === "undefined") return;
  const hasSpeech = "speechSynthesis" in window;
  if (!hasSpeech) {
    beep();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  utterance.onerror = () => {
    beep();
  };
};

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export const exerciseDuration = (exercise: {
  sets: number;
  workSeconds: number;
  restSeconds: number;
  restLastSeconds?: number;
}) => {
  const betweenSetsRest = Math.max(exercise.sets - 1, 0) * exercise.restSeconds;
  const finalRest = Math.max(exercise.restLastSeconds ?? 0, 0);
  return exercise.sets * exercise.workSeconds + betweenSetsRest + finalRest;
};

export const workoutDuration = (
  exercises: Array<{
    sets: number;
    workSeconds: number;
    restSeconds: number;
    restLastSeconds?: number;
  }>,
  prepSeconds = 0
) => {
  return (
    prepSeconds +
    exercises.reduce((total, exercise) => total + exerciseDuration(exercise), 0)
  );
};
