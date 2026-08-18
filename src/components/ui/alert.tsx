import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "border px-4 py-3 rounded-lg text-sm",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-gray-50 text-gray-900",
        destructive: "border-red-200 bg-red-50 text-red-900",
        success: "border-brand/20 bg-brand/5 text-brand",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant, className }))}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-gray-600", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle, alertVariants }
