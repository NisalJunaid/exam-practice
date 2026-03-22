import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
}

const variantIcons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} satisfies Record<ToastVariant, typeof Info>

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = window.setTimeout(() => undefined, 0)
    const nextToast = { ...toast, id }

    setToasts((current) => [...current, nextToast])

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 4000)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 grid w-full max-w-sm gap-3">
        {toasts.map((toast) => {
          const Icon = variantIcons[toast.variant]

          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur',
                variantStyles[toast.variant],
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm opacity-90">{toast.description}</p> : null}
                </div>
                <Button
                  aria-label="Dismiss toast"
                  className="size-8 rounded-full p-0"
                  onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastContext }
