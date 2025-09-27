import { cn } from "@/shared/utils";
import * as React from "react";

export interface PairListProps {
  pairs: [string, React.ReactNode | null | undefined][];
  className?: string;
  keyClassName?: string;
  valueClassName?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  alignValues?: "left" | "right" | "center";
  labelWidth?: number;
  noDataPlaceholder?: string;
}

const sizeClasses = {
  sm: {
    container: "gap-2",
    key: "text-xs",
    value: "text-xs",
  },
  md: {
    container: "gap-3",
    key: "text-sm",
    value: "text-sm",
  },
  lg: {
    container: "gap-4",
    key: "text-base",
    value: "text-base",
  },
};

export function PairList({
  pairs,
  className,
  keyClassName,
  valueClassName,
  orientation = "horizontal",
  size = "md",
  alignValues = "left",
  labelWidth = 120,
  noDataPlaceholder = "—",
}: PairListProps) {
  const sizeConfig = sizeClasses[size];

  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col", sizeConfig.container, className)}>
        {pairs.map(([key, value], index) => (
          <div key={index} className="flex flex-col py-1">
            <span
              className={cn(
                sizeConfig.key,
                "font-medium text-black",
                keyClassName
              )}
            >
              {key}
            </span>
            <span
              className={cn(
                sizeConfig.value,
                "text-muted-foreground",
                valueClassName
              )}
            >
              {value ?? noDataPlaceholder}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const getAlignmentClass = () => {
    switch (alignValues) {
      case "right":
        return "justify-between";
      case "center":
        return "justify-center";
      case "left":
      default:
        return "justify-start";
    }
  };

  return (
    <div className={cn("flex flex-col", sizeConfig.container, className)}>
      {pairs.map(([key, value], index) => (
        <div
          key={index}
          className={cn("flex items-center py-1", getAlignmentClass())}
        >
          <span
            className={cn(
              sizeConfig.key,
              "font-medium text-black",
              keyClassName
            )}
            style={{ minWidth: labelWidth }}
          >
            {key}
          </span>
          {alignValues === "right" && <span className="flex-1" />}
          {alignValues === "center" && <span className="mx-2" />}
          <span
            className={cn(
              sizeConfig.value,
              "text-muted-foreground",
              valueClassName
            )}
          >
            {value ?? noDataPlaceholder}
          </span>
        </div>
      ))}
    </div>
  );
}
