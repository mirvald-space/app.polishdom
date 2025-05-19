"use client"

import { createContext, useContext, useState } from "react"

const TOAST_REMOVE_DELAY = 3000

type ToastActionElement = React.ReactElement<any, string | React.JSXElementConstructor<any>>
type ToastProps = {
  id: string
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

type ToastContextProps = {
  toasts: ToastProps[]
  addToast: (props: Omit<ToastProps, "id">) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextProps>({
  toasts: [],
  addToast: () => {},
  dismissToast: () => {},
})

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast должен использоваться внутри ToastProvider")
  }

  const { toasts, addToast, dismissToast } = context

  function toast(props: Omit<ToastProps, "id">) {
    const id = Math.random().toString(36).substring(2, 9)
    addToast({ ...props, id })

    // Автоматически удаляем уведомление после задержки
    setTimeout(() => {
      dismissToast(id)
    }, TOAST_REMOVE_DELAY)
  }

  return {
    toast,
    dismiss: dismissToast,
    toasts,
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
} 