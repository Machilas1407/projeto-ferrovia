import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn("z-50 rounded-xl border bg-white p-4 shadow-md outline-none", className)}
    {...props}
  />
));
PopoverContent.displayName = "PopoverContent";
