import { useCallback, useEffect, useState } from "react";

export const FIRST_ARRIVAL_KEY = "lab-first-arrival-date";
const AUTO_CLOSE_MS = 4000;

export const useNotifications = () => {
  const [weeklyGreetingOpen, setWeeklyGreetingOpen] = useState(false);
  const [weekendFarewellOpen, setWeekendFarewellOpen] = useState(false);
  const [firstArrivalOpen, setFirstArrivalOpen] = useState(false);
  const [firstArrivalName, setFirstArrivalName] = useState("");
  const [combinedOpen, setCombinedOpen] = useState(false);
  const [combinedName, setCombinedName] = useState("");

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

  useEffect(() => {
    if (!combinedOpen) return;
    const id = window.setTimeout(() => setCombinedOpen(false), AUTO_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [combinedOpen]);

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

  const showFirstWeeklyCombined = useCallback((name: string) => {
    setCombinedName(name);
    setCombinedOpen(true);
  }, []);
  const hideFirstWeeklyCombined = useCallback(() => setCombinedOpen(false), []);

  return {
    weeklyGreetingOpen,
    weekendFarewellOpen,
    firstArrivalOpen,
    firstArrivalName,
    combinedOpen,
    combinedName,
    showWeeklyGreeting,
    hideWeeklyGreeting,
    showWeekendFarewell,
    hideWeekendFarewell,
    showFirstArrival,
    hideFirstArrival,
    showFirstWeeklyCombined,
    hideFirstWeeklyCombined,
  };
};
