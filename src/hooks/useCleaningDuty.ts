import { useState, useEffect, useCallback } from "react";

export const LS_CLEANING_CONFIG = "cleaningDuty.rotationConfig";
export const LS_MANUAL_DUTY = "cleaningDuty.manualThisWeek";

export interface CleaningDutyConfig {
  members: string[];
  currentIndex: number;
  lastRotatedWeek: string;
}

export const getWeekKey = (date = new Date()): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

export const loadCleaningConfig = (): CleaningDutyConfig => {
  try {
    const raw = localStorage.getItem(LS_CLEANING_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.members)) {
        return {
          members: parsed.members,
          currentIndex:
            typeof parsed.currentIndex === "number" && parsed.members.length > 0
              ? ((parsed.currentIndex % parsed.members.length) + parsed.members.length) % parsed.members.length
              : 0,
          lastRotatedWeek: parsed.lastRotatedWeek || getWeekKey(),
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    members: [],
    currentIndex: 0,
    lastRotatedWeek: getWeekKey(),
  };
};

export const saveCleaningConfig = (config: CleaningDutyConfig) => {
  try {
    localStorage.setItem(LS_CLEANING_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new Event("cleaningDutyConfigChanged"));
  } catch {
    // ignore
  }
};

export const useCleaningDuty = () => {
  const [config, setConfig] = useState<CleaningDutyConfig>(() => {
    const initial = loadCleaningConfig();
    const currentWeek = getWeekKey();
    if (initial.members.length > 0 && initial.lastRotatedWeek && initial.lastRotatedWeek !== currentWeek) {
      const nextIndex = (initial.currentIndex + 1) % initial.members.length;
      const updated = {
        ...initial,
        currentIndex: nextIndex,
        lastRotatedWeek: currentWeek,
      };
      saveCleaningConfig(updated);
      return updated;
    }
    return initial;
  });

  const [manualThisWeek, setManualThisWeekState] = useState<string | null>(() =>
    localStorage.getItem(LS_MANUAL_DUTY)
  );

  useEffect(() => {
    const onConfigChange = () => {
      setConfig(loadCleaningConfig());
      setManualThisWeekState(localStorage.getItem(LS_MANUAL_DUTY));
    };

    window.addEventListener("cleaningDutyConfigChanged", onConfigChange);
    window.addEventListener("storage", onConfigChange);
    return () => {
      window.removeEventListener("cleaningDutyConfigChanged", onConfigChange);
      window.removeEventListener("storage", onConfigChange);
    };
  }, []);

  // Check weekly auto-rotation periodically
  useEffect(() => {
    const checkRotation = () => {
      const currentWeek = getWeekKey();
      setConfig((prev) => {
        if (prev.members.length > 0 && prev.lastRotatedWeek !== currentWeek) {
          const nextIndex = (prev.currentIndex + 1) % prev.members.length;
          const updated = {
            ...prev,
            currentIndex: nextIndex,
            lastRotatedWeek: currentWeek,
          };
          saveCleaningConfig(updated);
          return updated;
        }
        return prev;
      });
    };

    const interval = setInterval(checkRotation, 60_000);
    return () => clearInterval(interval);
  }, []);

  const effectiveThisWeek =
    manualThisWeek?.trim() ||
    (config.members.length > 0
      ? config.members[config.currentIndex % config.members.length]
      : null);

  const nextWeek =
    config.members.length > 1
      ? config.members[(config.currentIndex + 1) % config.members.length]
      : null;

  const isCleaningDutyUser = useCallback(
    (userName: string): boolean => {
      if (!effectiveThisWeek || !userName) return false;
      const duty = effectiveThisWeek.trim().toLowerCase();
      const user = userName.trim().toLowerCase();
      if (!duty || !user) return false;
      return user === duty || user.includes(duty) || duty.includes(user);
    },
    [effectiveThisWeek]
  );

  const addMember = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setConfig((prev) => {
      if (prev.members.includes(trimmed)) return prev;
      const updated = {
        ...prev,
        members: [...prev.members, trimmed],
      };
      saveCleaningConfig(updated);
      return updated;
    });
  }, []);

  const removeMember = useCallback((index: number) => {
    setConfig((prev) => {
      if (index < 0 || index >= prev.members.length) return prev;
      const newMembers = prev.members.filter((_, i) => i !== index);
      let newCurrent = prev.currentIndex;
      if (newMembers.length === 0) {
        newCurrent = 0;
      } else if (index < prev.currentIndex) {
        newCurrent = prev.currentIndex - 1;
      } else if (newCurrent >= newMembers.length) {
        newCurrent = 0;
      }
      const updated = {
        ...prev,
        members: newMembers,
        currentIndex: newCurrent,
      };
      saveCleaningConfig(updated);
      return updated;
    });
  }, []);

  const moveMember = useCallback((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.members.length ||
        toIndex < 0 ||
        toIndex >= prev.members.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      const newMembers = [...prev.members];
      const [item] = newMembers.splice(fromIndex, 1);
      newMembers.splice(toIndex, 0, item);

      // keep currently active person active
      const currentPerson = prev.members[prev.currentIndex];
      const newCurrent = newMembers.indexOf(currentPerson);

      const updated = {
        ...prev,
        members: newMembers,
        currentIndex: newCurrent >= 0 ? newCurrent : 0,
      };
      saveCleaningConfig(updated);
      return updated;
    });
  }, []);

  const setCurrentIndex = useCallback((index: number) => {
    setConfig((prev) => {
      if (index < 0 || index >= prev.members.length) return prev;
      const updated = {
        ...prev,
        currentIndex: index,
        lastRotatedWeek: getWeekKey(),
      };
      saveCleaningConfig(updated);
      return updated;
    });
    // clear manual override if selecting an index directly
    localStorage.removeItem(LS_MANUAL_DUTY);
    setManualThisWeekState(null);
  }, []);

  const nextDuty = useCallback(() => {
    setConfig((prev) => {
      if (prev.members.length === 0) return prev;
      const updated = {
        ...prev,
        currentIndex: (prev.currentIndex + 1) % prev.members.length,
        lastRotatedWeek: getWeekKey(),
      };
      saveCleaningConfig(updated);
      return updated;
    });
    localStorage.removeItem(LS_MANUAL_DUTY);
    setManualThisWeekState(null);
  }, []);

  const prevDuty = useCallback(() => {
    setConfig((prev) => {
      if (prev.members.length === 0) return prev;
      const updated = {
        ...prev,
        currentIndex: (prev.currentIndex - 1 + prev.members.length) % prev.members.length,
        lastRotatedWeek: getWeekKey(),
      };
      saveCleaningConfig(updated);
      return updated;
    });
    localStorage.removeItem(LS_MANUAL_DUTY);
    setManualThisWeekState(null);
  }, []);

  const setManualThisWeek = useCallback((val: string | null) => {
    if (val && val.trim()) {
      localStorage.setItem(LS_MANUAL_DUTY, val.trim());
      setManualThisWeekState(val.trim());
    } else {
      localStorage.removeItem(LS_MANUAL_DUTY);
      setManualThisWeekState(null);
    }
    window.dispatchEvent(new Event("cleaningDutyConfigChanged"));
  }, []);

  return {
    thisWeek: effectiveThisWeek,
    nextWeek,
    members: config.members,
    currentIndex: config.currentIndex,
    isCleaningDutyUser,
    manualThisWeek,
    addMember,
    removeMember,
    moveMember,
    setCurrentIndex,
    nextDuty,
    prevDuty,
    setManualThisWeek,
  };
};

