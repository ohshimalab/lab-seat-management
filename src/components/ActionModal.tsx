import React from "react";

interface Props {
  isOpen: boolean;
  seatId: string;
  userName: string;
  onLeave: () => void;
  onClose: () => void;
}

export const ActionModal: React.FC<Props> = ({
  isOpen,
  seatId,
  userName,
  onLeave,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl m-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{seatId} 番席</h2>
        <p className="text-gray-600 mb-8 text-lg">
          <span className="font-bold text-blue-600">{userName}</span> さん
          <br />
          退席しますか？
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onLeave}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors text-lg"
          >
            退席する (磁石を外す)
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
