import * as PhIcons from "@phosphor-icons/react";
import type { Icon as PhIcon, IconWeight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
};

export interface IconProps {
  name: keyof typeof PhIcons | PhIcon;
  size?: IconSize | number;
  weight?: IconWeight;
  className?: string;
  color?: string;
  "aria-label"?: string;
}

export function Icon({
  name,
  size = "md",
  weight = "bold",
  className,
  color,
  ...rest
}: IconProps) {
  const Cmp = (typeof name === "string" ? (PhIcons as any)[name] : name) as PhIcon | undefined;
  if (!Cmp) {
    if (import.meta.env.DEV) console.warn(`[Icon] missing: ${String(name)}`);
    return null;
  }
  const px = typeof size === "number" ? size : sizeMap[size];
  return (
    <Cmp
      size={px}
      weight={weight}
      color={color}
      className={cn("shrink-0", className)}
      {...rest}
    />
  );
}

export default Icon;
