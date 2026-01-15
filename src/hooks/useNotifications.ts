import { useCallback, useEffect, useState } from "react";

export const FIRST_ARRIVAL_KEY = "lab-first-arrival-date";
const AUTO_CLOSE_MS = 4000;

export const useNotifications = () => {
  const [weeklyGreetingOpen, setWeeklyGreetingOpen] = useState(false);
  const [weekendFarewellOpen, setWeekendFarewellOpen] = useState(false);
  const [firstArrivalOpen, setFirstArrivalOpen] = useState(false);
  const [firstArrivalName, setFirstArrivalName] = useState("");

  useEffect(() => {
    if (!weeklyGreetingOpen) return;
    const id = window.setTimeout(
      () => setWeeklyGreetingOpen(false),
      AUTO_CLOSE_MS
    );
    return () => window.clearTimeout(id);
  }, [weeklyGreetingOpen]);

  useEffect(() => {
    if (!weekendFarewellOpen) return;
    const id = window.setTimeout(
      () => setWeekendFarewellOpen(false),
      AUTO_CLOSE_MS
    );
    return () => window.clearTimeout(id);
  }, [weekendFarewellOpen]);

  useEffect(() => {
    if (!firstArrivalOpen) return;
    const id = window.setTimeout(
      () => setFirstArrivalOpen(false),
      AUTO_CLOSE_MS
    );
    return () => window.clearTimeout(id);
  }, [firstArrivalOpen]);

  const showWeeklyGreeting = useCallback(() => setWeeklyGreetingOpen(true), []);
  const hideWeeklyGreeting = useCallback(
    () => setWeeklyGreetingOpen(false),
    []
  );

  const showWeekendFarewell = useCallback(
    () => setWeekendFarewellOpen(true),
    []
  );
  const hideWeekendFarewell = useCallback(
    () => setWeekendFarewellOpen(false),
    []
  );

  const showFirstArrival = useCallback((name: string) => {
    setFirstArrivalName(name);
    setFirstArrivalOpen(true);
  }, []);
  const hideFirstArrival = useCallback(() => setFirstArrivalOpen(false), []);

  return {
    weeklyGreetingOpen,
    weekendFarewellOpen,
    firstArrivalOpen,
    firstArrivalName,
    showWeeklyGreeting,
    hideWeeklyGreeting,
    showWeekendFarewell,
    hideWeekendFarewell,
    showFirstArrival,
    hideFirstArrival,
  };
};
