import { cn } from "@/shared/utils";
import * as React from "react";

interface LayoutBodyProps extends React.ComponentProps<"div"> {}

export function LayoutBody({ className, children, ...props }: LayoutBodyProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

