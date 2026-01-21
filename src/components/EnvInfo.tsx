import React, { useState } from "react";
import type { EnvTelemetryState } from "../hooks/useEnvTelemetry";
import ModalShell from "./ModalShell";

interface EnvInfoProps {
  envTelemetry: EnvTelemetryState;
  tempThresholds?: { high: number; low: number };
}

const formatNumber = (value: number | null) =>
  value === null ? "--" : value.toFixed(1);

export const EnvInfo = ({ envTelemetry, tempThresholds }: EnvInfoProps) => {
  const tempDisplay = formatNumber(envTelemetry.temp);
  const humDisplay = formatNumber(envTelemetry.hum);
  const updatedLabel = envTelemetry.updatedAt
    ? new Date(envTelemetry.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const thresholds = { high: 26.0, low: 20.0, ...(tempThresholds ?? {}) };

  const tempClass = (() => {
    if (envTelemetry.temp === null) return "font-mono text-gray-900";
    if (envTelemetry.temp >= thresholds.high)
      return "font-mono font-bold text-red-600 twinkle-strong";
    if (envTelemetry.temp <= thresholds.low)
      return "font-mono font-bold text-blue-600 twinkle-strong";
    return "font-mono text-gray-900";
  })();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"hot" | "cold" | null>(null);

  const handleTempClick = () => {
    if (envTelemetry.temp === null) return;
    if (envTelemetry.temp >= thresholds.high) {
      setAlertMessage("暑すぎ注意!");
      setAlertType("hot");
      setAlertOpen(true);
      return;
    }
    if (envTelemetry.temp <= thresholds.low) {
      setAlertMessage("寒すぎ注意!");
      setAlertType("cold");
      setAlertOpen(true);
      return;
    }
  };

  const tempInteractive =
    envTelemetry.temp !== null &&
    (envTelemetry.temp >= thresholds.high ||
      envTelemetry.temp <= thresholds.low);

  return (
    <div className="flex items-start gap-3 text-xs md:text-sm text-gray-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col gap-0.5 leading-tight">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">🌡️</span>
          <span
            className={tempClass + (tempInteractive ? " cursor-pointer" : "")}
            role={tempInteractive ? "button" : undefined}
            tabIndex={tempInteractive ? 0 : undefined}
            onClick={tempInteractive ? handleTempClick : undefined}
            onKeyDown={
              tempInteractive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleTempClick();
                    }
                  }
                : undefined
            }
          >
            {tempDisplay}°C
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">💧</span>
          <span className="font-mono text-gray-900">{humDisplay}%</span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 leading-tight text-[11px] text-gray-500">
        {envTelemetry.location && <span>({envTelemetry.location})</span>}
        {updatedLabel && (
          <span className="text-gray-400">更新 {updatedLabel}</span>
        )}
      </div>

      <ModalShell
        isOpen={alertOpen}
        title="注意"
        onClose={() => {
          setAlertOpen(false);
          setAlertType(null);
        }}
      >
        <div
          className={`p-4 rounded-md ${alertType === "hot" ? "bg-red-600 text-white" : alertType === "cold" ? "bg-blue-600 text-white" : "bg-white"}`}
        >
          <div className="flex flex-col gap-3 items-center">
            <p className="text-2xl font-bold">{alertMessage}</p>
            <p className="text-sm opacity-90">現在の温度: {tempDisplay}°C</p>
          </div>
        </div>
      </ModalShell>
    </div>
  );
};
