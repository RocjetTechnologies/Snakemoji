import * as React from "react"

import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          {
            "border border-primary bg-primary text-primary-foreground": variant === "default",
            "border border-foreground/20 bg-white text-foreground shadow-sm hover:bg-muted": variant === "outline",
            "border border-transparent text-foreground hover:bg-muted": variant === "ghost",
          },
          {
            "min-h-9 px-4 py-2": size === "default",
            "min-h-10 rounded-xl px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
