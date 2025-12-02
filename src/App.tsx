import "./index.css";

import { useEffect, useRef } from "react";

import { RunningView } from "@/components/RunningView";
import { TimerSetup } from "@/components/TimerSetup";
import { useHiitTimer } from "@/hooks/useHiitTimer";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";

export default function App() {
  const { controls, status, actions, isRunning, prepSeconds } = useHiitTimer();
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
    totalWorkoutSeconds,
    overallRemaining,
    isPaused,
  } = status;
  const { dates, markCompleted } = useWorkoutHistory();

  const prevPhase = useRef(phase);

  useEffect(() => {
    if (prevPhase.current !== "done" && phase === "done") {
      markCompleted(new Date());
    }
    prevPhase.current = phase;
  }, [markCompleted, phase]);

  const isActive = phase !== "idle" && phase !== "done";
  const canStart = phase === "idle" || phase === "done";

  return (
    <div className="dark min-h-[100dvh]">
      {isActive ? (
        <RunningView
          phase={phase}
          remaining={remaining}
          currentSet={currentSet}
          sets={sets}
          workDuration={workSeconds}
          restDuration={restSeconds}
          totalRemaining={overallRemaining}
          isPaused={isPaused}
          onClose={actions.reset}
          onSkipBack={actions.skipBack}
          onSkipForward={actions.skipForward}
          onTogglePause={actions.togglePause}
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
          onStart={actions.start}
          canStart={canStart && !isRunning}
          completedDates={new Set(dates)}
        />
      )}
    </div>
  );
}
