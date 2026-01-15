import type { ReactNode } from "react";

interface PanelCardProps {
  children: ReactNode;
  className?: string;
}

export const PanelCard = ({ children, className = "" }: PanelCardProps) => {
  return (
    <div
      className={`bg-white p-4 md:p-5 rounded-xl shadow-lg h-full overflow-hidden ${className}`.trim()}
    >
      {children}
    </div>
  );
};
