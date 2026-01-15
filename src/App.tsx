import { useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { MainPanels } from "./components/MainPanels";
import { ModalsLayer } from "./components/ModalsLayer";
import { NotificationsLayer } from "./components/NotificationsLayer";
import { useStayTracking } from "./hooks/useStayTracking";
import { useNotifications } from "./hooks/useNotifications";
import { useHomeReminder } from "./hooks/useHomeReminder";
import { useEnvTelemetry } from "./hooks/useEnvTelemetry";
import { useLabStorage } from "./hooks/useLabStorage";
import { useSeatDrag } from "./hooks/useSeatDrag";
import { useSeatAssignment } from "./hooks/useSeatAssignment";
import { useSeatViewModel } from "./hooks/useSeatViewModel";
import { useAdminActions } from "./hooks/useAdminActions";
import { useStorageIO } from "./hooks/useStorageIO";
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
    todaySeatTimeline,
  } = useStayTracking({
    users,
    seatStates,
    setSeatStates,
    createEmptySeatStates,
  });

  const { seatedUserIds, availableUsers, hasEmptySeat, seatCards } =
    useSeatViewModel({ seatStates, users, todaySeatTimeline });

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
  } = useNotifications();

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
    <div className="h-screen bg-gray-50 p-2 md:p-3 select-none flex flex-col overflow-hidden">
      <HeaderBar
        envTelemetry={envTelemetry}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenRandom={handleOpenRandom}
        onReset={handleReset}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />
      <MainPanels
        layout={INITIAL_LAYOUT}
        seatStates={seatStates}
        seatCards={seatCards}
        users={users}
        draggingSeatId={draggingSeatId}
        todaySeatTimeline={todaySeatTimeline}
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
        onHideWeeklyGreeting={hideWeeklyGreeting}
        onHideWeekendFarewell={hideWeekendFarewell}
        onHideFirstArrival={hideFirstArrival}
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
    </div>
  );
}

export default App;
