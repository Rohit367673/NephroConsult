import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 shadow-sm transition-all outline-none resize-y",
        "focus-visible:border-[#006f6f] focus-visible:ring-2 focus-visible:ring-[#006f6f]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
