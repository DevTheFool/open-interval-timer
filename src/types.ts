export type ExerciseConfig = {
  id: string;
  name: string;
  sets: number;
  workSeconds: number;
  restSeconds: number;
  restLastSeconds: number;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  exercises: ExerciseConfig[];
};
