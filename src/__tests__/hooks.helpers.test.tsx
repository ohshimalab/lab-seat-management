import { render, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React, { useEffect, useState } from "react";
import { useAdminActions } from "../hooks/useAdminActions";
import { useSeatAvailability } from "../hooks/useSeatAvailability";
import { useStorageIO } from "../hooks/useStorageIO";
import {
  createEmptySeatStates,
  DEFAULT_USERS,
  INITIAL_LAYOUT,
} from "../config/layout";
import type { MqttConfig, SeatState, StaySession, User } from "../types";

describe("useSeatAvailability", () => {
  it("returns available users, seated ids, and empty seat flag", () => {
    const seatStates = createEmptySeatStates();
    seatStates[INITIAL_LAYOUT[0].seats[0]] = {
      userId: DEFAULT_USERS[0].id,
      status: "present",
      startedAt: null,
    };

    let snapshot: ReturnType<typeof useSeatAvailability> | null = null;

    const Harness = () => {
      const result = useSeatAvailability({ seatStates, users: DEFAULT_USERS });
      useEffect(() => {
        snapshot = result;
      }, [result]);
      return null;
    };

    render(<Harness />);

    if (!snapshot) throw new Error("useSeatAvailability snapshot missing");
    const value: ReturnType<typeof useSeatAvailability> = snapshot;
    expect(value.seatedUserIds).toEqual([DEFAULT_USERS[0].id]);
    expect(value.availableUsers.map((u: User) => u.id)).toEqual([
      DEFAULT_USERS[1].id,
    ]);
    expect(value.hasEmptySeat).toBe(true);
  });
});

describe("useAdminActions", () => {
  const setup = () => {
    const initialSeats = createEmptySeatStates();
    const snapshot = {
      users: [...DEFAULT_USERS],
      seatStates: { ...initialSeats },
      actions: null as ReturnType<typeof useAdminActions> | null,
      setSeatStates: (() => {}) as React.Dispatch<
        React.SetStateAction<Record<string, SeatState>>
      >,
      endSessionMock: vi.fn(),
      finalizeAllSeatsMock: vi.fn(),
    };

    const Harness = () => {
      const [users, setUsers] = useState<User[]>(() => [...DEFAULT_USERS]);
      const [seatStates, setSeatStates] = useState<Record<string, SeatState>>(
        () => ({ ...initialSeats })
      );
      const actions = useAdminActions({
        setUsers,
        seatStates,
        setSeatStates,
        endSession: snapshot.endSessionMock,
        finalizeAllSeats: snapshot.finalizeAllSeatsMock,
        createEmptySeatStates,
      });

      useEffect(() => {
        snapshot.users = users;
        snapshot.seatStates = seatStates;
        snapshot.actions = actions;
        snapshot.setSeatStates = setSeatStates;
      }, [users, seatStates, actions]);

      return null;
    };

    render(<Harness />);
    return snapshot;
  };

  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("adds a user", () => {
    const snapshot = setup();

    act(() => {
      snapshot.actions?.handleAddUser("New", "Other");
    });

    expect(snapshot.users.some((u) => u.name === "New")).toBe(true);
  });

  it("removes a user and clears their seat", () => {
    const seatId = INITIAL_LAYOUT[0].seats[0];
    const snapshot = setup();

    // place user on seat
    act(() => {
      snapshot.setSeatStates((prev) => ({
        ...prev,
        [seatId]: {
          userId: DEFAULT_USERS[0].id,
          status: "present",
          startedAt: null,
        },
      }));
    });

    act(() => {
      snapshot.actions?.handleRemoveUser(DEFAULT_USERS[0].id);
    });

    expect(
      snapshot.users.find((u) => u.id === DEFAULT_USERS[0].id)
    ).toBeUndefined();
    expect(snapshot.seatStates[seatId].userId).toBeNull();
  });

  it("resets seats when confirmed", () => {
    const snapshot = setup();
    const seatId = INITIAL_LAYOUT[0].seats[0];

    act(() => {
      snapshot.setSeatStates((prev) => ({
        ...prev,
        [seatId]: {
          userId: "Temp",
          status: "present",
          startedAt: null,
        },
      }));
    });

    act(() => {
      snapshot.actions?.handleReset();
    });

    expect(snapshot.seatStates[seatId].userId).toBeNull();
  });
});

describe("useStorageIO", () => {
  it("returns export data and import handler wired to deps", () => {
    const makeExportData = vi.fn(({ sessions, lastResetDate, mqttConfig }) =>
      JSON.stringify({ sessions, lastResetDate, mqttConfig })
    );

    const importHandlerImpl = vi.fn(() => ({ success: true as const }));
    const makeImportHandler = vi.fn(() => importHandlerImpl);

    const payload = {
      sessions: [
        { userId: "u", seatId: "s", start: 1, end: null } as StaySession,
      ],
      lastResetDate: "2024-01-01",
      mqttConfig: {
        serverUrl: "",
        clientName: "",
        clientPassword: "",
      } as MqttConfig,
    };

    let snapshot: {
      exportData: string;
      handleImportData: (raw: string) => unknown;
    } | null = null;

    const Harness = () => {
      const value = useStorageIO({
        makeExportData,
        sessions: payload.sessions,
        lastResetDate: payload.lastResetDate,
        mqttConfig: payload.mqttConfig,
        makeImportHandler,
        importTrackingData: vi.fn(),
        setMqttConfig: vi.fn(),
      });
      useEffect(() => {
        snapshot = value;
      }, [value]);
      return null;
    };

    render(<Harness />);

    if (!snapshot) throw new Error("useStorageIO snapshot missing");
    const value: {
      exportData: string;
      handleImportData: (raw: string) => unknown;
    } = snapshot;

    expect(value.exportData).toContain("lastResetDate");
    expect(makeExportData).toHaveBeenCalledWith({
      sessions: payload.sessions,
      lastResetDate: payload.lastResetDate,
      mqttConfig: payload.mqttConfig,
    });

    value.handleImportData("raw-json");
    expect(makeImportHandler).toHaveBeenCalled();
    expect(importHandlerImpl).toHaveBeenCalledWith("raw-json");
  });
});
