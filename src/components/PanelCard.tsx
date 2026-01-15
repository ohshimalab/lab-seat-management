import type { ReactNode } from "react";

interface PanelCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
  scroll?: "none" | "y";
  tone?: "default" | "dark";
}

export const PanelCard = ({
  children,
  className = "",
  padding = "md",
  scroll = "none",
  tone = "default",
}: PanelCardProps) => {
  const paddingClass =
    padding === "none" ? "p-0" : padding === "sm" ? "p-3 md:p-4" : "p-4 md:p-5";

  const scrollClass = scroll === "y" ? "overflow-y-auto" : "overflow-hidden";

  const toneClass =
    tone === "dark"
      ? "bg-gray-800 text-white shadow-xl"
      : "bg-white text-gray-900 shadow-lg";

  return (
    <div
      className={`${toneClass} ${paddingClass} ${scrollClass} rounded-xl h-full ${className}`.trim()}
    >
      {children}
    </div>
  );
};
