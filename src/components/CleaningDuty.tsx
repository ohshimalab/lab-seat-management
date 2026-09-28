import React, { useEffect, useState } from "react";
import { PanelCard } from "./PanelCard";

const LS_SPREADSHEET = "cleaningDuty.spreadsheetId";
const LS_CLIENT_ID = "cleaningDuty.clientId";
const LS_TOKEN = "cleaningDuty.accessToken";

const CleaningDuty: React.FC = () => {
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    localStorage.getItem(LS_SPREADSHEET),
  );
  const [clientId, setClientId] = useState<string | null>(
    localStorage.getItem(LS_CLIENT_ID),
  );

  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem(LS_TOKEN),
  );

  const [thisWeek, setThisWeek] = useState<string | null>(null);
  const [nextWeek, setNextWeek] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const onTokenChange = () => setAccessToken(localStorage.getItem(LS_TOKEN));
    const onConfigChange = () => {
      setSpreadsheetId(localStorage.getItem(LS_SPREADSHEET));
      setClientId(localStorage.getItem(LS_CLIENT_ID));
    };

    window.addEventListener("cleaningDutyTokenChanged", onTokenChange);
    window.addEventListener("storage", onTokenChange);
    window.addEventListener("cleaningDutyConfigChanged", onConfigChange);
    window.addEventListener("storage", onConfigChange);
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      window.removeEventListener("cleaningDutyTokenChanged", onTokenChange);
      window.removeEventListener("storage", onTokenChange);
      window.removeEventListener("cleaningDutyConfigChanged", onConfigChange);
      window.removeEventListener("storage", onConfigChange);
      clearInterval(interval);
    };
  }, []);

  const fetchNames = async () => {
    setError(null);
    if (!spreadsheetId) return setError("spreadsheetId not configured");
    if (!accessToken) return setError("not signed in");
    setLoading(true);
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId,
      )}/values/A1:A2?majorDimension=ROWS`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`fetch error ${res.status}: ${txt}`);
      }
      const data = await res.json();
      const values: string[][] = (data.values as string[][]) || [];
      setThisWeek(values[0] && values[0][0] ? String(values[0][0]) : null);
      setNextWeek(values[1] && values[1][0] ? String(values[1][0]) : null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && spreadsheetId) {
      fetchNames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, spreadsheetId]);

  return (
    <PanelCard tone="dark" padding="sm" className="flex flex-col">
      <div className="border-b border-gray-700 pb-1 mb-1.5 flex justify-between items-center">
        <h3 className="text-base md:text-lg font-bold text-gray-200">
          🧹 掃除当番
        </h3>
        {!spreadsheetId || !clientId ? (
          <span className="text-[10px] text-gray-400">
            設定 → 掃除当番 で設定
          </span>
        ) : !accessToken ? (
          <span className="text-[10px] text-amber-400">
            要サインイン
          </span>
        ) : error ? (
          <span className="text-[10px] text-red-400">エラー: {error}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          className={`flex items-center justify-between px-3 py-1.5 md:py-2 rounded-lg ${
            thisWeek
              ? "bg-green-600 shadow-md border border-green-400"
              : "bg-gray-700"
          }`}
        >
          <div className="flex flex-col text-left">
            <span className="text-[11px] md:text-xs font-bold text-gray-200">今週</span>
            <span className="text-base md:text-lg font-mono font-bold text-white">
              {thisWeek ? `${thisWeek}さん` : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 md:py-2 rounded-lg bg-gray-700">
          <div className="flex flex-col text-left">
            <span className="text-[11px] md:text-xs font-bold text-gray-300">来週</span>
            <span className="text-base md:text-lg font-mono font-bold text-gray-100">
              {nextWeek ? `${nextWeek}さん` : "—"}
            </span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
};

export default CleaningDuty;
