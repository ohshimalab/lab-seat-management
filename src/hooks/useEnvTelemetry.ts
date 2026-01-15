import { useEffect, useMemo, useState } from "react";
import mqtt from "mqtt";
import type { MqttConfig } from "../types";

export const DEFAULT_MQTT_CONFIG: MqttConfig = {
  serverUrl: "",
  clientName: "",
  clientPassword: "",
};

const EMPTY_TELEMETRY = {
  temp: null as number | null,
  hum: null as number | null,
  location: "",
  updatedAt: null as number | null,
};

const STORAGE_KEY = "lab-mqtt-config";

export type EnvTelemetryState = {
  temp: number | null;
  hum: number | null;
  location: string;
  updatedAt: number | null;
};

export const useEnvTelemetry = () => {
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<MqttConfig>;
        return {
          ...DEFAULT_MQTT_CONFIG,
          ...parsed,
        };
      } catch {
        return DEFAULT_MQTT_CONFIG;
      }
    }
    return DEFAULT_MQTT_CONFIG;
  });

  const [envTelemetry, setEnvTelemetry] = useState<EnvTelemetryState>({
    ...EMPTY_TELEMETRY,
  });

  const isMqttConfigValid = useMemo(
    () => Boolean(mqttConfig.serverUrl && mqttConfig.clientName),
    [mqttConfig]
  );

  const handleMqttConfigChange = (config: MqttConfig) => {
    setMqttConfig(config);
    if (!config.serverUrl || !config.clientName) {
      setEnvTelemetry({ ...EMPTY_TELEMETRY });
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mqttConfig));
  }, [mqttConfig]);

  useEffect(() => {
    if (!isMqttConfigValid) return;

    let isMounted = true;
    const { serverUrl, clientName } = mqttConfig;
    const normalized = serverUrl.replace(/\s+/g, "");
    const hasProtocol =
      normalized.startsWith("ws://") || normalized.startsWith("wss://");
    const wsUrl = hasProtocol ? normalized : `wss://${normalized}`;
    const clientId = `${clientName}-${Math.random().toString(16).slice(2, 8)}`;

    const client = mqtt.connect(wsUrl, {
      clientId,
      username: clientName,
      password: mqttConfig.clientPassword || undefined,
      reconnectPeriod: 5000,
      clean: true,
    });

    const topic = "ohshimalab/+/+/telemetry";

    const handleMessage = (_topic: string, payload: unknown) => {
      try {
        const text =
          typeof payload === "string"
            ? payload
            : payload instanceof Uint8Array
            ? new TextDecoder().decode(payload)
            : payload instanceof ArrayBuffer
            ? new TextDecoder().decode(new Uint8Array(payload))
            : String(payload);
        const parsed = JSON.parse(text) as {
          meta?: { loc?: string; ts?: number };
          values?: { temp?: number; hum?: number };
        };
        const temp = parsed.values?.temp;
        const hum = parsed.values?.hum;
        if (typeof temp === "number" && typeof hum === "number" && isMounted) {
          setEnvTelemetry({
            temp,
            hum,
            location:
              parsed.meta && typeof parsed.meta.loc === "string"
                ? parsed.meta.loc
                : "",
            updatedAt:
              parsed.meta && typeof parsed.meta.ts === "number"
                ? parsed.meta.ts * 1000
                : Date.now(),
          });
        }
      } catch {
        // ignore malformed payloads
      }
    };

    const handleDisconnect = () => {
      if (isMounted) setEnvTelemetry({ ...EMPTY_TELEMETRY });
    };

    client.on("connect", () => {
      client.subscribe(topic);
    });

    client.on("message", handleMessage);
    client.on("close", handleDisconnect);
    client.on("error", handleDisconnect);

    return () => {
      isMounted = false;
      client.removeListener("message", handleMessage);
      client.removeListener("close", handleDisconnect);
      client.removeListener("error", handleDisconnect);
      client.end(true);
    };
  }, [mqttConfig, isMqttConfigValid]);

  return {
    mqttConfig,
    setMqttConfig,
    envTelemetry,
    isMqttConfigValid,
    handleMqttConfigChange,
  };
};
