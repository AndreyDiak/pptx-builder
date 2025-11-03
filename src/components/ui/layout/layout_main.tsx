import { cn } from "@/shared/utils";
import * as React from "react";

interface LayoutMainProps extends React.ComponentProps<"div"> {}

export function LayoutMain({ className, children, ...props }: LayoutMainProps) {
  return (
    <div className={cn("w-full p-8 flex justify-center", className)} {...props}>
      <div className="mx-auto w-7xl">{children}</div>
    </div>
  );
}

