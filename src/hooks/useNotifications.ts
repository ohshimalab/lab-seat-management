import { useCallback, useEffect, useState } from "react";

export const FIRST_ARRIVAL_KEY = "lab-first-arrival-date";
const AUTO_CLOSE_MS = 4000;
const DUTY_PROMPT_AUTO_CLOSE_MS = 9000; // longer so user can easily click 終わった/終わってない

export const useNotifications = () => {
  const [weeklyGreetingOpen, setWeeklyGreetingOpen] = useState(false);
  const [weekendFarewellOpen, setWeekendFarewellOpen] = useState(false);
  const [firstArrivalOpen, setFirstArrivalOpen] = useState(false);
  const [firstArrivalName, setFirstArrivalName] = useState("");
  const [combinedOpen, setCombinedOpen] = useState(false);
  const [combinedName, setCombinedName] = useState("");

  const [cleaningDutyArrivalOpen, setCleaningDutyArrivalOpen] = useState(false);
  const [cleaningDutyArrivalName, setCleaningDutyArrivalName] = useState("");

  const [cleaningDutyDepartureOpen, setCleaningDutyDepartureOpen] =
    useState(false);
  const [cleaningDutyDepartureName, setCleaningDutyDepartureName] =
    useState("");

  const [cleaningDutyFinishedToastOpen, setCleaningDutyFinishedToastOpen] =
    useState(false);
  const [cleaningDutyFinishedName, setCleaningDutyFinishedName] = useState("");

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

  useEffect(() => {
    if (!cleaningDutyArrivalOpen) return;
    const id = window.setTimeout(
      () => setCleaningDutyArrivalOpen(false),
      AUTO_CLOSE_MS + 1000
    );
    return () => window.clearTimeout(id);
  }, [cleaningDutyArrivalOpen]);

  useEffect(() => {
    if (!cleaningDutyDepartureOpen) return;
    const id = window.setTimeout(
      () => setCleaningDutyDepartureOpen(false),
      DUTY_PROMPT_AUTO_CLOSE_MS
    );
    return () => window.clearTimeout(id);
  }, [cleaningDutyDepartureOpen]);

  useEffect(() => {
    if (!cleaningDutyFinishedToastOpen) return;
    const id = window.setTimeout(
      () => setCleaningDutyFinishedToastOpen(false),
      AUTO_CLOSE_MS
    );
    return () => window.clearTimeout(id);
  }, [cleaningDutyFinishedToastOpen]);

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

  const showCleaningDutyArrival = useCallback((name: string) => {
    setCleaningDutyArrivalName(name);
    setCleaningDutyArrivalOpen(true);
  }, []);
  const hideCleaningDutyArrival = useCallback(
    () => setCleaningDutyArrivalOpen(false),
    []
  );

  const showCleaningDutyDeparture = useCallback((name: string) => {
    setCleaningDutyDepartureName(name);
    setCleaningDutyDepartureOpen(true);
  }, []);
  const hideCleaningDutyDeparture = useCallback(
    () => setCleaningDutyDepartureOpen(false),
    []
  );

  const showCleaningDutyFinishedToast = useCallback((name: string) => {
    setCleaningDutyFinishedName(name);
    setCleaningDutyFinishedToastOpen(true);
  }, []);
  const hideCleaningDutyFinishedToast = useCallback(
    () => setCleaningDutyFinishedToastOpen(false),
    []
  );

  return {
    weeklyGreetingOpen,
    weekendFarewellOpen,
    firstArrivalOpen,
    firstArrivalName,
    combinedOpen,
    combinedName,
    cleaningDutyArrivalOpen,
    cleaningDutyArrivalName,
    cleaningDutyDepartureOpen,
    cleaningDutyDepartureName,
    cleaningDutyFinishedToastOpen,
    cleaningDutyFinishedName,
    showWeeklyGreeting,
    hideWeeklyGreeting,
    showWeekendFarewell,
    hideWeekendFarewell,
    showFirstArrival,
    hideFirstArrival,
    showFirstWeeklyCombined,
    hideFirstWeeklyCombined,
    showCleaningDutyArrival,
    hideCleaningDutyArrival,
    showCleaningDutyDeparture,
    hideCleaningDutyDeparture,
    showCleaningDutyFinishedToast,
    hideCleaningDutyFinishedToast,
  };
};

