import { useMemo } from "react";
import type { MqttConfig, StaySession } from "../types";

interface ExportDeps {
  makeExportData: (args: {
    sessions: StaySession[];
    lastResetDate: string | null;
    mqttConfig: MqttConfig;
  }) => string;
  sessions: StaySession[];
  lastResetDate: string | null;
  mqttConfig: MqttConfig;
}

interface ImportDeps {
  makeImportHandler: (args: {
    importTrackingData: (payload: {
      sessions: StaySession[];
      lastResetDate: string | null;
    }) => void;
    setMqttConfig: (config: MqttConfig) => void;
  }) => (raw: string) => { success: boolean; message?: string };
  importTrackingData: (payload: {
    sessions: StaySession[];
    lastResetDate: string | null;
  }) => void;
  setMqttConfig: (config: MqttConfig) => void;
}

interface Params extends ExportDeps, ImportDeps {}

export const useStorageIO = ({
  makeExportData,
  sessions,
  lastResetDate,
  mqttConfig,
  makeImportHandler,
  importTrackingData,
  setMqttConfig,
}: Params) => {
  const exportData = useMemo(
    () =>
      makeExportData({
        sessions,
        lastResetDate,
        mqttConfig,
      }),
    [makeExportData, sessions, lastResetDate, mqttConfig]
  );

  const handleImportData = useMemo(
    () =>
      makeImportHandler({
        importTrackingData,
        setMqttConfig,
      }),
    [makeImportHandler, importTrackingData, setMqttConfig]
  );

  return { exportData, handleImportData };
};
