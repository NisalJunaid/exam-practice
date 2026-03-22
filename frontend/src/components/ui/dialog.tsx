import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ className, children, onOpenChange }: { className?: string; children: ReactNode; onOpenChange?: (open: boolean) => void }) {
  return (
    <div className={cn('rounded-3xl border bg-white shadow-2xl', className)}>
      {onOpenChange ? (
        <div className="flex justify-end p-4 pb-0">
          <Button aria-label="Close dialog" className="size-8 rounded-full p-0" onClick={() => onOpenChange(false)} size="sm" type="button" variant="ghost">
            <X className="size-4" />
          </Button>
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function DialogHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid gap-1.5 px-6 pb-4', className)}>{children}</div>
}

export function DialogTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h2 className={cn('text-xl font-semibold tracking-tight', className)}>{children}</h2>
}

export function DialogDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('text-sm text-slate-600', className)}>{children}</p>
}

export function DialogFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-wrap justify-end gap-3 px-6 py-6', className)}>{children}</div>
}
