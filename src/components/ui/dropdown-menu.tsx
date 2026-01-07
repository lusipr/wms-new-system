"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                ROOT & TRIGGER                               */
/* -------------------------------------------------------------------------- */

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/* -------------------------------------------------------------------------- */
/*                                  CONTENT                                    */
/* -------------------------------------------------------------------------- */

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-32 rounded-md border bg-white p-1 text-sm shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName =
  DropdownMenuPrimitive.Content.displayName;

/* -------------------------------------------------------------------------- */
/*                                   ITEM                                      */
/* -------------------------------------------------------------------------- */

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, inset, ...props }: any, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
      "focus:bg-sky-100 focus:text-sky-900",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName =
  DropdownMenuPrimitive.Item.displayName;

/* -------------------------------------------------------------------------- */
/*                               EXPORTS                                        */
/* -------------------------------------------------------------------------- */

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
