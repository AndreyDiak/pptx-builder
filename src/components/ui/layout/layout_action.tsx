import { cn } from "@/shared/utils";
import * as React from "react";

interface LayoutActionProps extends React.ComponentProps<"div"> {}

export function LayoutAction({ className, children, ...props }: LayoutActionProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

