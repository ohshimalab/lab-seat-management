import React from "react";

interface HomeReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseMs?: number;
}

const VIDEO_URL =
  "https://www.youtube.com/embed/_fTITMPnKyc?start=90&autoplay=1";

export const HomeReminderModal: React.FC<HomeReminderModalProps> = ({
  isOpen,
  onClose,
  autoCloseMs = 15000,
}) => {
  React.useEffect(() => {
    if (!isOpen) return undefined;
    const id = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => window.clearTimeout(id);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="text-lg font-bold text-gray-900">
              そろそろ帰宅時間です
            </div>
            <div className="text-sm text-gray-600">音が流れます</div>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-bold text-gray-600 hover:text-gray-900"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <div className="aspect-video bg-black">
          <iframe
            title="Go home reminder"
            src={VIDEO_URL}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};
