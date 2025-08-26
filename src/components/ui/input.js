import React from "react";
import { cn } from "lib/utils";

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none",
      "placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
