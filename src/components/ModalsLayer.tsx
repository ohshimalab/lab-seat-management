import { UserSelectModal } from "./UserSelectModal";
import { ActionModal } from "./ActionModal";
import { AdminModal } from "./AdminModal";
import { RandomSeatModal } from "./RandomSeatModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { HomeReminderModal } from "./HomeReminderModal";
import type { MqttConfig, StaySession, User, UserCategory } from "../types";

interface LeaderboardRow {
  userId: string;
  name: string;
  seconds: number;
  formatted: string;
  rank: number;
}

interface ModalsLayerProps {
  userSelect: {
    isOpen: boolean;
    users: User[];
    stayDurations: Record<string, string>;
    onSelect: (user: User) => void;
    onClose: () => void;
  };
  action: {
    isOpen: boolean;
    seatId: string;
    userName: string;
    isAway: boolean;
    onToggleAway: () => void;
    onLeave: () => void;
    onClose: () => void;
  };
  admin: {
    isOpen: boolean;
    users: User[];
    reminderTime: string;
    onChangeReminderTime: (value: string) => void;
    onResetReminderDate: () => void;
    reminderDuration: number;
    onChangeReminderDuration: (value: number) => void;
    mqttConfig: MqttConfig;
    onChangeMqttConfig: (config: MqttConfig) => void;
    onAddUser: (name: string, category: UserCategory) => void;
    onRemoveUser: (userId: string) => void;
    sessions: StaySession[];
    onAddSession: (session: {
      userId: string;
      seatId: string;
      start: number;
      end: number | null;
    }) => void;
    onUpdateSession: (
      sessionId: string,
      payload: {
        userId: string;
        seatId: string;
        start: number;
        end: number | null;
      }
    ) => void;
    onRemoveSession: (sessionId: string) => void;
    exportData: string;
    onImportData: (text: string) => { success: boolean; message?: string };
    onClose: () => void;
  };
  randomSeat: {
    isOpen: boolean;
    users: User[];
    selectedUserId: string | null;
    assignedSeatId: string | null;
    hasAnySeat: boolean;
    stayDurations: Record<string, string>;
    onSelectUser: (user: User) => void;
    onClose: () => void;
  };
  leaderboard: {
    isOpen: boolean;
    weekLabel: string;
    rows: LeaderboardRow[];
    users: User[];
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onThisWeek: () => void;
    disableThisWeek: boolean;
    disablePrevWeek: boolean;
    disableNextWeek: boolean;
    onClose: () => void;
  };
  homeReminder: {
    isOpen: boolean;
    autoCloseMs: number;
    onClose: () => void;
  };
}

export const ModalsLayer = ({
  userSelect,
  action,
  admin,
  randomSeat,
  leaderboard,
  homeReminder,
}: ModalsLayerProps) => {
  return (
    <>
      <UserSelectModal
        isOpen={userSelect.isOpen}
        users={userSelect.users}
        stayDurations={userSelect.stayDurations}
        onSelect={userSelect.onSelect}
        onClose={userSelect.onClose}
      />
      <ActionModal
        isOpen={action.isOpen}
        seatId={action.seatId}
        userName={action.userName}
        isAway={action.isAway}
        onToggleAway={action.onToggleAway}
        onLeave={action.onLeave}
        onClose={action.onClose}
      />
      <AdminModal
        isOpen={admin.isOpen}
        users={admin.users}
        reminderTime={admin.reminderTime}
        onChangeReminderTime={admin.onChangeReminderTime}
        onResetReminderDate={admin.onResetReminderDate}
        reminderDuration={admin.reminderDuration}
        onChangeReminderDuration={admin.onChangeReminderDuration}
        mqttConfig={admin.mqttConfig}
        onChangeMqttConfig={admin.onChangeMqttConfig}
        onAddUser={admin.onAddUser}
        onRemoveUser={admin.onRemoveUser}
        sessions={admin.sessions}
        onAddSession={admin.onAddSession}
        onUpdateSession={admin.onUpdateSession}
        onRemoveSession={admin.onRemoveSession}
        exportData={admin.exportData}
        onImportData={admin.onImportData}
        onClose={admin.onClose}
      />
      <RandomSeatModal
        isOpen={randomSeat.isOpen}
        users={randomSeat.users}
        selectedUserId={randomSeat.selectedUserId}
        assignedSeatId={randomSeat.assignedSeatId}
        hasAnySeat={randomSeat.hasAnySeat}
        stayDurations={randomSeat.stayDurations}
        onSelectUser={randomSeat.onSelectUser}
        onClose={randomSeat.onClose}
      />
      <LeaderboardModal
        isOpen={leaderboard.isOpen}
        weekLabel={leaderboard.weekLabel}
        rows={leaderboard.rows}
        users={leaderboard.users}
        onPrevWeek={leaderboard.onPrevWeek}
        onNextWeek={leaderboard.onNextWeek}
        onThisWeek={leaderboard.onThisWeek}
        disableThisWeek={leaderboard.disableThisWeek}
        disablePrevWeek={leaderboard.disablePrevWeek}
        disableNextWeek={leaderboard.disableNextWeek}
        onClose={leaderboard.onClose}
      />
      <HomeReminderModal
        isOpen={homeReminder.isOpen}
        autoCloseMs={homeReminder.autoCloseMs}
        onClose={homeReminder.onClose}
      />
    </>
  );
};
