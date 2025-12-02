import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { clamp, exerciseDuration, speak } from "@/lib/utils";
import type { ExerciseConfig } from "@/types";

export type Phase = "idle" | "prepare" | "work" | "rest" | "done";
type StepKind = "prepare" | "work" | "rest";

type Step = {
  kind: StepKind;
  duration: number;
  exerciseIndex: number;
  setNumber?: number;
  totalSets?: number;
  exerciseName?: string;
};

export const PREP_SECONDS = 10;

const buildSteps = (exercises: ExerciseConfig[]): Step[] => {
  const steps: Step[] = [];
  steps.push({ kind: "prepare", duration: PREP_SECONDS, exerciseIndex: -1 });

  exercises.forEach((exercise, exerciseIndex) => {
    for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) {
      steps.push({
        kind: "work",
        duration: exercise.workSeconds,
        exerciseIndex,
        setNumber,
        totalSets: exercise.sets,
        exerciseName: exercise.name,
      });

      const isLastSet = setNumber === exercise.sets;
      const restDuration = isLastSet
        ? exercise.restLastSeconds
        : exercise.restSeconds;

      if (restDuration > 0) {
        steps.push({
          kind: "rest",
          duration: restDuration,
          exerciseIndex,
          setNumber,
          totalSets: exercise.sets,
          exerciseName: exercise.name,
        });
      }
    }
  });

  return steps;
};

