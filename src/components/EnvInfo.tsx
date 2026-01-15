import type { EnvTelemetryState } from "../hooks/useEnvTelemetry";

interface EnvInfoProps {
  envTelemetry: EnvTelemetryState;
}

const formatNumber = (value: number | null) =>
  value === null ? "--" : value.toFixed(1);

export const EnvInfo = ({ envTelemetry }: EnvInfoProps) => {
  const tempDisplay = formatNumber(envTelemetry.temp);
  const humDisplay = formatNumber(envTelemetry.hum);
  const updatedLabel = envTelemetry.updatedAt
    ? new Date(envTelemetry.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-start gap-3 text-xs md:text-sm text-gray-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col gap-0.5 leading-tight">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">🌡️</span>
          <span className="font-mono text-gray-900">{tempDisplay}°C</span>
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
    </div>
  );
};
