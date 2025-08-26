import React from "react";
import { cn } from "lib/utils";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none",
      "placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
