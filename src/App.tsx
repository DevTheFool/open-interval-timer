import "./index.css";

import { useEffect, useRef, useState } from "react";

import { ExerciseEditor } from "@/components/ExerciseEditor";
import { RunningView } from "@/components/RunningView";
import { TimerSetup } from "@/components/TimerSetup";
import { useHiitTimer } from "@/hooks/useHiitTimer";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useWorkoutLibrary } from "@/hooks/useWorkoutLibrary";
import { WorkoutEditor } from "@/components/WorkoutEditor";
import type { WorkoutPlan } from "@/types";

type Screen = "setup" | "workout-editor" | "exercise-editor" | "running";

export default function App() {
  const { controls, status, actions, isRunning, prepSeconds } = useHiitTimer();
  const { start, startRoutine, reset, skipBack, skipForward, togglePause } =
    actions;
  const {
    sets,
    workSeconds,
    restSeconds,
    setSets,
    setWorkSeconds,
    setRestSeconds,
  } = controls;
  const {
    phase,
    remaining,
    currentSet,
    setsForCurrent,
    stepDuration,
    exerciseName,
    currentExerciseIndex,
    totalExercises,
    totalWorkoutSeconds,
    overallRemaining,
    isPaused,
  } = status;
  const { dates, markCompleted } = useWorkoutHistory();
  const {
    workouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    upsertExercise,
    deleteExercise,
    getWorkout,
  } = useWorkoutLibrary();

  const [screen, setScreen] = useState<Screen>("setup");
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null,
  );
  const [newWorkoutId, setNewWorkoutId] = useState<string | null>(null);

  const activeWorkout =
    editingWorkoutId && workouts.length
      ? getWorkout(editingWorkoutId) ?? null
      : null;
  const activeExercise =
    editingExerciseId && activeWorkout
      ? activeWorkout.exercises.find(
          (exercise) => exercise.id === editingExerciseId,
        ) ?? null
      : null;

  const prevPhase = useRef(phase);

  useEffect(() => {
    if (prevPhase.current !== "done" && phase === "done") {
      markCompleted(new Date());
    }
    prevPhase.current = phase;
  }, [markCompleted, phase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    history.replaceState({ screen: "setup" }, "", window.location.href);
  }, []);

  useEffect(() => {
    if (
      activeWorkout &&
      newWorkoutId === activeWorkout.id &&
      activeWorkout.exercises.length > 0
    ) {
      setNewWorkoutId(null);
    }
  }, [activeWorkout, newWorkoutId]);

  useEffect(() => {
    const handlePop = (event: PopStateEvent) => {
      const nextScreen = (event.state?.screen as Screen) ?? "setup";
      const workoutId = (event.state?.workoutId as string | null) ?? null;
      const exerciseId = (event.state?.exerciseId as string | null) ?? null;
      if (phase !== "idle" && phase !== "done") {
        reset();
      }
      if (activeWorkout && activeWorkout.exercises.length === 0) {
        deleteWorkout(activeWorkout.id);
        setNewWorkoutId(null);
      }
      setScreen(nextScreen);
      setEditingWorkoutId(workoutId);
      setEditingExerciseId(exerciseId);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [activeWorkout, deleteWorkout, phase, reset]);

  useEffect(() => {
    if (screen !== "running") return;
    if (phase === "idle" || phase === "done") {
      if (typeof window !== "undefined") {
        history.replaceState({ screen: "setup" }, "", window.location.href);
      }
      setScreen("setup");
      setEditingWorkoutId(null);
      setEditingExerciseId(null);
    }
  }, [phase, screen]);

  const pushScreen = (
    next: Screen,
    extraState?: { workoutId?: string | null; exerciseId?: string | null },
  ) => {
    if (typeof window === "undefined") return;
    const payload = { screen: next, ...extraState };
    history.pushState(payload, "", window.location.href);
    setScreen(next);
    setEditingWorkoutId(payload.workoutId ?? null);
    setEditingExerciseId(payload.exerciseId ?? null);
  };

  const isActive = phase !== "idle" && phase !== "done";
  const canStart = phase === "idle" || phase === "done";

  const handleStartRoutine = (workout: WorkoutPlan) => {
    if (!workout.exercises.length) return;
    pushScreen("running");
    startRoutine(workout.exercises, workout.name);
  };

  const handleStartSimple = () => {
    pushScreen("running");
    start();
  };

  const handleOpenWorkout = (workoutId: string) => {
    pushScreen("workout-editor", { workoutId, exerciseId: null });
  };

  const handleCreateWorkout = () => {
    const workout = createWorkout();
    setNewWorkoutId(workout.id);
    pushScreen("workout-editor", { workoutId: workout.id, exerciseId: null });
  };

  const handleCloseRun = () => {
    if (typeof window !== "undefined") {
      history.back();
    }
  };

  return (
    <div className="dark min-h-[100dvh]">
      {isActive ? (
        <RunningView
          phase={phase}
          remaining={remaining}
          currentSet={currentSet}
          setsForCurrent={setsForCurrent}
          stepDuration={stepDuration}
          exerciseName={exerciseName}
          currentExerciseIndex={currentExerciseIndex}
          totalExercises={totalExercises}
          totalRemaining={overallRemaining}
          isPaused={isPaused}
          onClose={handleCloseRun}
          onSkipBack={skipBack}
          onSkipForward={skipForward}
          onTogglePause={togglePause}
        />
      ) : screen === "workout-editor" && activeWorkout ? (
        <WorkoutEditor
          workout={activeWorkout}
          prepSeconds={prepSeconds}
          onBack={() => {
            if (activeWorkout.exercises.length === 0) {
              deleteWorkout(activeWorkout.id);
              setNewWorkoutId(null);
            }
            history.back();
          }}
          onUpdateName={(name) => updateWorkout(activeWorkout.id, { name })}
          onDelete={(id) => {
            deleteWorkout(id);
            if (newWorkoutId === id) setNewWorkoutId(null);
            history.back();
          }}
          onOpenExercise={(exerciseId) =>
            pushScreen("exercise-editor", {
              workoutId: activeWorkout.id,
              exerciseId,
            })
          }
        />
      ) : screen === "exercise-editor" && activeWorkout ? (
        <ExerciseEditor
          initial={activeExercise}
          onSave={(exercise) => upsertExercise(activeWorkout.id, exercise)}
          onDelete={(exerciseId) => {
            deleteExercise(activeWorkout.id, exerciseId);
            history.back();
          }}
          onBack={() => history.back()}
        />
      ) : (
        <TimerSetup
          sets={sets}
          workSeconds={workSeconds}
          restSeconds={restSeconds}
          setSets={setSets}
          setWorkSeconds={setWorkSeconds}
          setRestSeconds={setRestSeconds}
          totalWorkoutSeconds={totalWorkoutSeconds}
          prepSeconds={prepSeconds}
          onStart={handleStartSimple}
          canStart={canStart && !isRunning}
          completedDates={new Set(dates)}
          workouts={workouts}
          onSelectWorkout={handleStartRoutine}
          onEditWorkout={handleOpenWorkout}
          onCreateWorkout={handleCreateWorkout}
        />
      )}
    </div>
  );
}
