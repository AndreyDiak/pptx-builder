import { cn } from "@/shared/utils";
import * as React from "react";

interface LayoutTitleProps extends React.ComponentProps<"div"> {}

export function LayoutTitle({ className, children, ...props }: LayoutTitleProps) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  );
}

