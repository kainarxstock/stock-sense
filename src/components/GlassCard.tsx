import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

const base =
  "rounded-2xl border border-white/[0.11] bg-white/[0.07] shadow-[0_1px_0_0_rgba(255,255,255,0.09)_inset] backdrop-blur-xl";

const hoverStyles =
  "transition-[border-color,box-shadow,background-color] duration-300 ease-out hover:border-white/[0.14] hover:bg-white/[0.07]";

export function GlassCard({ children, className = "", hover = false }: Props) {
  return <div className={`${base} ${hover ? hoverStyles : ""} ${className}`.trim()}>{children}</div>;
}
