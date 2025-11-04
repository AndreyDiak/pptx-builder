import { cn } from "@/shared/utils";
import * as React from "react";

interface LayoutHeaderProps extends React.ComponentProps<"div"> {}

export function LayoutHeader({
  className,
  children,
  ...props
}: LayoutHeaderProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center mb-4 md:mb-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
