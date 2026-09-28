import { useState, useEffect, useCallback } from "react";

export const CLEANING_DUTY_STORAGE_KEY = "lab-cleaning-duty-config";

export interface CleaningDutyConfig {
  members: string[];
  currentIndex: number;
  lastRotatedMonday: string;
  completedWeeks: Record<string, boolean>;
}

export const getMondayOfWeek = (d: Date = new Date()): string => {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dayStr = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dayStr}`;
};

const DEFAULT_CONFIG: CleaningDutyConfig = {
  members: ["大島", "近藤", "佐藤", "鈴木", "高橋"],
  currentIndex: 0,
  lastRotatedMonday: getMondayOfWeek(),
  completedWeeks: {},
};

export const loadCleaningDutyConfig = (): CleaningDutyConfig => {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_CONFIG;
  }
  try {
    const raw = localStorage.getItem(CLEANING_DUTY_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      members: Array.isArray(parsed.members) ? parsed.members : DEFAULT_CONFIG.members,
      currentIndex: typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
      lastRotatedMonday: parsed.lastRotatedMonday || getMondayOfWeek(),
      completedWeeks: parsed.completedWeeks || {},
    };
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveCleaningDutyConfig = (config: CleaningDutyConfig): void => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(CLEANING_DUTY_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("cleaningDutyConfigChanged"));
  } catch (err) {
    console.error("Failed to save cleaning duty config", err);
  }
};

export const useCleaningDuty = () => {
  const [config, setConfig] = useState<CleaningDutyConfig>(() => {
    const loaded = loadCleaningDutyConfig();
    const currentMonday = getMondayOfWeek();
    // 自動更新サイクル: 毎週月曜日に自動で次の一人へ繰り上げ
    if (loaded.lastRotatedMonday && loaded.lastRotatedMonday !== currentMonday) {
      const nextIndex =
        loaded.members.length > 0
          ? (loaded.currentIndex + 1) % loaded.members.length
          : 0;
      const updated: CleaningDutyConfig = {
        ...loaded,
        currentIndex: nextIndex,
        lastRotatedMonday: currentMonday,
      };
      saveCleaningDutyConfig(updated);
      return updated;
    }
    return loaded;
  });

  const syncConfig = useCallback(() => {
    setConfig(loadCleaningDutyConfig());
  }, []);

  useEffect(() => {
    window.addEventListener("cleaningDutyConfigChanged", syncConfig);
    window.addEventListener("storage", syncConfig);
    return () => {
      window.removeEventListener("cleaningDutyConfigChanged", syncConfig);
      window.removeEventListener("storage", syncConfig);
    };
  }, [syncConfig]);

  // Periodic Monday check
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMonday = getMondayOfWeek();
      setConfig((prev) => {
        if (prev.lastRotatedMonday !== currentMonday) {
          const nextIndex =
            prev.members.length > 0
              ? (prev.currentIndex + 1) % prev.members.length
              : 0;
          const updated: CleaningDutyConfig = {
            ...prev,
            currentIndex: nextIndex,
            lastRotatedMonday: currentMonday,
          };
          saveCleaningDutyConfig(updated);
          return updated;
        }
        return prev;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const currentMonday = getMondayOfWeek();
  const isCompletedThisWeek = Boolean(config.completedWeeks[currentMonday]);

  const thisWeek =
    config.members.length > 0 && config.currentIndex < config.members.length
      ? config.members[config.currentIndex]
      : null;

  const nextWeek =
    config.members.length > 1
      ? config.members[(config.currentIndex + 1) % config.members.length]
      : null;

  const addMember = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setConfig((prev) => {
      if (prev.members.includes(trimmed)) return prev;
      const updated = { ...prev, members: [...prev.members, trimmed] };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  const removeMember = useCallback((index: number) => {
    setConfig((prev) => {
      const nextMembers = prev.members.filter((_, i) => i !== index);
      let nextIndex = prev.currentIndex;
      if (nextIndex >= nextMembers.length) {
        nextIndex = Math.max(0, nextMembers.length - 1);
      }
      const updated = {
        ...prev,
        members: nextMembers,
        currentIndex: nextIndex,
      };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  const moveMember = useCallback((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.members.length ||
        toIndex < 0 ||
        toIndex >= prev.members.length
      ) {
        return prev;
      }
      const currentMember = prev.members[prev.currentIndex];
      const nextMembers = [...prev.members];
      const [moved] = nextMembers.splice(fromIndex, 1);
      nextMembers.splice(toIndex, 0, moved);

      // Keep current assignment pointing to same person if possible
      let newCurrentIndex = nextMembers.indexOf(currentMember);
      if (newCurrentIndex === -1) newCurrentIndex = 0;

      const updated = {
        ...prev,
        members: nextMembers,
        currentIndex: newCurrentIndex,
      };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  const setCurrentIndex = useCallback((index: number) => {
    setConfig((prev) => {
      if (index < 0 || index >= prev.members.length) return prev;
      const updated = { ...prev, currentIndex: index };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  const nextDuty = useCallback(() => {
    setConfig((prev) => {
      if (prev.members.length === 0) return prev;
      const nextIndex = (prev.currentIndex + 1) % prev.members.length;
      const updated = { ...prev, currentIndex: nextIndex };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  const prevDuty = useCallback(() => {
    setConfig((prev) => {
      if (prev.members.length === 0) return prev;
      const prevIndex =
        (prev.currentIndex - 1 + prev.members.length) % prev.members.length;
      const updated = { ...prev, currentIndex: prevIndex };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  const completeThisWeek = useCallback(() => {
    const mondayKey = getMondayOfWeek();
    setConfig((prev) => {
      const updated = {
        ...prev,
        completedWeeks: {
          ...prev.completedWeeks,
          [mondayKey]: true,
        },
      };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  const resetThisWeekCompletion = useCallback(() => {
    const mondayKey = getMondayOfWeek();
    setConfig((prev) => {
      const nextCompleted = { ...prev.completedWeeks };
      delete nextCompleted[mondayKey];
      const updated = {
        ...prev,
        completedWeeks: nextCompleted,
      };
      saveCleaningDutyConfig(updated);
      return updated;
    });
  }, []);

  // 当該ユーザーの着席・離席時に通知を出すべきか
  const isUserDutyPending = useCallback(
    (userName: string): boolean => {
      if (!userName || !thisWeek) return false;
      if (isCompletedThisWeek) return false;
      return thisWeek.toLowerCase() === userName.toLowerCase();
    },
    [thisWeek, isCompletedThisWeek],
  );

  return {
    thisWeek,
    nextWeek,
    members: config.members,
    currentIndex: config.currentIndex,
    isCompletedThisWeek,
    currentMondayKey: currentMonday,
    addMember,
    removeMember,
    moveMember,
    setCurrentIndex,
    nextDuty,
    prevDuty,
    completeThisWeek,
    resetThisWeekCompletion,
    isUserDutyPending,
  };
};
