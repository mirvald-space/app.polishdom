"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useToast } from "./use-toast"

const toastVariants = cva(
  "fixed flex items-center w-auto bg-white border shadow-md rounded-md z-50 p-4",
  {
    variants: {
      variant: {
        default: "bg-white text-black border-gray-200",
        destructive: "bg-red-600 text-white border-red-700",
      },
      position: {
        "top-right": "top-4 right-4",
        "top-center": "top-4 left-1/2 transform -translate-x-1/2",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
        "bottom-left": "bottom-4 left-4",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "top-right",
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string
  description?: React.ReactNode
  onClose?: () => void
}

export function Toast({
  className,
  variant,
  position,
  title,
  description,
  onClose,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant, position }), className)}
      {...props}
    >
      <div className="flex-1">
        {title && <div className="font-medium mb-1">{title}</div>}
        {description && <div className="text-sm">{description}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
          onClose={() => dismiss(toast.id)}
        />
      ))}
    </>
  )
} 