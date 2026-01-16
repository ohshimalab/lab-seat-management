import React, { useState } from "react";

interface Props {
  exportData: string;
  onImportData: (text: string) => { success: boolean; message?: string };
}

export const ImportExportPanel: React.FC<Props> = ({
  exportData,
  onImportData,
}) => {
  const [importText, setImportText] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string>("");

  const handleImport = () => {
    const result = onImportData(importText.trim());
    setImportStatus(result.message || "");
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        データエクスポート / インポート
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            エクスポート (JSON)
          </label>
          <textarea
            aria-label="export-data"
            className="w-full h-40 border border-gray-300 rounded-lg p-2 text-xs font-mono bg-gray-50"
            readOnly
            value={exportData}
          />
          <span className="text-xs text-gray-500">
            テキストをコピーしてバックアップしてください。
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            インポート (JSON貼り付け)
          </label>
          <textarea
            aria-label="import-data"
            className="w-full h-40 border border-gray-300 rounded-lg p-2 text-xs font-mono"
            placeholder="ここにエクスポートしたJSONを貼り付けてください"
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportStatus("");
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-500"
            >
              インポート
            </button>
            {importStatus && (
              <span className="text-xs text-gray-600">{importStatus}</span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            既存データは上書きされます。信頼できるJSONのみ使用してください。
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImportExportPanel;
