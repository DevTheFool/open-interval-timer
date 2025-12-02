import { useEffect, useState } from "react";

import { createId } from "@/lib/utils";
import type { ExerciseConfig, WorkoutPlan } from "@/types";

const STORAGE_KEY = "hiit-workouts";

const readStored = (): WorkoutPlan[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkoutPlan[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((workout) => ({
      ...workout,
      exercises: (workout.exercises ?? []).map((exercise) => ({
        ...exercise,
        restLastSeconds: exercise.restLastSeconds ?? 0,
      })),
    }));
  } catch {
    return [];
  }
};

export function useWorkoutLibrary() {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>(() => readStored());

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  const createWorkout = () => {
    const workout: WorkoutPlan = {
      id: createId(),
      name: "New workout",
      exercises: [],
    };
    setWorkouts((prev) => [workout, ...prev]);
    return workout;
  };

  const updateWorkout = (id: string, update: Partial<WorkoutPlan>) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === id ? { ...workout, ...update } : workout,
      ),
    );
  };

  const deleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
  };

  const upsertExercise = (workoutId: string, exercise: ExerciseConfig) => {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id !== workoutId) return workout;
        const exists = workout.exercises.some((item) => item.id === exercise.id);
        const exercises = exists
          ? workout.exercises.map((item) =>
              item.id === exercise.id ? exercise : item,
            )
          : [...workout.exercises, exercise];
        return { ...workout, exercises };
      }),
    );
  };

  const deleteExercise = (workoutId: string, exerciseId: string) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.filter(
                (exercise) => exercise.id !== exerciseId,
              ),
            }
          : workout,
      ),
    );
  };

  const getWorkout = (id: string) =>
    workouts.find((workout) => workout.id === id);

  return {
    workouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    upsertExercise,
    deleteExercise,
    getWorkout,
  };
}
