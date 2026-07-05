import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

interface PriceChangeProps {
  value: number;
  percent?: number;
  size?: "sm" | "md" | "lg";
  showPercent?: boolean;
  className?: string;
}

export function PriceChange({
  value,
  percent,
  size = "md",
  showPercent = true,
  className,
}: PriceChangeProps) {
  const isPositive = value >= 0;
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-lg font-semibold" }[size];

  return (
    <span
      className={cn(
        sizeClass,
        isPositive ? "text-emerald-400" : "text-red-400",
        className
      )}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(2)}
      {showPercent && percent !== undefined && (
        <span className="ml-1 opacity-80">({formatPercent(percent)})</span>
      )}
    </span>
  );
}
