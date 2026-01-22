import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export const TooltipProviderPage = ({
  children,
  value,
  className,
  sideOffset,
  align,
  side,
}: {
  className?: string;
  sideOffset?: number;
  children: ReactNode;
  align?: "center" | "end" | "start";
  side?: "top" | "bottom" | "left" | "right";
  value: ReactNode;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "bg-white",
            "border border-[#9291A5]",
            "text-[#9291A5]",
            "shadow-md",
            "rounded-lg",
            "px-3 py-2",
            "-translate-x-14 -translate-y-2"
          )}
        >
          {value}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
