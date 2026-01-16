import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";

interface Props {
  isOpen: boolean;
  title?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const ModalShell: React.FC<Props> = ({
  isOpen,
  title,
  onClose,
  children,
  className = "",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const panel = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <FocusLock returnFocus>
        <div
          className={`bg-white rounded-xl p-4 md:p-6 w-full max-w-3xl shadow-2xl m-2 md:m-4 flex flex-col max-h-[85vh] ${className}`}
        >
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 active:scale-95 transition-transform"
            >
              閉じる
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
        </div>
      </FocusLock>
    </div>
  );

  return createPortal(panel, document.body);
};

export default ModalShell;
