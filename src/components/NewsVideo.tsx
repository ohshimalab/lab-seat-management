import React from "react";
import { PanelCard } from "./PanelCard";

const NHK_LIVE_URL =
  "https://www.youtube.com/embed/f0lYkdA-Gtw?autoplay=1&mute=1&playsinline=1";

export const NewsVideo: React.FC = () => {
  return (
    <PanelCard padding="none" className="flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-sm font-bold text-gray-800">NHK News LIVE</div>
        <span className="text-[10px] text-gray-500">
          音声はミュートで自動再生
        </span>
      </div>
      <div className="flex-1 min-h-0 bg-black">
        <iframe
          title="NHK News Live"
          src={NHK_LIVE_URL}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </PanelCard>
  );
};