export function useHiitTimer() {
  const [sets, setSets] = useState(4);
  const [workSeconds, setWorkSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(60);

  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeExercises, setActiveExercises] = useState<ExerciseConfig[] | null>(null);
  const [activeWorkoutName, setActiveWorkoutName] = useState<string | null>(null);

  const lastCountdownSpoken = useRef<number | null>(null);
  const lastPhaseAnnounced = useRef<Phase | null>(null);

  const totalWorkoutSeconds = useMemo(
    () =>
      exerciseDuration({
        sets,
        workSeconds,
        restSeconds,
        restLastSeconds: 0,
      }),
    [restSeconds, sets, workSeconds],
  );

  const currentStep = steps[currentStepIndex] ?? null;

  const begin = useCallback(
    (exercises: ExerciseConfig[], workoutName?: string) => {
      if (!exercises.length) return;
      const normalized = exercises.map((exercise) => ({
        ...exercise,
        sets: clamp(exercise.sets, 1, 50),
        workSeconds: clamp(exercise.workSeconds, 5, 3600),
        restSeconds: clamp(exercise.restSeconds, 0, 3600),
        restLastSeconds: clamp(exercise.restLastSeconds ?? 0, 0, 3600),
      }));
      const builtSteps = buildSteps(normalized);
      setActiveExercises(normalized);
      setSteps(builtSteps);
      setCurrentStepIndex(builtSteps.length ? 0 : -1);
      setPhase(builtSteps.length ? "prepare" : "idle");
      setRemaining(builtSteps[0]?.duration ?? 0);
      setIsRunning(builtSteps.length > 0);
      setIsPaused(false);
      setActiveWorkoutName(workoutName ?? null);
      lastCountdownSpoken.current = null;
      lastPhaseAnnounced.current = null;
    },
    [],
  );

  const start = useCallback(() => {
    begin([
      {
        id: "single",
        name: "Work",
        sets,
        workSeconds,
        restSeconds,
        restLastSeconds: 0,
      },
    ]);
  }, [begin, restSeconds, sets, workSeconds]);

  const startRoutine = useCallback(
    (exercises: ExerciseConfig[], workoutName?: string) => {
      begin(exercises, workoutName);
    },
    [begin],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setRemaining(0);
    setCurrentStepIndex(-1);
    setSteps([]);
    setIsRunning(false);
    setIsPaused(false);
    setActiveExercises(null);
    setActiveWorkoutName(null);
    lastCountdownSpoken.current = null;
    lastPhaseAnnounced.current = null;
  }, []);

  const goNext = useCallback(() => {
    if (!steps.length) return;
    if (currentStepIndex >= steps.length - 1) {
      setPhase("done");
      setIsRunning(false);
      setIsPaused(false);
      setRemaining(0);
      return;
    }
    const nextIndex = currentStepIndex + 1;
    const nextStep = steps[nextIndex];
    setCurrentStepIndex(nextIndex);
    setPhase(nextStep.kind);
    setRemaining(nextStep.duration);
  }, [currentStepIndex, steps]);

  const skipForward = () => {
    if (!isRunning) return;
    goNext();
  };

  const skipBack = () => {
    if (!isRunning || !currentStep) return;
    const elapsed = currentStep.duration - remaining;
    if (elapsed >= 5) {
      setRemaining(currentStep.duration);
      return;
    }
    if (currentStepIndex === 0) {
      setRemaining(currentStep.duration);
      return;
    }
    const prevIndex = currentStepIndex - 1;
    const prevStep = steps[prevIndex];
    setCurrentStepIndex(prevIndex);
    setPhase(prevStep.kind);
    setRemaining(prevStep.duration);
  };

  const togglePause = () => {
    if (!isRunning || phase === "done") return;
    setIsPaused((prev) => !prev);
  };

  const overallRemaining = useMemo(() => {
    if (phase === "idle") return totalWorkoutSeconds + PREP_SECONDS;
    if (phase === "done") return 0;
    const remainingFuture = steps
      .slice(currentStepIndex + 1)
      .reduce((sum, step) => sum + step.duration, 0);
    return remaining + remainingFuture;
  }, [currentStepIndex, phase, remaining, steps, totalWorkoutSeconds]);

  useEffect(() => {
    if (!isRunning || isPaused || remaining <= 0 || phase === "done") return;
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPaused, isRunning, phase, remaining]);

  useEffect(() => {
    if (!isRunning || isPaused || phase === "done") return;
    if (remaining > 0) return;
    goNext();
  }, [goNext, isPaused, isRunning, phase, remaining]);

  useEffect(() => {
    if (!isRunning || isPaused || phase === "done") return;
    if (remaining <= 5 && remaining > 0) {
      if (lastCountdownSpoken.current !== remaining) {
        speak(String(remaining));
        lastCountdownSpoken.current = remaining;
      }
    } else if (remaining > 5) {
      lastCountdownSpoken.current = null;
    }
  }, [isPaused, isRunning, phase, remaining]);

  useEffect(() => {
    if (phase === lastPhaseAnnounced.current) return;
    lastPhaseAnnounced.current = phase;
    if (phase === "idle") return;
    if (phase === "done") {
      speak("Great work!");
      return;
    }
    if (phase === "prepare") {
      speak("Prepare");
      return;
    }
    if (phase === "work") {
      const name = currentStep?.exerciseName;
      speak(name ? `Work ${name}` : "Work");
      return;
    }
    speak("Rest");
  }, [currentStep?.exerciseName, phase]);

  const currentExerciseIndex = currentStep?.exerciseIndex ?? 0;
  const currentExercise =
    currentExerciseIndex >= 0
      ? activeExercises?.[currentExerciseIndex] ?? null
      : null;

  return {
    controls: {
      sets,
      workSeconds,
      restSeconds,
      setSets: (value: number) => setSets(clamp(value, 1, 20)),
      setWorkSeconds: (value: number) => setWorkSeconds(clamp(value, 5, 600)),
      setRestSeconds: (value: number) => setRestSeconds(clamp(value, 5, 600)),
    },
    status: {
      phase,
      remaining,
      currentSet: currentStep?.setNumber ?? 0,
      setsForCurrent: currentStep?.totalSets ?? currentExercise?.sets ?? 0,
      totalWorkoutSeconds,
      overallRemaining,
      isPaused,
      stepDuration: currentStep?.duration ?? 0,
      exerciseName: currentStep?.exerciseName ?? activeWorkoutName ?? "",
      currentExerciseIndex,
      totalExercises: activeExercises?.length ?? 0,
    },
    actions: {
      start,
      startRoutine,
      reset,
      skipBack,
      skipForward,
      togglePause,
    },
    isRunning,
    prepSeconds: PREP_SECONDS,
    activeWorkoutName,
  };
}
