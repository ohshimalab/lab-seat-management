import { useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import SeatHeatmapModal from "./components/Analytics/SeatHeatmapModal";
import { MainPanels } from "./components/MainPanels";
import { ModalsLayer } from "./components/ModalsLayer";
import { NotificationsLayer } from "./components/NotificationsLayer";
import NotificationModal from "./components/NotificationModal";
import { useStayTracking } from "./hooks/useStayTracking";
import { useNotifications } from "./hooks/useNotifications";
import { useHomeReminder } from "./hooks/useHomeReminder";
import { useEnvTelemetry } from "./hooks/useEnvTelemetry";
import { useLabStorage } from "./hooks/useLabStorage";
import { useSeatDrag } from "./hooks/useSeatDrag";
import { useSeatAssignment } from "./hooks/useSeatAssignment";
import { useAdminActions } from "./hooks/useAdminActions";
import { useStorageIO } from "./hooks/useStorageIO";
import { useSeatAvailability } from "./hooks/useSeatAvailability";
import {
  INITIAL_LAYOUT,
  DEFAULT_USERS,
  createEmptySeatStates,
  normalizeSeatStates,
} from "./config/layout";

function App() {
  const {
    users,
    setUsers,
    seatStates,
    setSeatStates,
    makeExportData,
    makeImportHandler,
  } = useLabStorage({
    defaultUsers: DEFAULT_USERS,
    createEmptySeatStates,
    normalizeSeatStates,
  });

  const { mqttConfig, envTelemetry, handleMqttConfigChange, setMqttConfig } =
    useEnvTelemetry();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);

  const {
    selectedWeekLabel,
    leaderboardRows,
    disablePrevWeek,
    disableNextWeek,
    disableThisWeek,
    stayDurationDisplay,
    hasUserSessionThisWeek,
    startSession,
    endSession,
    addSessionManual,
    updateSession,
    removeSession,
    sessions,
    handlePrevWeek,
    handleNextWeek,
    handleThisWeek,
    lastResetDate,
    importTrackingData,
    nowMs,
    pendingNotifications,
    consumeNotifications,
  } = useStayTracking({
    users,
    seatStates,
    setSeatStates,
    createEmptySeatStates,
  });

  // pending notifications from stay tracking (e.g. strikes)
  const pendingNotes = (pendingNotifications || []) as { text: string }[];

  const { seatedUserIds, availableUsers, hasEmptySeat } = useSeatAvailability({
    seatStates,
    users,
  });

  const hasSeatedUser = seatedUserIds.length > 0;

  const {
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
    combinedOpen,
    combinedName,
    showFirstWeeklyCombined,
    hideFirstWeeklyCombined,
  } = useNotifications();

  const anyNotificationOpen =
    pendingNotes.length > 0 ||
    weeklyGreetingOpen ||
    weekendFarewellOpen ||
    firstArrivalOpen ||
    combinedOpen;

  const aggregatedMessages: string[] = pendingNotes.map((n) => n.text);

  const handleCloseNotifications = () => {
    // consume stay tracking notifications
    consumeNotifications?.();
    hideWeeklyGreeting();
    hideWeekendFarewell();
    hideFirstArrival();
    hideFirstWeeklyCombined();
  };

  const {
    isHomeReminderOpen,
    reminderTime,
    reminderDuration,
    setReminderTime,
    setReminderDuration,
    resetReminderDate,
    closeHomeReminder,
  } = useHomeReminder({ hasSeatedUser });

  const {
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
    closeUserModal,
    closeActionModal,
    closeRandomModal,
    finalizeAllSeats,
    getSelectedUserName,
  } = useSeatAssignment({
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
  });

  const { handleAddUser, handleRemoveUser, handleReset } = useAdminActions({
    setUsers,
    seatStates,
    setSeatStates,
    endSession,
    finalizeAllSeats,
    createEmptySeatStates,
  });

  const {
    draggingSeatId,
    handleSeatDragStart,
    handleSeatDragOver,
    handleSeatDrop,
    handleSeatDragEnd,
  } = useSeatDrag({
    seatStates,
    setSeatStates,
    startSession,
    endSession,
  });

  const { exportData, handleImportData } = useStorageIO({
    makeExportData,
    sessions,
    lastResetDate,
    mqttConfig,
    makeImportHandler,
    importTrackingData,
    setMqttConfig,
  });

  const actionSeatId = selectedSeatId || "";
  const isSelectedSeatAway = selectedSeatId
    ? seatStates[selectedSeatId]?.status === "away"
    : false;

  return (
    <div className="relative h-screen bg-gray-50 p-2 md:p-3 select-none flex flex-col overflow-hidden">
      <HeaderBar
        envTelemetry={envTelemetry}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenRandom={handleOpenRandom}
        onReset={handleReset}
        onReload={() => window.location.reload()}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenHeatmap={() => setIsHeatmapOpen(true)}
      />

      <MainPanels
        layout={INITIAL_LAYOUT}
        seatStates={seatStates}
        users={users}
        draggingSeatId={draggingSeatId}
        sessions={sessions}
        nowMs={nowMs}
        onSeatClick={handleSeatClick}
        onSeatDragStart={handleSeatDragStart}
        onSeatDragOver={handleSeatDragOver}
        onSeatDrop={handleSeatDrop}
        onSeatDragEnd={handleSeatDragEnd}
      />

      <NotificationsLayer
        weeklyGreetingOpen={weeklyGreetingOpen}
        weekendFarewellOpen={weekendFarewellOpen}
        firstArrivalOpen={firstArrivalOpen}
        firstArrivalName={firstArrivalName}
        combinedOpen={combinedOpen}
        combinedName={combinedName}
        onHideWeeklyGreeting={hideWeeklyGreeting}
        onHideWeekendFarewell={hideWeekendFarewell}
        onHideFirstArrival={hideFirstArrival}
        onHideCombined={hideFirstWeeklyCombined}
      />

      <NotificationModal
        isOpen={anyNotificationOpen}
        messages={aggregatedMessages}
        onClose={handleCloseNotifications}
      />

      <ModalsLayer
        userSelect={{
          isOpen: isUserModalOpen,
          users: availableUsers,
          stayDurations: stayDurationDisplay,
          onSelect: handleUserSelect,
          onClose: closeUserModal,
        }}
        action={{
          isOpen: isActionModalOpen,
          seatId: actionSeatId,
          userName: getSelectedUserName(),
          isAway: isSelectedSeatAway,
          onToggleAway: handleToggleAway,
          onLeave: handleLeaveSeat,
          onClose: closeActionModal,
        }}
        admin={{
          isOpen: isAdminModalOpen,
          users,
          reminderTime,
          onChangeReminderTime: setReminderTime,
          onResetReminderDate: resetReminderDate,
          reminderDuration,
          onChangeReminderDuration: setReminderDuration,
          mqttConfig,
          onChangeMqttConfig: handleMqttConfigChange,
          onAddUser: handleAddUser,
          onRemoveUser: handleRemoveUser,
          sessions,
          onAddSession: (session) =>
            addSessionManual(
              session.userId,
              session.seatId,
              session.start,
              session.end
            ),
          onUpdateSession: updateSession,
          onRemoveSession: removeSession,
          exportData,
          onImportData: handleImportData,
          onClose: () => setIsAdminModalOpen(false),
        }}
        randomSeat={{
          isOpen: isRandomModalOpen,
          users: availableUsers,
          selectedUserId: randomUserId,
          assignedSeatId: randomSeatId,
          hasAnySeat: hasEmptySeat || Boolean(randomUserId),
          stayDurations: stayDurationDisplay,
          onSelectUser: handleRandomSelect,
          onClose: closeRandomModal,
        }}
        leaderboard={{
          isOpen: isLeaderboardOpen,
          weekLabel: selectedWeekLabel,
          rows: leaderboardRows,
          users,
          onPrevWeek: handlePrevWeek,
          onNextWeek: handleNextWeek,
          onThisWeek: handleThisWeek,
          disableThisWeek,
          disablePrevWeek,
          disableNextWeek,
          onClose: () => setIsLeaderboardOpen(false),
        }}
        homeReminder={{
          isOpen: isHomeReminderOpen,
          autoCloseMs: reminderDuration * 1000,
          onClose: closeHomeReminder,
        }}
      />

      <SeatHeatmapModal
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        layout={INITIAL_LAYOUT}
        sessions={sessions}
        nowMs={nowMs}
        rangeStartMs={nowMs - 1000 * 60 * 60 * 24}
        rangeEndMs={nowMs}
      />
    </div>
  );
}

export default App;
