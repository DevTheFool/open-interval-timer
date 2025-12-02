import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { clamp, speak } from "@/lib/utils";

export type Phase = "idle" | "prepare" | "work" | "rest" | "done";

const PREP_SECONDS = 10;

export function useHiitTimer() {
  const [sets, setSets] = useState(4);
  const [workSeconds, setWorkSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(60);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const lastCountdownSpoken = useRef<number | null>(null);
  const lastPhaseAnnounced = useRef<Phase | null>(null);
  const historyPushed = useRef(false);

  const totalWorkoutSeconds = useMemo(
    () => sets * workSeconds + Math.max(sets - 1, 0) * restSeconds,
    [restSeconds, sets, workSeconds]
  );

  const start = useCallback(() => {
    setPhase("prepare");
    setRemaining(PREP_SECONDS);
    setCurrentSet(1);
    setIsRunning(true);
    setIsPaused(false);
    speak("Prepare");
  }, []);

  const reset = useCallback((opts?: { fromPop?: boolean }) => {
    setPhase("idle");
    setRemaining(0);
    setCurrentSet(1);
    setIsRunning(false);
    setIsPaused(false);
    lastCountdownSpoken.current = null;
    lastPhaseAnnounced.current = null;

    if (historyPushed.current && typeof window !== "undefined") {
      historyPushed.current = false;
      if (!opts?.fromPop) {
        history.back();
      }
    }
  }, []);

  const goNext = useCallback(() => {
    if (phase === "prepare") {
      setPhase("work");
      setRemaining(workSeconds);
      return;
    }
    if (phase === "work") {
      if (currentSet >= sets) {
        setPhase("done");
        setIsRunning(false);
        setIsPaused(false);
        setRemaining(0);
        return;
      }
      setPhase("rest");
      setRemaining(restSeconds);
      return;
    }
    if (phase === "rest") {
      const nextSet = Math.min(currentSet + 1, sets);
      setCurrentSet(nextSet);
      setPhase("work");
      setRemaining(workSeconds);
    }
  }, [currentSet, phase, restSeconds, sets, workSeconds]);

  const goBack = useCallback(() => {
    if (phase === "prepare") {
      setRemaining(PREP_SECONDS);
      return;
    }
    if (phase === "work") {
      const elapsed = workSeconds - remaining;
      if (elapsed >= 5) {
        setRemaining(workSeconds);
        return;
      }
      if (currentSet === 1) {
        setPhase("prepare");
        setRemaining(PREP_SECONDS);
        return;
      }
      setCurrentSet(currentSet - 1);
      setPhase("rest");
      setRemaining(restSeconds);
      return;
    }
    if (phase === "rest") {
      const elapsed = restSeconds - remaining;
      if (elapsed >= 5) {
        setRemaining(restSeconds);
        return;
      }
      setPhase("work");
      setRemaining(workSeconds);
    }
  }, [currentSet, phase, remaining, restSeconds, workSeconds]);

  const skipForward = () => {
    if (!isRunning) return;
    goNext();
  };

  const skipBack = () => {
    if (!isRunning) return;
    goBack();
  };

  const togglePause = () => {
    if (!isRunning || phase === "done") return;
    setIsPaused((prev) => !prev);
  };

  const overallRemaining = useMemo(() => {
    if (phase === "idle") return totalWorkoutSeconds + PREP_SECONDS;
    if (phase === "done") return 0;

    const remainingWorkAndRest = (
      workSetsLeft: number,
      restSlotsLeft: number
    ) => workSetsLeft * workSeconds + restSlotsLeft * restSeconds;

    if (phase === "prepare") {
      return remaining + remainingWorkAndRest(sets, Math.max(sets - 1, 0));
    }

    if (phase === "work") {
      const remainingSetsAfter = Math.max(sets - currentSet, 0);
      const restSlots =
        (currentSet < sets ? 1 : 0) + Math.max(remainingSetsAfter - 1, 0);
      return remaining + remainingWorkAndRest(remainingSetsAfter, restSlots);
    }

    if (phase === "rest") {
      const remainingSetsAfterRest = Math.max(sets - currentSet, 0);
      const restSlotsAfter = Math.max(remainingSetsAfterRest - 1, 0);
      return (
        remaining + remainingWorkAndRest(remainingSetsAfterRest, restSlotsAfter)
      );
    }

    return remaining;
  }, [
    currentSet,
    phase,
    remaining,
    restSeconds,
    sets,
    totalWorkoutSeconds,
    workSeconds,
  ]);

  useEffect(() => {
    if (!isRunning || isPaused || remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPaused, isRunning, remaining]);

  useEffect(() => {
    if (!isRunning || isPaused || remaining > 0) return;
    goNext();
  }, [goNext, isPaused, isRunning, remaining]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    if (remaining <= 5 && remaining > 0) {
      if (lastCountdownSpoken.current !== remaining) {
        speak(String(remaining));
        lastCountdownSpoken.current = remaining;
      }
    } else if (remaining > 5) {
      lastCountdownSpoken.current = null;
    }
  }, [isPaused, isRunning, remaining]);

  useEffect(() => {
    if (phase === lastPhaseAnnounced.current) return;
    lastPhaseAnnounced.current = phase;
    if (phase === "idle") return;
    if (phase === "done") {
      speak("Great work!");
      return;
    }
    speak(phase === "prepare" ? "Prepare" : phase === "work" ? "Work" : "Rest");
  }, [phase]);

  useEffect(() => {
    const handlePop = (event: PopStateEvent) => {
      if (historyPushed.current && phase !== "idle" && phase !== "done") {
        event.preventDefault();
        reset({ fromPop: true });
        historyPushed.current = false;
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [phase, reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (phase !== "idle" && phase !== "done") {
      if (!historyPushed.current) {
        history.pushState({ screen: "run" }, "", window.location.href);
        historyPushed.current = true;
      }
    } else if (historyPushed.current) {
      historyPushed.current = false;
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search + window.location.hash
      );
    }
  }, [phase]);

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
      currentSet,
      totalWorkoutSeconds,
      overallRemaining,
      isPaused,
    },
    actions: {
      start,
      reset,
      skipBack,
      skipForward,
      togglePause,
    },
    isRunning,
    prepSeconds: PREP_SECONDS,
  };
}
