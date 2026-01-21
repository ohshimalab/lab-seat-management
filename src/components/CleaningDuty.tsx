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
    <PanelCard tone="dark" className="flex flex-col">
      <div className="border-b border-gray-600 pb-1 mb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-200">🧹 掃除当番</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${thisWeek ? "bg-green-600 shadow-lg border border-green-400" : "bg-gray-700"}`}
        >
          <div className="flex flex-col text-left">
            <span className="text-[16px] font-bold text-white">今週</span>
            <span className="text-xl font-mono font-bold text-white mt-1">
              {thisWeek ? `${thisWeek}さん` : "—"}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center justify-between p-3 rounded-lg ${nextWeek ? "bg-gray-700" : "bg-gray-700"}`}
        >
          <div className="flex flex-col text-left">
            <span className="text-[16px] font-bold text-gray-200">来週</span>
            <span className="text-xl font-mono font-bold text-gray-100 mt-1">
              {nextWeek ? `${nextWeek}さん` : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-gray-500 mt-2">
        {!spreadsheetId || !clientId ? (
          <span>管理 → 設定 → 掃除当番 で設定してください</span>
        ) : !accessToken ? (
          <span>管理画面でサインインしてください</span>
        ) : error ? (
          <span className="text-red-400">エラー: {error}</span>
        ) : (
          ""
        )}
      </div>
    </PanelCard>
  );
};

export default CleaningDuty;
