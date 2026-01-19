import React from "react";

interface Props {
  isOpen: boolean;
  messages: string[];
  onClose: () => void;
  autoCloseMs?: number;
}

export const NotificationModal: React.FC<Props> = ({
  isOpen,
  messages,
  onClose,
  autoCloseMs = 4000,
}) => {
  React.useEffect(() => {
    if (!isOpen) return undefined;
    const id = window.setTimeout(() => onClose(), autoCloseMs);
    return () => window.clearTimeout(id);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="text-lg font-bold text-gray-900">通知</div>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-bold text-gray-600 hover:text-gray-900"
            aria-label="通知ダイアログを閉じる"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          {messages.map((m, i) => (
            <div key={i} className="mb-2 text-gray-800">
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
