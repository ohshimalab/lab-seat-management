import { useState } from "react";
import type React from "react";
import { FIRST_ARRIVAL_KEY } from "./useNotifications";
import type { SeatState, SeatStatus, User } from "../types";

interface Params {
  users: User[];
  seatStates: Record<string, SeatState>;
  setSeatStates: React.Dispatch<
    React.SetStateAction<Record<string, SeatState>>
  >;
  hasUserSessionThisWeek: (userId: string) => boolean;
  startSession: (userId: string, seatId: string, startedAt: number) => void;
  endSession: (userId: string, seatId: string, endedAt: number) => void;
  showWeeklyGreeting: () => void;
  showWeekendFarewell: () => void;
  showFirstArrival: (name: string) => void;
  showFirstWeeklyCombined: (name: string) => void;
}

const isWeekendDay = (date: Date) => {
  const day = date.getDay();
  return day === 5 || day === 6 || day === 0; // Fri, Sat, Sun
};

export const useSeatAssignment = ({
  users,
  seatStates,
  setSeatStates,
  hasUserSessionThisWeek,
  startSession,
  endSession,
  showWeeklyGreeting,
  showWeekendFarewell,
  showFirstArrival,
  showFirstWeeklyCombined,
}: Params) => {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [randomUserId, setRandomUserId] = useState<string | null>(null);
  const [randomSeatId, setRandomSeatId] = useState<string | null>(null);

  const finalizeSeatOccupant = (seatId: string, now: number) => {
    const seat = seatStates[seatId];
    if (seat?.userId) endSession(seat.userId, seatId, now);
  };

  const finalizeAllSeats = (now: number) => {
    Object.keys(seatStates).forEach((seatId) =>
      finalizeSeatOccupant(seatId, now)
    );
  };

  // const maybeShowWeeklyGreeting = (userId: string) => {
  //   if (!hasUserSessionThisWeek(userId)) showWeeklyGreeting();
  // };

  const maybeShowCombinedOrSeparate = (userId: string, nowDate: Date) => {
    const todayKey = nowDate.toISOString().slice(0, 10);
    const recorded = localStorage.getItem(FIRST_ARRIVAL_KEY);
    const firstArrivalWouldShow = recorded !== todayKey;
    const weeklyWouldShow = !hasUserSessionThisWeek(userId);
    const name = users.find((u) => u.id === userId)?.name || "";
    if (firstArrivalWouldShow && weeklyWouldShow) {
      showFirstWeeklyCombined(name);
      localStorage.setItem(FIRST_ARRIVAL_KEY, todayKey);
      return;
    }
    if (firstArrivalWouldShow) {
      showFirstArrival(name);
      localStorage.setItem(FIRST_ARRIVAL_KEY, todayKey);
    }
    if (weeklyWouldShow) showWeeklyGreeting();
  };

  const handleSeatClick = (seatId: string) => {
    const currentUserId = seatStates[seatId]?.userId || null;
    setSelectedSeatId(seatId);
    if (currentUserId) setIsActionModalOpen(true);
    else setIsUserModalOpen(true);
  };

  const handleLeaveSeat = () => {
    if (!selectedSeatId) return;
    const nowDate = new Date();
    const now = nowDate.getTime();
    finalizeSeatOccupant(selectedSeatId, now);
    setSeatStates((prev) => ({
      ...prev,
      [selectedSeatId]: { userId: null, status: "present", startedAt: null },
    }));
    if (isWeekendDay(nowDate)) showWeekendFarewell();
    setIsActionModalOpen(false);
    setSelectedSeatId(null);
  };

  const handleUserSelect = (user: User) => {
    if (!selectedSeatId) return;
    const nowDate = new Date();
    const now = nowDate.getTime();
    setSeatStates((prev) => ({
      ...prev,
      [selectedSeatId]: {
        userId: user.id,
        status: "present",
        startedAt: now,
      },
    }));
    maybeShowCombinedOrSeparate(user.id, nowDate);
    startSession(user.id, selectedSeatId, now);
    setIsUserModalOpen(false);
    setSelectedSeatId(null);
  };

  const assignRandomSeatForUser = (user: User) => {
    const nowDate = new Date();
    const now = nowDate.getTime();
    const currentSeatId = Object.entries(seatStates).find(
      ([, value]) => value.userId === user.id
    )?.[0];
    if (currentSeatId) endSession(user.id, currentSeatId, now);

    let chosenSeat: string | null = null;
    setSeatStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key]?.userId === user.id) {
          next[key] = { userId: null, status: "present", startedAt: null };
        }
      });
      const emptySeats = Object.entries(next)
        .filter(([, value]) => value.userId === null)
        .map(([seatId]) => seatId);
      if (emptySeats.length === 0) return prev;
      chosenSeat =
        emptySeats[Math.floor(Math.random() * emptySeats.length)] || null;
      if (!chosenSeat) return prev;
      next[chosenSeat] = {
        userId: user.id,
        status: "present",
        startedAt: now,
      };
      return next;
    });
    if (chosenSeat) {
      maybeShowCombinedOrSeparate(user.id, nowDate);
      startSession(user.id, chosenSeat, now);
    }
    setRandomUserId(user.id);
    setRandomSeatId(chosenSeat);
  };

  const handleOpenRandom = () => {
    setRandomUserId(null);
    setRandomSeatId(null);
    setIsRandomModalOpen(true);
  };

  const handleRandomSelect = (user: User) => {
    assignRandomSeatForUser(user);
  };

  const handleToggleAway = () => {
    if (!selectedSeatId) return;
    setSeatStates((prev) => {
      const current = prev[selectedSeatId] || {
        userId: null,
        status: "present" as SeatStatus,
      };
      if (!current.userId) return prev;
      const nextStatus: SeatStatus =
        current.status === "away" ? "present" : "away";
      return {
        ...prev,
        [selectedSeatId]: { ...current, status: nextStatus },
      };
    });
    setIsActionModalOpen(false);
    setSelectedSeatId(null);
  };

  const getSelectedUserName = () => {
    if (!selectedSeatId) return "";
    const userId = seatStates[selectedSeatId]?.userId || null;
    return users.find((u) => u.id === userId)?.name || "";
  };

  return {
    selectedSeatId,
    isUserModalOpen,
    isActionModalOpen,
    isRandomModalOpen,
    randomUserId,
    randomSeatId,
    handleSeatClick,
    handleUserSelect,
    handleLeaveSeat,
    handleToggleAway,
    handleOpenRandom,
    handleRandomSelect,
    closeUserModal: () => setIsUserModalOpen(false),
    closeActionModal: () => setIsActionModalOpen(false),
    closeRandomModal: () => setIsRandomModalOpen(false),
    finalizeAllSeats,
    getSelectedUserName,
  };
};
