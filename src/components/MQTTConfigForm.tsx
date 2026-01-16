import React from "react";
import type { MqttConfig } from "../types";

interface Props {
  mqttConfig: MqttConfig;
  onChangeMqttConfig: (config: MqttConfig) => void;
}

export const MQTTConfigForm: React.FC<Props> = ({
  mqttConfig,
  onChangeMqttConfig,
}) => {
  const handleChange = (field: keyof MqttConfig, value: string | number) => {
    onChangeMqttConfig({ ...mqttConfig, [field]: String(value) });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 bg-blue-50 border border-blue-100 p-3 rounded-lg">
      <div className="text-sm font-semibold text-gray-700">
        環境センサー (MQTT)
      </div>
      <input
        type="text"
        value={mqttConfig.serverUrl}
        onChange={(e) => handleChange("serverUrl", e.target.value)}
        placeholder="wss://broker.example.com"
        className="border-2 border-blue-200 rounded-lg px-3 py-1.5 text-sm md:text-base bg-white focus:border-blue-500 w-full md:w-56"
      />
      <input
        type="text"
        value={mqttConfig.clientName}
        onChange={(e) => handleChange("clientName", e.target.value)}
        placeholder="クライアント名 / ユーザー名"
        className="border-2 border-blue-200 rounded-lg px-3 py-1.5 text-sm md:text-base bg-white focus:border-blue-500 w-full md:w-48"
      />
      <input
        type="password"
        value={mqttConfig.clientPassword}
        onChange={(e) => handleChange("clientPassword", e.target.value)}
        placeholder="パスワード (任意)"
        className="border-2 border-blue-200 rounded-lg px-3 py-1.5 text-sm md:text-base bg-white focus:border-blue-500 w-full md:w-48"
      />
      <span className="text-xs text-gray-600">
        WebSocket ブローカーに接続し、ohshimalab/+/+/telemetry を購読します。
      </span>
    </div>
  );
};

export default MQTTConfigForm;
